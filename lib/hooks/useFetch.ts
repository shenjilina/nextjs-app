"use client";

import { useCallback, useMemo, useRef, useState } from "react";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpError = {
  name: string;
  message: string;
  status?: number;
  details?: unknown;
};

export type FetchClientOptions = {
  baseUrl?: string;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
};

export type RequestOptions = {
  path: string;
  method?: HttpMethod;
  query?: Record<string, string | number | boolean | null | undefined>;
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  retryDelayMs?: number;
  signal?: AbortSignal;
};

export type UseFetchOptions = FetchClientOptions;

export type UseFetchResult<T = unknown> = {
  request: (opts: RequestOptions) => Promise<T>;
  get: (path: string, opts?: Omit<RequestOptions, "path" | "method" | "body">) => Promise<T>;
  post: (
    path: string,
    body?: unknown,
    opts?: Omit<RequestOptions, "path" | "method">
  ) => Promise<T>;
  put: (path: string, body?: unknown, opts?: Omit<RequestOptions, "path" | "method">) => Promise<T>;
  patch: (
    path: string,
    body?: unknown,
    opts?: Omit<RequestOptions, "path" | "method">
  ) => Promise<T>;
  del: (path: string, opts?: Omit<RequestOptions, "path" | "method" | "body">) => Promise<T>;
  abort: () => void;
  loading: boolean;
  error: HttpError | null;
};

function isJsonResponse(contentType: string | null): boolean {
  return Boolean(contentType && contentType.toLowerCase().includes("application/json"));
}

function buildQuery(params?: RequestOptions["query"]): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    sp.append(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function normalizeError(e: unknown, status?: number): HttpError {
  if (e && typeof e === "object" && "name" in e && "message" in e) {
    return { name: (e as any).name ?? "Error", message: (e as any).message ?? "Error", status };
  }
  return { name: "Error", message: typeof e === "string" ? e : "Request failed", status };
}

async function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useFetch<T = unknown>(options?: UseFetchOptions): UseFetchResult<T> {
  const {
    baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "",
    headers: defaultHeaders = {},
    timeoutMs = 10000,
    retries = 0,
    retryDelayMs = 300
  } = options || {};

  const controllersRef = useRef<Map<string, AbortController>>(new Map());
  const inflightRef = useRef(0);
  // 请求合并池：使用 URL + method 作为键，合并同时发起的相同请求
  type PendingEntry = { promise: Promise<any>; timer: ReturnType<typeof setTimeout> | null };
  const poolRef = useRef<Map<string, PendingEntry>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<HttpError | null>(null);

  const baseInitHeaders = useMemo(
    () => ({
      accept: "application/json",
      ...defaultHeaders
    }),
    [defaultHeaders]
  );

  const perform = useCallback(
    async (opts: RequestOptions): Promise<T> => {
      const method: HttpMethod = opts.method ?? "GET";
      const qs = buildQuery(opts.query);
      const url = `${baseUrl}${opts.path}${qs}`;
      const key = `${method} ${url}`;
      // 若存在相同请求正在进行，直接返回同一个 Promise
      const existing = poolRef.current.get(key);
      if (existing) return existing.promise as Promise<T>;

      const controller = new AbortController();
      controllersRef.current.set(key, controller);
      const signal = opts.signal ?? controller.signal;

      const timeout = opts.timeoutMs ?? timeoutMs;
      const retriesMax = opts.retries ?? retries;
      const backoff = opts.retryDelayMs ?? retryDelayMs;

      const initHeaders: Record<string, string> = { ...baseInitHeaders, ...opts.headers };
      const isBodyJson =
        method !== "GET" && opts.body !== undefined && !(opts.body instanceof FormData);
      if (isBodyJson)
        initHeaders["content-type"] = initHeaders["content-type"] ?? "application/json";

      inflightRef.current += 1;
      setLoading(true);
      setError(null);

      let attempt = 0;
      const ttlEstimate = (timeout || 0) + (retriesMax + 1) * backoff + 1000;

      const promise = (async () => {
        // eslint-disable-next-line no-constant-condition
        while (true) {
          try {
            const timeoutId = timeout
              ? setTimeout(() => {
                  controller.abort();
                }, timeout)
              : undefined;
            const res = await fetch(url, {
              method,
              headers: initHeaders,
              body: isBodyJson ? JSON.stringify(opts.body) : (opts.body as any),
              signal,
              credentials: "same-origin"
            });
            if (timeoutId) clearTimeout(timeoutId);

            const ct = res.headers.get("content-type");
            let payload: any;
            if (isJsonResponse(ct)) payload = await res.json();
            else payload = await res.text();

            if (!res.ok) {
              const err = normalizeError(payload?.error || payload, res.status);
              if (res.status >= 500 && attempt < retriesMax) {
                attempt++;
                await delay(backoff * attempt);
                continue;
              }
              throw err;
            }

            setLoading(false);
            return payload as T;
          } catch (e) {
            const err = normalizeError(e);
            const isAbort = (e as any)?.name === "AbortError";
            const isNetwork = !isAbort && !(e as any)?.status;
            if ((isNetwork || isAbort) && attempt < retriesMax) {
              attempt++;
              await delay(backoff * attempt);
              continue;
            }
            setLoading(false);
            setError(err);
            throw err;
          }
        }
      })();

      // 放入合并池，并设置兜底过期清理，避免内存泄漏
      const expireTimer = setTimeout(
        () => {
          poolRef.current.delete(key);
          controllersRef.current.delete(key);
        },
        Math.max(ttlEstimate, 5000)
      );
      poolRef.current.set(key, { promise, timer: expireTimer });

      // 请求结束后清理
      promise.finally(() => {
        const entry = poolRef.current.get(key);
        if (entry?.timer) clearTimeout(entry.timer);
        poolRef.current.delete(key);
        controllersRef.current.delete(key);
        inflightRef.current = Math.max(0, inflightRef.current - 1);
        setLoading(inflightRef.current > 0);
      });

      return promise;
    },
    [baseUrl, baseInitHeaders, retries, retryDelayMs, timeoutMs]
  );

  const request = useCallback((opts: RequestOptions) => perform(opts), [perform]);

  const get = useCallback(
    (path: string, opts?: Omit<RequestOptions, "path" | "method" | "body">) =>
      request({ ...(opts || {}), path, method: "GET" }),
    [request]
  );
  const post = useCallback(
    (path: string, body?: unknown, opts?: Omit<RequestOptions, "path" | "method">) =>
      request({ ...(opts || {}), path, method: "POST", body }),
    [request]
  );
  const put = useCallback(
    (path: string, body?: unknown, opts?: Omit<RequestOptions, "path" | "method">) =>
      request({ ...(opts || {}), path, method: "PUT", body }),
    [request]
  );
  const patch = useCallback(
    (path: string, body?: unknown, opts?: Omit<RequestOptions, "path" | "method">) =>
      request({ ...(opts || {}), path, method: "PATCH", body }),
    [request]
  );
  const del = useCallback(
    (path: string, opts?: Omit<RequestOptions, "path" | "method" | "body">) =>
      request({ ...(opts || {}), path, method: "DELETE" }),
    [request]
  );

  const abort = useCallback(() => {
    controllersRef.current.forEach((c) => c.abort());
    controllersRef.current.clear();
    inflightRef.current = 0;
    setLoading(false);
  }, []);

  return { request, get, post, put, patch, del, abort, loading, error };
}

export default useFetch;
