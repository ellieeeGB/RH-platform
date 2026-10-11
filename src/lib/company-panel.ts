import julAgo24 from "../../data/processed/company-periods/jul-ago-24.json";
import sepOct24 from "../../data/processed/company-periods/sep-oct-24.json";
import novDic24 from "../../data/processed/company-periods/nov-dic-24.json";
import eneFeb25 from "../../data/processed/company-periods/ene-feb-25.json";
import marAbr25 from "../../data/processed/company-periods/mar-abr-25.json";
import mayJun25 from "../../data/processed/company-periods/may-jun-25.json";
import julAgo25 from "../../data/processed/company-periods/jul-ago-25.json";

type RawValue = string | number | null;
type RawDataset = { period: string; columns: string[]; rows: RawValue[][] };

const datasets = [julAgo24, sepOct24, novDic24, eneFeb25, marAbr25, mayJun25, julAgo25] as RawDataset[];

export const PERIODS = datasets.map((item) => item.period);
export const COMPANIES = Array.from({ length: 40 }, (_, index) => `COMPAÑIA ${index + 1}`);
export const MARKET_SCOPE = "market";

export type CompanySnapshot = {
  company: string;
  period: string;
  headcount: { operational: number | null; administrative: number | null; other: number | null; total: number | null };
  salaryDaily: { entry: number | null; low: number | null; high: number | null; max: number | null };
  hires: number | null;
  exits: number | null;
  timeToFill: { operational: number | null; technical: number | null; administrative: number | null; managerial: number | null };
  acceptedPer10: number | null;
  vacancies: { operational: number | null; administrative: number | null; total: number | null };
};

function num(value: RawValue): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toSnapshot(dataset: RawDataset, row: RawValue[]): CompanySnapshot {
  const index = Object.fromEntries(dataset.columns.map((column, idx) => [column, idx]));
  const value = (column: string) => num(row[index[column]]);
  const operational = value("hcOperational");
  const administrative = value("hcAdministrative");
  const other = value("hcOther");
  const total = [operational, administrative, other].some((item) => item !== null)
    ? (operational ?? 0) + (administrative ?? 0) + (other ?? 0)
    : null;
  const vacanciesOperational = value("vacanciesOperational");
  const vacanciesAdministrative = value("vacanciesAdministrative");
  const vacanciesTotal = vacanciesOperational !== null || vacanciesAdministrative !== null
    ? (vacanciesOperational ?? 0) + (vacanciesAdministrative ?? 0)
    : null;

  return {
    company: String(row[index.company]),
    period: dataset.period,
    headcount: { operational, administrative, other, total },
    salaryDaily: {
      entry: value("salaryEntry"), low: value("salaryLow"), high: value("salaryHigh"), max: value("salaryMax"),
    },
    hires: value("hires"),
    exits: value("exits"),
    timeToFill: {
      operational: value("ttfOperational"), technical: value("ttfTechnical"), administrative: value("ttfAdministrative"), managerial: value("ttfManagerial"),
    },
    acceptedPer10: value("acceptedPer10"),
    vacancies: { operational: vacanciesOperational, administrative: vacanciesAdministrative, total: vacanciesTotal },
  };
}

const snapshots = datasets.flatMap((dataset) => dataset.rows.map((row) => toSnapshot(dataset, row)));

function values(items: (number | null)[]) {
  return items.filter((value): value is number => value !== null && Number.isFinite(value));
}

function median(items: (number | null)[]): number | null {
  const sorted = values(items).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function sum(items: (number | null)[]): number | null {
  const valid = values(items);
  return valid.length ? valid.reduce((total, value) => total + value, 0) : null;
}

export function getCompanySnapshot(company: string, period: string) {
  return snapshots.find((row) => row.company === company && row.period === period) ?? null;
}

export function getMarketSnapshot(period: string): CompanySnapshot & { companyCount: number } {
  const rows = snapshots.filter((row) => row.period === period);
  const operational = sum(rows.map((row) => row.headcount.operational));
  const administrative = sum(rows.map((row) => row.headcount.administrative));
  const other = sum(rows.map((row) => row.headcount.other));
  const total = operational !== null || administrative !== null || other !== null
    ? (operational ?? 0) + (administrative ?? 0) + (other ?? 0)
    : null;
  const vacancyOperational = sum(rows.map((row) => row.vacancies.operational));
  const vacancyAdministrative = sum(rows.map((row) => row.vacancies.administrative));

  return {
    company: "Mercado",
    companyCount: rows.length,
    period,
    headcount: { operational, administrative, other, total },
    salaryDaily: {
      entry: median(rows.map((row) => row.salaryDaily.entry)),
      low: median(rows.map((row) => row.salaryDaily.low)),
      high: median(rows.map((row) => row.salaryDaily.high)),
      max: median(rows.map((row) => row.salaryDaily.max)),
    },
    hires: sum(rows.map((row) => row.hires)),
    exits: sum(rows.map((row) => row.exits)),
    timeToFill: {
      operational: median(rows.map((row) => row.timeToFill.operational)),
      technical: median(rows.map((row) => row.timeToFill.technical)),
      administrative: median(rows.map((row) => row.timeToFill.administrative)),
      managerial: median(rows.map((row) => row.timeToFill.managerial)),
    },
    acceptedPer10: median(rows.map((row) => row.acceptedPer10)),
    vacancies: {
      operational: vacancyOperational,
      administrative: vacancyAdministrative,
      total: vacancyOperational !== null || vacancyAdministrative !== null ? (vacancyOperational ?? 0) + (vacancyAdministrative ?? 0) : null,
    },
  };
}

export function getScopeSnapshot(company: string, period: string) {
  return company === MARKET_SCOPE ? getMarketSnapshot(period) : getCompanySnapshot(company, period);
}

export function getPreviousPeriod(period: string) {
  const index = PERIODS.indexOf(period);
  return index > 0 ? PERIODS[index - 1] : null;
}

export function getMarketSalaryPercentile(value: number | null, period: string) {
  if (value === null) return null;
  const salaryValues = snapshots
    .filter((row) => row.period === period && row.salaryDaily.entry !== null)
    .map((row) => row.salaryDaily.entry as number)
    .sort((a, b) => a - b);
  if (!salaryValues.length) return null;
  const belowOrEqual = salaryValues.filter((salary) => salary <= value).length;
  return Math.round((belowOrEqual / salaryValues.length) * 100);
}

export function deriveScopeMetrics(snapshot: CompanySnapshot | null) {
  if (!snapshot) return { netMovement: null, movementLoadPct: null, turnoverPct: null, hiringPressurePct: null };
  const hc = snapshot.headcount.total;
  const hires = snapshot.hires;
  const exits = snapshot.exits;
  const vacancies = snapshot.vacancies.total;
  return {
    netMovement: hires !== null && exits !== null ? hires - exits : null,
    movementLoadPct: hc && hires !== null && exits !== null ? ((hires + exits) / hc) * 100 : null,
    turnoverPct: hc && exits !== null ? (exits / hc) * 100 : null,
    hiringPressurePct: hc && vacancies !== null ? (vacancies / hc) * 100 : null,
  };
}
