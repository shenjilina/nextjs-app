# Trae 规则体系（项目内规则引擎）

## 项目技术栈与架构概览

- 框架：Next.js App Router（`src/app`）
- UI：Tailwind CSS + Radix UI 组件封装（`src/components/ui`）
- 业务组件：聊天模块（`src/app/chat`），AI UI 组件集合（`src/components/ai-elements`）
- 数据访问：客户端 `useFetch`（`src/lib/hooks/useFetch.ts`），服务端 Route Handlers（`src/app/api/v1/**/route.ts`）
- 状态管理：Zustand（`src/lib/stores/*.ts`）
- 测试：Vitest + Testing Library（`vitest.config.ts`，`src/tests`）

### 架构图（文本）

```
Browser UI
  └─ src/app/** (pages/layouts)
      ├─ Providers: Theme + I18n (src/app/providers.tsx)
      ├─ UI Components (src/components/ui)
      └─ Feature Components (src/app/chat/**)
           ├─ useFetch (src/lib/hooks/useFetch.ts)  --->  /api/v1/** (Route Handlers)
           └─ Zustand stores (src/lib/stores/*.ts)
```

### 关键业务流程（示例：登录）

```
User clicks Login
  └─ LoginModelDialog submits
      └─ POST /api/v1/login
          ├─ zod 校验
          └─ 生成/返回 token + userId
```

## 规则分类体系

- `quality/*`：代码质量（可维护性、可读性、稳定性）
- `performance/*`：性能与资源使用
- `security/*`：安全防护（密钥泄漏、XSS 等）
- `style/*`：团队风格一致性
- `architecture/*`：架构约束与边界

## 内置规则清单（当前实现）

### `security/no-secrets`

- 摘要：扫描常见密钥格式，避免敏感信息提交到仓库
- 示例（Bad）
  - `const apiKey = "sk-...";`
- 示例（Good）
  - `const apiKey = process.env.OPENAI_API_KEY;`

### `quality/no-debugger`

- 摘要：禁止在提交代码中保留 `debugger`
- 示例（Bad）
  - `debugger;`

### `quality/no-console-log`

- 摘要：避免在业务代码中使用 `console.log`
- 示例（Bad）
  - `console.log("user", user);`

### `security/no-dangerously-set-inner-html`

- 摘要：限制 `dangerouslySetInnerHTML` 并要求内容来源可控
- 示例（Bad）
  - `<div dangerouslySetInnerHTML={{ __html: html }} />`

## 配置与使用

- 配置文件：`trae-rules.config.json`
- 运行方式（示例，配合 Vitest 或 Node 脚本）
  - 通过 `runRuleEngine({ rules, ctx, config })` 执行规则

