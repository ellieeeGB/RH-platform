import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { PERIOD_SLUGS } from "./data-contract";

export const STAGES = ["company-periods", "historical", "people-intelligence", "workforce-rewards", "extended-intelligence", "company-detail"];
export const OUTPUT_FILES = [...PERIOD_SLUGS.map(s => `company-periods/${s}.json`), "benchmark.json", "people-intelligence.json", "workforce-rewards.json", "extended-intelligence.json", "company-detail.json"];
export const IMPLEMENTATION_FILES = [...STAGES.map(s => `scripts/extract-${s}.ts`), "scripts/run-data-pipeline.ts", "scripts/lib/data-contract.ts", "scripts/lib/panel-schema.ts", "scripts/lib/pipeline-contract.ts", "src/lib/metric-math.ts"];
export const digest = (data: Uint8Array | string) => createHash("sha256").update(data).digest("hex");

export async function implementationHash(projectRoot = process.cwd()) {
  // Names and individual digests make file boundaries unambiguous.
  const files = await Promise.all(IMPLEMENTATION_FILES.map(async file => [file, digest(await fs.readFile(path.join(projectRoot, file)))]));
  return digest(JSON.stringify(files));
}
