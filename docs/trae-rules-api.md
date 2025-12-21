# Trae 规则引擎 API

## 核心类型

- `Rule`：单条规则，包含 `meta` 与 `run(ctx)` 执行逻辑
- `RuleContext`：输入上下文（当前为文件列表：`{ path, content }[]`）
- `RulesConfig`：规则配置（启用/禁用、severity、priority、冲突策略）
- `RuleIssue`：规则输出（ruleId、severity、message、定位信息）

## 入口函数

### `runRuleEngine`

位置：`src/lib/traeRules/engine.ts`

```ts
runRuleEngine({
  rules,
  ctx: { files: [{ path: "src/a.ts", content: "..." }] },
  config
})
```

返回：`RuleIssue[]`

## 配置说明

- `rules[ruleId].enabled`：启用/禁用
- `rules[ruleId].severity`：`info | warn | error | off`
- `rules[ruleId].priority`：数值越大优先级越高
- `conflicts.strategy`
  - `highestPriorityWins`：默认策略
  - `preferRule`：按 `conflicts.prefer[conflictGroup]` 指定胜出规则

