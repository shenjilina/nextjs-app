export type RuleId = string;

export type RuleCategory = "quality" | "performance" | "security" | "style" | "architecture";

export type RuleSeverity = "off" | "info" | "warn" | "error";

export type RuleDocExample = {
  bad: string;
  good?: string;
};

export type RuleDoc = {
  summary: string;
  rationale: string;
  examples: RuleDocExample[];
};

export type RuleMeta = {
  id: RuleId;
  title: string;
  category: RuleCategory;
  defaultEnabled: boolean;
  defaultSeverity: Exclude<RuleSeverity, "off">;
  defaultPriority: number;
  conflictGroup?: string;
  conflictsWith?: RuleId[];
  docs: RuleDoc;
  tags?: string[];
};

export type RuleIssue = {
  ruleId: RuleId;
  severity: Exclude<RuleSeverity, "off">;
  message: string;
  filePath?: string;
  line?: number;
  column?: number;
  snippet?: string;
};

export type RuleFile = {
  path: string;
  content: string;
};

export type RuleContext = {
  files: RuleFile[];
};

export type RuleRuntime = {
  enabled: boolean;
  severity: RuleSeverity;
  priority: number;
};

export type RuleConfigOverride = Partial<RuleRuntime>;

export type ConflictStrategy = "highestPriorityWins" | "preferRule";

export type RulesConfig = {
  rules?: Record<RuleId, RuleConfigOverride>;
  conflicts?: {
    strategy: ConflictStrategy;
    prefer?: Record<string, RuleId>;
  };
};

export type Rule = {
  meta: RuleMeta;
  run: (ctx: RuleContext) => Omit<RuleIssue, "severity">[];
};

