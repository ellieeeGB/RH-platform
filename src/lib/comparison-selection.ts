import { COMPANIES, MARKET_SCOPE, PERIODS } from "./company-panel";
import { MONTH_PERIODS } from "./company-detail";

export const COMPARISON_STORAGE = "catch.comparison.v1";
export type TimeMode = "single" | "history" | "periods" | "months";
export type ComparisonSelection = { companies: string[]; timeMode: TimeMode; periods: string[]; months: string[] };
export const COMPARISON_MONTHS = MONTH_PERIODS.flatMap(p => p.months.map(m => ({ ...m, period: p.label, available: p.monthlyAvailable })));
export const AVAILABLE_MONTHS = COMPARISON_MONTHS.filter(m => m.available);

export function singleSelection(company = MARKET_SCOPE, period = PERIODS.at(-1)!): ComparisonSelection {
  return { companies: company === MARKET_SCOPE ? [...COMPANIES] : [company], timeMode: "single", periods: [period], months: AVAILABLE_MONTHS.slice(-2).map(m => m.id) };
}

/** Whitelist persisted values, deduplicate them and restore chronological order. */
export function normalizeSelection(input: unknown): ComparisonSelection | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Partial<ComparisonSelection>;
  if (!["single", "history", "periods", "months"].includes(raw.timeMode ?? "")) return null;
  const pick = (allowed: string[], value: unknown) => allowed.filter(v => Array.isArray(value) && value.includes(v));
  const companies = pick(COMPANIES, raw.companies);
  const periods = raw.timeMode === "history" ? [...PERIODS] : pick(PERIODS, raw.periods);
  const months = pick(AVAILABLE_MONTHS.map(m => m.id), raw.months);
  if (!companies.length) return null;
  if (raw.timeMode === "single" && periods.length !== 1) return null;
  if (raw.timeMode === "periods" && periods.length < 2) return null;
  if (raw.timeMode === "months" && months.length < 2) return null;
  return { companies, periods, months, timeMode: raw.timeMode! };
}

export function selectionCuts(selection: ComparisonSelection) {
  return selection.timeMode === "months"
    ? AVAILABLE_MONTHS.filter(m => selection.months.includes(m.id)).map(m => ({ id: m.id, label: m.label, period: m.period, date: m.id }))
    : PERIODS.filter(p => selection.timeMode === "history" || selection.periods.includes(p)).map(p => ({ id: p, label: p, period: p, date: MONTH_PERIODS.find(m => m.label === p)!.id }));
}

export function companySelectionLabel(companies: string[]) {
  return companies.length === COMPANIES.length ? "Todas las compañías" : companies.length === 1 ? companies[0] : `${companies.length} compañías`;
}

export function timeSelectionLabel(selection: ComparisonSelection) {
  return selection.timeMode === "history" ? "Todo el historial · 7 bimestres" : selection.timeMode === "months" ? `${selection.months.length} meses · bajas` : selection.periods.length === 1 ? selection.periods[0] : `${selection.periods.length} bimestres`;
}

export function needsComparison(selection: ComparisonSelection) {
  return selection.timeMode !== "single" || (selection.companies.length > 1 && selection.companies.length < COMPANIES.length);
}
