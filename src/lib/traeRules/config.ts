import type { Rule, RuleId, RuleRuntime, RulesConfig } from "@/lib/traeRules/types";

export function getEffectiveRuntime(rule: Rule, config?: RulesConfig): RuleRuntime {
  const override = config?.rules?.[rule.meta.id];
  const enabled = override?.enabled ?? rule.meta.defaultEnabled;
  const severity = override?.severity ?? rule.meta.defaultSeverity;
  const priority = override?.priority ?? rule.meta.defaultPriority;
  return { enabled, severity, priority };
}

export function normalizeRulesConfig(config?: RulesConfig): RulesConfig {
  return {
    rules: config?.rules ?? {},
    conflicts: config?.conflicts ?? { strategy: "highestPriorityWins" }
  };
}

export function isRuleEnabled(runtime: RuleRuntime): runtime is RuleRuntime & { severity: Exclude<RuleRuntime["severity"], "off"> } {
  return runtime.enabled && runtime.severity !== "off";
}

export function idKey(id: RuleId): string {
  return id.trim();
}

