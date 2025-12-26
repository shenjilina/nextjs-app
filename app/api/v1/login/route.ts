import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { createHmac } from "crypto";
import { logger } from "@/lib/logger";
import { getSupabaseServerClient } from "@/lib/supabase/server";

type LoginBody = {
  name: string;
  password: string;
};

type DbUserRow = {
  id: string;
  name: string;
  email?: string | null;
  status?: string | number | boolean | null;
  rule?: string | number | null;
  password?: string | null;
  password_hash?: string | null;
};

type RateLimitState = {
  count: number;
  resetAt: number;
};

const loginSchema = z
  .object({
    name: z.string().min(1).max(64),
    password: z.string().min(6).max(128),
    username: z.string().min(1).max(64).optional(),
    email: z.string().email().optional()
  })
  .transform((v) => ({
    name: (v.name || v.username || v.email || "").trim(),
    password: v.password
  }))
  .refine((v) => v.name.length > 0, { path: ["name"], message: "name is required" });

const RATE_LIMIT_STORE_KEY = "__login_rate_limit_store__";
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 10;

function getRateLimitStore(): Map<string, RateLimitState> {
  const g = globalThis as unknown as Record<string, unknown>;
  const existing = g[RATE_LIMIT_STORE_KEY];
  if (existing && existing instanceof Map) return existing as Map<string, RateLimitState>;
  const created = new Map<string, RateLimitState>();
  g[RATE_LIMIT_STORE_KEY] = created;
  return created;
}

function base64UrlEncode(input: string | Uint8Array): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  return buf.toString("base64").replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function signJwtHs256(payload: Record<string, unknown>, secret: string): string {
  const header = { alg: "HS256", typ: "JWT" };
  const headerB64 = base64UrlEncode(JSON.stringify(header));
  const payloadB64 = base64UrlEncode(JSON.stringify(payload));
  const data = `${headerB64}.${payloadB64}`;
  const sig = createHmac("sha256", secret).update(data).digest();
  const sigB64 = base64UrlEncode(sig);
  return `${data}.${sigB64}`;
}

function getClientIp(request: NextRequest): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]?.trim() || "unknown";
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

function normalizeStatusActive(status: DbUserRow["status"]): boolean {
  if (status === null || status === undefined) return true;
  if (typeof status === "boolean") return status;
  if (typeof status === "number") return status === 1;
  const s = String(status).trim().toLowerCase();
  return ["1", "true", "active", "enabled", "normal", "ok"].includes(s);
}

function normalizeRule(rule: DbUserRow["rule"]): string | null {
  if (rule === null || rule === undefined) return null;
  const s = String(rule).trim();
  return s.length ? s : null;
}

function jsonSuccess<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status, headers: { "cache-control": "no-store" } }
  );
}

function jsonError(message: string, status: number, code: string) {
  return NextResponse.json(
    { success: false, error: message, code },
    { status, headers: { "cache-control": "no-store" } }
  );
}

function jsonRateLimited(retryAfterSeconds: number) {
  return NextResponse.json(
    { success: false, error: "请求过于频繁，请稍后重试。", code: "RATE_LIMITED" },
    {
      status: 429,
      headers: {
        "cache-control": "no-store",
        "retry-after": String(Math.max(1, Math.ceil(retryAfterSeconds)))
      }
    }
  );
}

function checkRateLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const store = getRateLimitStore();
  const now = Date.now();
  const entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { ok: true };
  }
  if (entry.count >= RATE_LIMIT_MAX) {
    return { ok: false, retryAfterSeconds: Math.max(0, (entry.resetAt - now) / 1000) };
  }
  entry.count += 1;
  store.set(key, entry);
  return { ok: true };
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rate = checkRateLimit(`ip:${ip}`);
  if (!rate.ok) {
    logger.info("login rate limited", { ip });
    return jsonRateLimited(rate.retryAfterSeconds);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("请求体不是有效的 JSON。", 400, "BAD_REQUEST");
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      { success: false, error: "参数校验失败。", code: "VALIDATION_FAILED", details: { errors } },
      { status: 400, headers: { "cache-control": "no-store" } }
    );
  }

  const { name, password } = parsed.data satisfies LoginBody;

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    logger.error("missing JWT_SECRET", { route: "/api/v1/login" });
    return jsonError("服务端配置错误。", 500, "INTERNAL_ERROR");
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data, error } = await supabase
      .from("users")
      .select("id,name,email,status,rule,password,password_hash")
      .eq("name", name)
      .limit(1)
      .maybeSingle();

    if (error) {
      logger.error("login db query failed", { ip, name, error: String(error.message ?? error) });
      return jsonError("服务端错误。", 500, "INTERNAL_ERROR");
    }

    if (!data) {
      logger.info("login invalid credential (no user)", { ip, name });
      return jsonError("无效凭证。", 401, "INVALID_CREDENTIALS");
    }

    const user = data as unknown as DbUserRow;

    if (!normalizeStatusActive(user.status)) {
      logger.info("login disabled account", { ip, name, userId: user.id });
      return jsonError("账户已禁用。", 403, "ACCOUNT_DISABLED");
    }

    const permission = normalizeRule(user.rule);
    if (!permission) {
      logger.info("login forbidden (missing rule)", { ip, name, userId: user.id });
      return jsonError("权限不足。", 403, "FORBIDDEN");
    }

    const passwordHash = user.password_hash ?? user.password;
    if (!passwordHash) {
      logger.error("login user missing password hash", { ip, name, userId: user.id });
      return jsonError("服务端错误。", 500, "INTERNAL_ERROR");
    }

    const ok = await bcrypt.compare(password, passwordHash);
    if (!ok) {
      logger.info("login invalid credential (bad password)", { ip, name, userId: user.id });
      return jsonError("无效凭证。", 401, "INVALID_CREDENTIALS");
    }

    const now = Math.floor(Date.now() / 1000);
    const exp = now + 60 * 60 * 24;
    const token = signJwtHs256(
      {
        sub: user.id,
        name: user.name,
        rule: permission,
        iat: now,
        exp
      },
      secret
    );

    logger.info("login success", { ip, userId: user.id, name: user.name, rule: permission });

    return jsonSuccess(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email ?? null,
          status: user.status ?? null,
          rule: permission
        },
        token
      },
      200
    );
  } catch (e) {
    logger.error("login unexpected error", {
      ip,
      name,
      error: e instanceof Error ? e.message : String(e)
    });
    return jsonError("服务端错误。", 500, "INTERNAL_ERROR");
  }
}
