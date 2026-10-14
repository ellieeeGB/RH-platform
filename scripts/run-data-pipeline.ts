import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { assertCompanyIds, PERIOD_SLUGS } from "./lib/data-contract";
import { STAGES, OUTPUT_FILES, digest, implementationHash } from "./lib/pipeline-contract";
import { completeSum, matchedRate } from "../src/lib/metric-math";

import { assertPanelSchema } from "./lib/panel-schema";

const readJson = async (file: string) => JSON.parse(await fs.readFile(file, "utf8"));

export async function validateOutput(root: string) {
  const panels = await Promise.all(PERIOD_SLUGS.map(slug => readJson(path.join(root, "company-periods", `${slug}.json`))));
  const keys = new Set<string>();
  for (const [i, panel] of panels.entries()) {
    assertPanelSchema(panel);
    if (panel.period.toLowerCase().replaceAll(" ", "-") !== PERIOD_SLUGS[i]) throw new Error("Panel period does not match its file");
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
  if (benchmark.periods.length !== panels.length) throw new Error("Missing historical aggregate");
  for (const panel of panels) {
    const aggregate = benchmark.periods.find((r: {period: string}) => r.period === panel.period);
    if (!aggregate) throw new Error(`Missing historical aggregate: ${panel.period}`);
    const value = (row: Array<number | null>, field: string) => row[panel.columns.indexOf(field)];
    for (const field of ["hires", "exits"] as const) {
      const sum = panel.rows.reduce((s: number, r: Array<number | null>) => s + (value(r, field) ?? 0), 0);
      if (sum !== aggregate[field]) throw new Error(`Historical aggregate disagrees with panel: ${panel.period}/${field}`);
    }
    for (const [rate, field] of [["exits", "exits"], ["absences", "absencesTotal"], ["incapacity", "incapacityCases"]]) {
      const calculated = matchedRate(panel.rows as Array<Array<number | null>>, r => value(r, field), r => completeSum(["hcOperational", "hcAdministrative", "hcOther"].map(f => value(r, f))));
      const saved = aggregate.matchedRates[rate];
      if (!saved || ["n", "numerator", "denominator", "value"].some(k => saved[k] !== calculated[k as keyof typeof calculated])) throw new Error(`Historical rate disagrees with panel: ${panel.period}/${rate}`);
    }
  }
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
  const codeHash = await implementationHash();
  const target = path.resolve(destination);
  const parent = path.dirname(target);
  await fs.mkdir(parent, { recursive: true });
  const lock = path.join(parent, ".data-pipeline.lock");
  await fs.mkdir(lock); // Refuse concurrent writers, including stale interrupted runs.
  let stage: string | undefined;
  let backup: string | undefined;
  try {
    stage = await fs.mkdtemp(path.join(parent, ".data-stage-"));
    for (const name of STAGES) {
      const result = spawnSync(process.execPath, ["--import", "tsx", `scripts/extract-${name}.ts`, sourcePath], { env: { ...process.env, CATCH_DATA_OUTPUT: stage }, stdio: "inherit" });
      if (result.error || result.status !== 0) throw new Error(`Extraction failed: ${name}`, { cause: result.error });
    }
    if (digest(await fs.readFile(sourcePath)) !== sourceHash) throw new Error("Workbook changed during extraction; outputs discarded");
    if (await implementationHash() !== codeHash) throw new Error("Extraction code changed during execution; outputs discarded");
    const cohort = await validateOutput(stage);
    const outputs = Object.fromEntries(await Promise.all(OUTPUT_FILES.map(async file => [file, digest(await fs.readFile(path.join(stage!, file)))])));
    await fs.writeFile(path.join(stage, "pipeline-manifest.json"), JSON.stringify({ schemaVersion: 3, sourceSha256: sourceHash, implementationSha256: codeHash, ...cohort, outputs }, null, 2) + "\n");
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
