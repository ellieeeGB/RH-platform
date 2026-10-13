import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { assertCompanyIds, PERIOD_SLUGS } from "./lib/data-contract";

const stages = ["company-periods", "historical", "people-intelligence", "workforce-rewards", "extended-intelligence", "company-detail"];
const digest = (data: Uint8Array | string) => createHash("sha256").update(data).digest("hex");
const readJson = async (file: string) => JSON.parse(await fs.readFile(file, "utf8"));

export async function validateOutput(root: string) {
  const panels = await Promise.all(PERIOD_SLUGS.map(slug => readJson(path.join(root, "company-periods", `${slug}.json`))));
  const keys = new Set<string>();
  for (const panel of panels) {
    if (new Set(panel.columns).size !== panel.columns.length) throw new Error("Duplicate field in panel");
    const companyIndex = panel.columns.indexOf("company");
    if (companyIndex < 0) throw new Error("Missing company column");
    assertCompanyIds(panel.rows.map((r: unknown[]) => r[companyIndex]), panel.period);
    for (const row of panel.rows) {
      if (row.length !== panel.columns.length) throw new Error("Ragged panel row");
      keys.add(`${panel.period}|${row[companyIndex]}`);
    }
  }
  const detail = await readJson(path.join(root, "company-detail.json"));
  const detailKeys = detail.records.map((r: {period: string; company: string}) => `${r.period}|${r.company}`);
  if (keys.size !== 280 || detailKeys.length !== 280 || new Set(detailKeys).size !== 280 || detailKeys.some((key: string) => !keys.has(key))) throw new Error("Panel and company detail are from different cohorts");
  const benchmark = await readJson(path.join(root, "benchmark.json"));
  const latest = panels.at(-1)!;
  for (const field of ["hires", "exits"] as const) {
    const col = latest.columns.indexOf(field);
    const sum = latest.rows.reduce((s: number, row: (number | null)[]) => s + (row[col] ?? 0), 0);
    if (benchmark.latest[field] !== sum) throw new Error(`Aggregate disagrees with panel: ${field}`);
  }
  if (benchmark.metadata.periodCount !== 7 || benchmark.metadata.companyCount !== 40) throw new Error("Unexpected aggregate cohort");
  return { periods: panels.length, companies: 40, records: keys.size };
}

/** Extract into isolation; only a complete, validated generation replaces the previous one. */
export async function runPipeline(source: string, destination = "data/processed") {
  const sourcePath = path.resolve(source);
  const sourceHash = digest(await fs.readFile(sourcePath));
  const target = path.resolve(destination);
  const parent = path.dirname(target);
  await fs.mkdir(parent, { recursive: true });
  const lock = path.join(parent, ".data-pipeline.lock");
  await fs.mkdir(lock); // Refuse concurrent writers, including stale interrupted runs.
  let stage: string | undefined;
  let backup: string | undefined;
  try {
    stage = await fs.mkdtemp(path.join(parent, ".data-stage-"));
    for (const name of stages) {
      const result = spawnSync(process.execPath, ["--import", "tsx", `scripts/extract-${name}.ts`, sourcePath], { env: { ...process.env, CATCH_DATA_OUTPUT: stage }, stdio: "inherit" });
      if (result.error || result.status !== 0) throw new Error(`Extraction failed: ${name}`, { cause: result.error });
    }
    if (digest(await fs.readFile(sourcePath)) !== sourceHash) throw new Error("Workbook changed during extraction; outputs discarded");
    const cohort = await validateOutput(stage);
    const files = [...PERIOD_SLUGS.map(s => `company-periods/${s}.json`), "benchmark.json", "people-intelligence.json", "workforce-rewards.json", "extended-intelligence.json", "company-detail.json"];
    const outputs = Object.fromEntries(await Promise.all(files.map(async file => [file, digest(await fs.readFile(path.join(stage!, file)))])));
    const scriptFiles = [...stages.map(s => `scripts/extract-${s}.ts`), "scripts/run-data-pipeline.ts", "scripts/lib/data-contract.ts", "src/lib/metric-math.ts"];
    const implementationSha256 = digest((await Promise.all(scriptFiles.map(file => fs.readFile(file)))).map(b => b.toString()).join("\n"));
    await fs.writeFile(path.join(stage, "pipeline-manifest.json"), JSON.stringify({ schemaVersion: 2, sourceSha256: sourceHash, implementationSha256, ...cohort, outputs }, null, 2) + "\n");
    try { await fs.access(target); backup = `${stage}-previous`; await fs.rename(target, backup); } catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
    try { await fs.rename(stage, target); stage = undefined; }
    catch (error) { if (backup) { await fs.rename(backup, target); backup = undefined; } throw error; }
    if (backup) await fs.rm(backup, { recursive: true });
    console.log(`Validated ${cohort.records} records. Source SHA-256: ${sourceHash.slice(0, 12)}. Published ${target}`);
  } finally {
    if (stage) await fs.rm(stage, { recursive: true, force: true });
    await fs.rmdir(lock);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const source = process.argv[2];
  if (!source) { console.error('Usage: npm run data:extract -- "/path/to/BASE HISTORICA.xlsx" [output-directory]'); process.exitCode = 1; }
  else runPipeline(source, process.argv[3]).catch(error => { console.error(error); process.exitCode = 1; });
}
