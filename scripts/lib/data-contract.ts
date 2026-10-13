/** Workbook percentages have field-specific units, never inferred from magnitude. */
export function percentagePoints(value: unknown, unit: "fraction" | "points"): number | null {
  if (value && typeof value === "object") {
    const cell = value as { result?: unknown; text?: unknown };
    return percentagePoints(cell.result ?? cell.text, unit);
  }
  const raw = String(value ?? "").trim();
  if (!/^-?\d+(\.\d+)?\s*%?$/.test(raw)) return null;
  const explicitPercent = raw.endsWith("%");
  const n = Number(raw.replace(/\s*%$/, ""));
  const result = n * (unit === "fraction" && !explicitPercent ? 100 : 1);
  return Number.isFinite(result) && result >= 0 && result <= 100 ? Math.round(result * 10000) / 10000 : null;
}

export function reconcile(parts: Array<number | null>, expected: number | null): boolean | null {
  if (expected === null || !parts.length || parts.some(v => v === null)) return null;
  return Math.abs(parts.reduce<number>((sum, v) => sum + v!, 0) - expected) < 0.01;
}

/** Normalize a complete composition as a group: a value of 1 never means 100% in a 100-point group. */
export function composition(values: Array<number | null>): number[] | null {
  if (!values.length || values.some(v => v === null || !Number.isFinite(v) || v < 0)) return null;
  const total = values.reduce<number>((s, v) => s + v!, 0);
  if (Math.abs(total - 1) > 0.05 && Math.abs(total - 100) > 5) return null;
  return values.map(v => v! / total);
}

export const SOURCE_SHEETS = ["JUL-AGO_2024", "SEP-OCT_2024", "NOV-DIC_2024", "ENE-FEB_2025", "MAR-ABR_2025", "MAY-JUN_2025", "JUL-AGO_2025"];
export const PERIOD_SLUGS = ["jul-ago-24", "sep-oct-24", "nov-dic-24", "ene-feb-25", "mar-abr-25", "may-jun-25", "jul-ago-25"];

export function assertCompanyIds(ids: unknown[], label: string) {
  const expected = new Set(Array.from({ length: 40 }, (_, i) => `COMPAÑIA ${i + 1}`));
  if (ids.length !== 40 || new Set(ids).size !== 40 || ids.some(id => !expected.has(String(id)))) {
    throw new Error(`${label}: expected exactly COMPAÑIA 1–40, without duplicates.`);
  }
}
