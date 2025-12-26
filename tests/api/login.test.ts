import { beforeEach, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import { NextRequest } from "next/server";

vi.mock("@/lib/supabase/server", () => ({
  getSupabaseServerClient: vi.fn()
}));

import { getSupabaseServerClient } from "@/lib/supabase/server";
import { POST } from "@/app/api/v1/login/route";

type DbUserRow = {
  id: string;
  name: string;
  email?: string | null;
  status?: string | number | boolean | null;
  rule?: string | number | null;
  password?: string | null;
  password_hash?: string | null;
};

function mockSupabaseUser(user: DbUserRow | null, error: { message?: string } | null = null) {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: user, error })
  };

  const client = {
    from: vi.fn().mockReturnValue(query)
  };

  (getSupabaseServerClient as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(client);
  return { client, query };
}

function makeRequest(body: unknown, ip = "1.2.3.4") {
  return new NextRequest("http://localhost/api/v1/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": ip
    },
    body: JSON.stringify(body)
  });
}

beforeEach(() => {
  process.env.JWT_SECRET = "test-secret";
  delete (globalThis as unknown as Record<string, unknown>).__login_rate_limit_store__;
  vi.clearAllMocks();
});

describe("/api/v1/login", () => {
  it("正常登录返回用户信息与 token", async () => {
    const plain = "password123";
    const hash = bcrypt.hashSync(plain, 10);
    mockSupabaseUser({
      id: "u_1",
      name: "alice",
      email: "alice@example.com",
      status: "active",
      rule: "admin",
      password_hash: hash
    });

    const res = await POST(makeRequest({ name: "alice", password: plain }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.token).toMatch(/\./);
    expect(json.data.user).toMatchObject({
      id: "u_1",
      name: "alice",
      email: "alice@example.com",
      rule: "admin"
    });
    expect("password" in json.data.user).toBe(false);
    expect("password_hash" in json.data.user).toBe(false);
  });

  it("错误密码返回无效凭证", async () => {
    const hash = bcrypt.hashSync("other", 10);
    mockSupabaseUser({
      id: "u_1",
      name: "alice",
      email: "alice@example.com",
      status: "active",
      rule: "admin",
      password_hash: hash
    });

    const res = await POST(makeRequest({ name: "alice", password: "password123" }));
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("无效凭证。");
    expect(json.code).toBe("INVALID_CREDENTIALS");
  });

  it("禁用账户返回账户已禁用", async () => {
    const plain = "password123";
    const hash = bcrypt.hashSync(plain, 10);
    mockSupabaseUser({
      id: "u_1",
      name: "alice",
      email: "alice@example.com",
      status: "disabled",
      rule: "admin",
      password_hash: hash
    });

    const res = await POST(makeRequest({ name: "alice", password: plain }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("账户已禁用。");
    expect(json.code).toBe("ACCOUNT_DISABLED");
  });

  it("超过速率限制返回 429", async () => {
    const plain = "password123";
    const hash = bcrypt.hashSync(plain, 10);
    mockSupabaseUser({
      id: "u_1",
      name: "alice",
      email: "alice@example.com",
      status: "active",
      rule: "admin",
      password_hash: hash
    });

    const ip = "9.9.9.9";
    let lastStatus = 0;
    for (let i = 0; i < 11; i += 1) {
      const res = await POST(makeRequest({ name: "alice", password: plain }, ip));
      lastStatus = res.status;
    }
    expect(lastStatus).toBe(429);
  });
});
