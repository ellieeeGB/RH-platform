import { execFileSync } from "node:child_process";

// Exact rename plan for the six remote branches audited on 2026-10-15.
// No branch is deleted, force-pushed or merged by this script.
const repository = "ellieeeGB/RH-platform";
const plan = [
  ["codex/audit-and-responsive-review", "chore/audit-and-responsive-review"],
  ["codex/consulting-clarity", "feat/consulting-clarity"],
  ["codex/editorial-visual-design", "feat/editorial-visual-design"],
  ["codex/executive-language", "feat/executive-language"],
  ["codex/flexible-comparisons", "feat/flexible-comparisons"],
  ["codex/navigation-editorial-clarity", "feat/navigation-editorial-clarity"],
];
const apply = process.argv.includes("--apply");
if (!apply) {
  console.log("Plan de renombrado (sin cambios remotos):");
  plan.forEach(([before, after]) => console.log(`${before} → ${after}`));
  console.log("Para aplicar: gh auth login; después node scripts/rename-legacy-branches.mjs --apply");
} else {
  const gh = args => execFileSync("gh", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] });
  const api = args => JSON.parse(gh(["api", ...args]));
  const branches = api([`repos/${repository}/branches?per_page=100`]);
  const initial = new Map(branches.map(branch => [branch.name, branch.commit.sha]));
  for (const [before, after] of plan) {
    if (!initial.has(before) && initial.has(after)) { console.log(`Ya renombrada: ${after}`); continue; }
    if (!initial.has(before)) throw new Error(`No existe ${before}; revisar antes de continuar.`);
    if (initial.has(after)) throw new Error(`Ya existe ${after}; no se sobrescribe.`);
    const current = api([`repos/${repository}/branches/${encodeURIComponent(before)}`]);
    if (current.commit.sha !== initial.get(before)) throw new Error(`La rama ${before} cambió durante la revisión.`);
    const result = api(["--method", "POST", `repos/${repository}/branches/${encodeURIComponent(before)}/rename`, "-f", `new_name=${after}`]);
    if (result.name !== after || result.commit.sha !== current.commit.sha) throw new Error(`Comprobar manualmente el resultado de ${before}.`);
    console.log(`Renombrada: ${after}; historial conservado.`);
  }
}
