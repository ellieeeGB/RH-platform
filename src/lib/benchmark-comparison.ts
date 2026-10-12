import { completeHeadcount, getPeriodSnapshots, type CompanySnapshot } from "./company-panel";

export type PeerSize = "all" | "under250" | "250to999" | "1000plus";
export type PeerUnion = "all" | "yes" | "no";
export const MIN_BENCHMARK_RESPONSES = 5;

export function comparisonPeers(period: string, size: PeerSize, union: PeerUnion, excludedCompany?: string) {
  return getPeriodSnapshots(period).filter(row => {
    if (row.company === excludedCompany) return false;
    const count = completeHeadcount(row);
    const sizeMatches = size === "all" || (count !== null && (
      size === "under250" ? count < 250 : size === "250to999" ? count >= 250 && count < 1000 : count >= 1000
    ));
    return sizeMatches && (union === "all" || row.laborRelations.unionized === (union === "yes"));
  });
}

export function distribution(values: (number | null)[]) {
  const sorted = values.filter((v): v is number => v !== null && Number.isFinite(v)).sort((a,b) => a-b);
  const n = sorted.length;
  if (n < MIN_BENCHMARK_RESPONSES) return { n, q1: null, median: null, q3: null };
  const quantile = (p: number) => { const i=(n-1)*p; const lo=Math.floor(i); return sorted[lo]+(sorted[Math.ceil(i)]-sorted[lo])*(i-lo); };
  return { n, q1: quantile(.25), median: quantile(.5), q3: quantile(.75) };
}

export function validSalaryBands(row: CompanySnapshot) {
  const values = [row.salaryDaily.entry, row.salaryDaily.low, row.salaryDaily.high, row.salaryDaily.max];
  return values.every((value, i) => value !== null && value > 0 && (i === 0 || value >= values[i-1]!));
}
