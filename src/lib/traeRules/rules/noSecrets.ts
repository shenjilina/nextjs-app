import type { Rule } from "@/lib/traeRules/types";

const secretPatterns: Array<{ name: string; re: RegExp }> = [
  { name: "OpenAI key", re: /\bsk-[a-zA-Z0-9]{20,}\b/g },
  { name: "GitHub token", re: /\bgh[pousr]_[a-zA-Z0-9]{20,}\b/g },
  { name: "AWS access key", re: /\bAKIA[0-9A-Z]{16}\b/g }
];

function isBinaryLike(content: string) {
  const sample = content.slice(0, 2048);
  return sample.includes("\u0000");
}

export const noSecretsRule: Rule = {
  meta: {
    id: "security/no-secrets",
    title: "禁止硬编码敏感密钥",
    category: "security",
    defaultEnabled: true,
    defaultSeverity: "error",
    defaultPriority: 95,
    conflictGroup: "secrets",
    docs: {
      summary: "扫描常见密钥格式，避免敏感信息提交到仓库。",
      rationale: "密钥泄漏会导致账号与资源被滥用，风险高且难以追踪。",
      examples: [{ bad: "const apiKey = \"sk-...\";" }, { good: "const apiKey = process.env.OPENAI_API_KEY;", bad: "const apiKey = \"sk-...\";" }]
    },
    tags: ["security"]
  },
  run: (ctx) => {
    const issues = [];
    for (const file of ctx.files) {
      if (isBinaryLike(file.content)) continue;
      for (const p of secretPatterns) {
        const matches = [...file.content.matchAll(p.re)];
        for (const m of matches) {
          const idx = m.index ?? -1;
          if (idx < 0) continue;
          const before = file.content.slice(0, idx);
          const line = before.split(/\r?\n/).length;
          const col = idx - (before.lastIndexOf("\n") + 1) + 1;
          issues.push({
            message: `检测到疑似敏感信息（${p.name}），请改为环境变量/密钥管理。`,
            filePath: file.path,
            line,
            column: col,
            snippet: m[0]
          });
        }
      }
    }
    return issues;
  }
};

