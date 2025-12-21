import type { Rule } from "@/lib/traeRules/types";
import { noDebuggerRule } from "@/lib/traeRules/rules/noDebugger";
import { noConsoleLogRule } from "@/lib/traeRules/rules/noConsoleLog";
import { noSecretsRule } from "@/lib/traeRules/rules/noSecrets";
import { noDangerouslySetInnerHtmlRule } from "@/lib/traeRules/rules/noDangerouslySetInnerHtml";

export function getBuiltInRules(): Rule[] {
  return [noSecretsRule, noDebuggerRule, noConsoleLogRule, noDangerouslySetInnerHtmlRule];
}

