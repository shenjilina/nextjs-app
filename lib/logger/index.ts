export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => console.log("[INFO]", message, meta),
  error: (message: string, meta?: Record<string, unknown>) =>
    console.error("[ERROR]", message, meta)
};
// 生产环境可替换为 Winston / Pino
