import { NextResponse } from "next/server";

// ✅ 成功响应
export function successResponse<T>(
  data: T,
  status = 200,
  message?: string
): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data, message }, { status });
}

// ❌ 通用错误响应（内部使用）
function errorResponse(
  message: string,
  status: number,
  code?: string,
  details?: Record<string, unknown>
): NextResponse<ApiResponse> {
  return NextResponse.json({ success: false, error: message, code, details }, { status });
}

// 🔴 具体错误类型封装（语义化）
export const badRequest = (message = "Bad Request", details?: Record<string, unknown>) =>
  errorResponse(message, 400, "BAD_REQUEST", details);

export const unauthorized = (message = "Unauthorized") =>
  errorResponse(message, 401, "UNAUTHORIZED");

export const forbidden = (message = "Forbidden") => errorResponse(message, 403, "FORBIDDEN");

export const notFound = (message = "Not Found") => errorResponse(message, 404, "NOT_FOUND");

export const conflict = (message = "Conflict") => errorResponse(message, 409, "CONFLICT");

export const internalError = (message = "Internal Server Error") =>
  errorResponse(message, 500, "INTERNAL_ERROR");

// ⚠️ 参数校验错误（常用于 Zod）
export const validationError = (errors: Record<string, string[]>) =>
  badRequest("Validation failed", { errors });
