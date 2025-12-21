import type { Rule } from "@/lib/traeRules/types";

function isTestFile(path: string) {
  return path.includes("/src/tests/") || path.includes("\\src\\tests\\") || path.endsWith(".test.ts") || path.endsWith(".test.tsx");
}

export const noConsoleLogRule: Rule = {
  meta: {
    id: "quality/no-console-log",
    title: "避免 console.log",
    category: "quality",
    defaultEnabled: true,
    defaultSeverity: "warn",
    defaultPriority: 50,
    docs: {
      summary: "避免在业务代码中使用 `console.log`。",
      rationale: "会污染控制台输出，泄漏用户数据，并降低可观测性一致性。",
      examples: [
        { bad: "console.log(\"user\", user);" },
        { good: "logger.info(\"GET user request\", { id: user.id });", bad: "console.log(user);" }
      ]
    },
    tags: ["ts", "js"]
  },
  run: (ctx) => {
    const issues = [];
    for (const file of ctx.files) {
      if (isTestFile(file.path)) continue;
      if (!/\.(ts|tsx|js|jsx)$/.test(file.path)) continue;
      const lines = file.content.split(/\r?\n/);
      for (let i = 0; i < lines.length; i += 1) {
        const col = lines[i].indexOf("console.log");
        if (col < 0) continue;
        issues.push({
          message: "检测到 `console.log`，建议替换为统一日志模块或移除。",
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

