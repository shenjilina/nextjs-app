import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { USERS } from "../../../../lib/db/users";
import type { User } from "../../../../types/users";
import { validationError, successResponse, internalError } from "../../../../lib/api/response";

const loginSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).optional()
});

type LoginBody = z.infer<typeof loginSchema>;

type LoginSuccess = {
  success: true;
  userId: string;
  token: string;
};

type LoginFailure = {
  success: false;
  error: string;
};

type LoginResponse = LoginSuccess | LoginFailure;

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `u_${crypto.randomUUID()}`;
  }
  return `u_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function generateToken(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `token_${crypto.randomUUID()}`;
  }
  return `token_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function findUserByEmail(email: string): User | undefined {
  return USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

function ensureToken(user: User): string {
  if (user.token && user.token.length > 0) return user.token;
  const token = generateToken();
  user.token = token;
  return token;
}

export async function POST(request: NextRequest): Promise<NextResponse<LoginResponse>> {
  try {
    const json = (await request.json()) as unknown;
    const result = loginSchema.safeParse(json);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      return validationError(errors);
    }

    const body: LoginBody = result.data;
    const email = body.email.trim();

    const user = findUserByEmail(email);

    if (!user) {
      const id = generateId();
      const token = generateToken();
      const name = body.name?.trim() || email.split("@")[0] || "User";

      const newUser: User = {
        id,
        name,
        email,
        plan: "free",
        language: "zh",
        theme: "light",
        token
      };

      USERS.push(newUser);

      return successResponse(
        {
          success: true,
          userId: newUser.id,
          token: newUser.token as string
        },
        201
      );
    }

    const token = ensureToken(user);

    return successResponse(
      {
        success: true,
        userId: user.id,
        token
      },
      200
    );
  } catch {
    return internalError();
  }
}
