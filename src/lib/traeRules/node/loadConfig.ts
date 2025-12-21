import { readFile } from "node:fs/promises";
import type { RulesConfig } from "@/lib/traeRules/types";

export async function loadRulesConfigFromFile(filePath: string): Promise<RulesConfig> {
  const raw = await readFile(filePath, "utf8");
  return JSON.parse(raw) as RulesConfig;
}

