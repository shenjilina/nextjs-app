## 项目技术栈

- 框架：Next.js 15（App Router，目录为 `app/`）
- 语言：TypeScript（`strict: true`，不输出产物 `noEmit: true`）
- UI：React 19 + Tailwind CSS v4 + Radix UI + shadcn/ui（`components/ui/`）
- 状态：Zustand（`lib/stores/`）
- 主题：`next-themes`（全局 Provider 位于 `app/providers.tsx`）
- 国际化：`I18nProvider`（`lib/i18n.tsx`，语言包在 `locales/`）
- 测试：Vitest（测试文件放在 `tests/`，配置见 `vitest.config.ts`）
- 规范：ESLint（`next/core-web-vitals` + `prettier`），Prettier（见 `prettier.config.js`）

## 目录与职责

- 路由与页面：`app/**/page.tsx`、`app/**/layout.tsx`、`app/**/loading.tsx`、`app/**/error.tsx`、`app/**/not-found.tsx`
- API（Route Handlers）：`app/api/**/route.ts`，导出 `GET/POST/PUT/PATCH/DELETE`
- 通用组件：
  - 基础 UI：`components/ui/`（shadcn/ui + Radix）
  - 业务/复合组件：`components/`、以及路由下的 `app/**/components/`
  - AI 相关组件：`components/ai-elements/`
- 业务与基础能力：`lib/`
  - API 响应封装：`lib/api/response.ts`
  - hooks：`lib/hooks/`
  - 状态仓库：`lib/stores/`
  - 工具与样式：`lib/utils.ts`、`lib/utils/**`
  - 日志：`lib/logger/`
  - 伪数据/DB：`lib/db/`
- 类型与校验：
  - 共享类型：`types/`
  - Zod Schema：`schemas/`

## 导入与命名约定

- 优先使用路径别名 `@/*`（`tsconfig.json` 中配置为指向项目根目录）
- 避免深层相对路径（例如 `../../../../`）；跨模块引用尽量改用 `@/`
- TypeScript 中区分 `type` 与运行时导入：能用 `import type` 就用 `import type`

## 组件开发规则（App Router）

- 默认优先写 Server Component；仅在需要 hooks、事件、客户端状态时才加 `"use client"`
- `"use client"` 必须放在文件第一行（例如 `app/providers.tsx`）
- Tailwind class 拼接统一用 `cn`（`lib/utils.ts`）
- 全局 Provider 放在 `app/providers.tsx`，布局入口为 `app/layout.tsx`

## API 设计与错误处理

- 新增接口放在 `app/api/v1/**/route.ts`，对外路径为 `/api/v1/...`
- 入参校验优先使用 Zod（Schema 放在 `schemas/`），并用 `safeParse` 返回结构化错误
- 成功/失败响应尽量复用 `lib/api/response.ts` 中的封装（如 `successResponse`、`validationError`、`internalError`）
- 不在日志或响应中泄露敏感信息（token、cookie、密码等）

## 国际化与本地化

- 翻译通过 `useI18n()` 获取（`lib/i18n.tsx`），语言资源在 `locales/en.json`、`locales/zh.json`
- 语言偏好使用 `localStorage` 键 `app-lang`，避免 SSR/CSR 水合不一致

## 测试与质量门禁

- 测试文件放在 `tests/**/*.{test,spec}.{ts,tsx,js,jsx,...}`
- 变更完成后默认执行（按需要选用）：
  - `pnpm lint`
  - `pnpm format:check`
  - `pnpm test:run`
  - `pnpm build`（Next 构建包含类型检查，可作为 typecheck）

## 工程行为约束（给自动化改动用）

- 不主动新增注释；仅在需求明确要求时再添加
- 优先修改已有文件而不是新增文件；除非功能需要新文件承载
- 不主动新增文档类文件（`*.md`/README 等）；除非用户明确要求
