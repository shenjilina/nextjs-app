import type { Rule, RuleContext, RuleIssue, RuleRuntime, RulesConfig } from "@/lib/traeRules/types";
import { getEffectiveRuntime, isRuleEnabled, normalizeRulesConfig } from "@/lib/traeRules/config";

type ResolvedRule = {
  rule: Rule;
  runtime: RuleRuntime;
};

function stableRuleOrder(a: ResolvedRule, b: ResolvedRule) {
  if (a.runtime.priority !== b.runtime.priority) return b.runtime.priority - a.runtime.priority;
  return a.rule.meta.id.localeCompare(b.rule.meta.id);
}

function selectRulesWithConflictResolution(rules: ResolvedRule[], config: RulesConfig): ResolvedRule[] {
  const byGroup = new Map<string, ResolvedRule[]>();
  const selected: ResolvedRule[] = [];

  for (const item of rules) {
    const group = item.rule.meta.conflictGroup;
    if (!group) {
      selected.push(item);
      continue;
    }
    const list = byGroup.get(group) ?? [];
    list.push(item);
    byGroup.set(group, list);
  }

  for (const [group, list] of byGroup.entries()) {
    const strategy = config.conflicts?.strategy ?? "highestPriorityWins";
    if (strategy === "preferRule") {
      const preferred = config.conflicts?.prefer?.[group];
      const found = preferred ? list.find((x) => x.rule.meta.id === preferred) : undefined;
      if (found) {
        selected.push(found);
        continue;
      }
    }
    selected.push([...list].sort(stableRuleOrder)[0]);
  }

  return selected;
}

export function runRuleEngine(opts: { rules: Rule[]; ctx: RuleContext; config?: RulesConfig }): RuleIssue[] {
  const config = normalizeRulesConfig(opts.config);

  const resolved = opts.rules
    .map((rule) => ({ rule, runtime: getEffectiveRuntime(rule, config) }))
    .filter((x) => isRuleEnabled(x.runtime));

  const conflictsExpanded = resolved.filter((x) => x.rule.meta.conflictGroup || (x.rule.meta.conflictsWith?.length ?? 0) > 0);
  const nonConflicting = resolved.filter((x) => !conflictsExpanded.includes(x));

  const byId = new Map(resolved.map((x) => [x.rule.meta.id, x]));
  const disabledByDirectConflict = new Set<string>();
  for (const item of conflictsExpanded) {
    for (const otherId of item.rule.meta.conflictsWith ?? []) {
      if (byId.has(otherId)) disabledByDirectConflict.add(otherId);
    }
  }
  const afterDirectConflicts = conflictsExpanded.filter((x) => !disabledByDirectConflict.has(x.rule.meta.id));

  const selected = [...nonConflicting, ...selectRulesWithConflictResolution(afterDirectConflicts, config)].sort(stableRuleOrder);

  const issues: RuleIssue[] = [];
  for (const { rule, runtime } of selected) {
    if (runtime.severity === "off") continue;
    const found = rule.run(opts.ctx);
    for (const issue of found) {
      issues.push({
        ...issue,
        ruleId: rule.meta.id,
        severity: runtime.severity
      });
    }
  }

  return issues.sort((a, b) => {
    const byFile = (a.filePath ?? "").localeCompare(b.filePath ?? "");
    if (byFile !== 0) return byFile;
    const byLine = (a.line ?? 0) - (b.line ?? 0);
    if (byLine !== 0) return byLine;
    const byCol = (a.column ?? 0) - (b.column ?? 0);
    if (byCol !== 0) return byCol;
    return a.ruleId.localeCompare(b.ruleId);
  });
}

