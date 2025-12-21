import type { Rule } from "@/lib/traeRules/types";

export const noDangerouslySetInnerHtmlRule: Rule = {
  meta: {
    id: "security/no-dangerously-set-inner-html",
    title: "限制 dangerouslySetInnerHTML",
    category: "security",
    defaultEnabled: true,
    defaultSeverity: "warn",
    defaultPriority: 60,
    docs: {
      summary: "限制使用 `dangerouslySetInnerHTML`，并要求上游内容来源可控或做消毒。",
      rationale: "不安全的 HTML 注入会导致 XSS。",
      examples: [
        { bad: "<div dangerouslySetInnerHTML={{ __html: html }} />" },
        { good: "<pre>{text}</pre>", bad: "<div dangerouslySetInnerHTML={{ __html: html }} />" }
      ]
    },
    tags: ["react", "xss"]
  },
  run: (ctx) => {
    const issues = [];
    for (const file of ctx.files) {
      if (!/\.(tsx|jsx)$/.test(file.path)) continue;
      const lines = file.content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        const col = lines[i].indexOf("dangerouslySetInnerHTML");
        if (col < 0) continue;
        issues.push({
          message: "检测到 `dangerouslySetInnerHTML`，请确认内容已消毒且来源可信。",
          filePath: file.path,
          line: i + 1,
          column: col + 1,
          snippet: lines[i].trim()
        });
      }
    }
    return issues;
  }
};

