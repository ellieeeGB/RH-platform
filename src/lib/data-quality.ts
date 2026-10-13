import { completeHeadcount, getPeriodSnapshots, MARKET_SCOPE, median, PERIODS, type CompanySnapshot } from "./company-panel";
import { completeSum } from "./metric-math";

type State = "pass" | "missing" | "review";
export type QualityCheck = {company: string; field: string; source: string; state: State; detail: string};
export function checkCompany(r: CompanySnapshot): QualityCheck[] {
  const checks: QualityCheck[] = [];
  const add = (field: string, source: string, parts: Array<number | null>, predicate: () => boolean, detail: string) => {
    const state = parts.some(v => v === null) ? "missing" : parts.some(v => v! < 0 || !Number.isFinite(v)) || !predicate() ? "review" : "pass";
    checks.push({company: r.company, field, source, state, detail: state === "missing" ? "Faltan componentes; no se completan con cero." : detail});
  };
  add("Plantilla", "GL–GN", [r.headcount.operational, r.headcount.administrative, r.headcount.other], () => completeHeadcount(r) !== null, "Tres componentes no negativos.");
  add("Altas y bajas", "KE / LB", [r.hires, r.exits], () => Number.isInteger(r.hires) && Number.isInteger(r.exits), "Los movimientos deben ser conteos enteros.");
  const salaries = Object.values(r.salaryDaily);
  add("Bandas salariales", "GW–GZ", salaries, () => salaries.every((v, i) => v! > 0 && (i === 0 || v! >= salaries[i-1]!)), "Ingreso ≤ bajo ≤ alto ≤ máximo, todos positivos.");
  const incap = [r.attendance.workRisk, r.attendance.generalIllness, r.attendance.maternity];
  add("Incapacidades", "ML–MO", [r.attendance.incapacityCases, ...incap], () => completeSum(incap) === r.attendance.incapacityCases, "El total debe coincidir con sus tres tipos.");
  add("Capacitación", "MT–MU", [r.training.operationalHours, r.training.administrativeHours], () => true, "Ambas poblaciones deben reportar horas.");
  add("Vacantes", "RB–RC", [r.vacancies.operational, r.vacancies.administrative], () => Number.isInteger(r.vacancies.operational) && Number.isInteger(r.vacancies.administrative), "Conteos enteros para ambas poblaciones.");
  add("Candidatos adecuados", "KR", [r.acceptedPer10], () => r.acceptedPer10! <= 10, "Escala de 0 a 10, no porcentaje directo.");
  add("Motivos de rechazo", "KS–LA", Object.values(r.rejectionPct), () => Object.values(r.rejectionPct).every(v => v! <= 100), "Cada causa entre 0 y 100; no se exige sumar 100.");
  return checks;
}

export function qualityReport(period: string, company = MARKET_SCOPE) {
  const rows = getPeriodSnapshots(period).filter(r => company === MARKET_SCOPE || r.company === company);
  const checks = rows.flatMap(checkCompany);
  const anomalies = rows.flatMap(row => {
    const reported = completeHeadcount(row);
    const history = PERIODS.filter(p => p !== period).flatMap(p => getPeriodSnapshots(p).filter(r => r.company === row.company)).map(completeHeadcount).filter((v): v is number => v !== null && v > 0);
    const baseline = median(history);
    return reported !== null && reported > 0 && baseline && history.length >= 3 && (reported / baseline > 3 || reported / baseline < 0.33) ? [{company: row.company, reported, baseline}] : [];
  });
  const count = (state: State) => checks.filter(c => c.state === state).length;
  return { checks, anomalies, pass: count("pass"), missing: count("missing"), review: count("review"), companies: rows.length };
}
