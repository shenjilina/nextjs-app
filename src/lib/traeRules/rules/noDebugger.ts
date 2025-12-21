import type { Rule } from "@/lib/traeRules/types";

export const noDebuggerRule: Rule = {
  meta: {
    id: "quality/no-debugger",
    title: "禁止提交 debugger 语句",
    category: "quality",
    defaultEnabled: true,
    defaultSeverity: "error",
    defaultPriority: 90,
    conflictGroup: "debug",
    docs: {
      summary: "禁止在提交代码中保留 `debugger`。",
      rationale: "会导致运行时中断，影响用户体验与调试安全。",
      examples: [
        { bad: "debugger;" },
        { good: "if (process.env.NODE_ENV === \"development\") { /* use dev-only logs */ }", bad: "debugger;" }
      ]
    },
    tags: ["ts", "js"]
  },
  run: (ctx) => {
    const issues = [];
    for (const file of ctx.files) {
      const idx = file.content.indexOf("debugger");
      if (idx < 0) continue;
      const lines = file.content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        const col = lines[i].indexOf("debugger");
        if (col < 0) continue;
        issues.push({
          message: "检测到 `debugger` 语句，请移除后再提交。",
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

