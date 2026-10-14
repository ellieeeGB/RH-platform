export type DecisionNote = {
  id: string; createdAt: string; period: string; company: string; sourceSha256: string; implementationSha256: string;
  hypothesis: string; owner: string; due: string; status: "open" | "reviewed"; result: string;
  evidence: { salary: number | null; turnover: number | null; comparableN: number; rateChange: number | null; within: number | null; weight: number | null; peerSize: string; peerUnion: string; excludeFlagged: boolean };
};
const text = (v: unknown, max: number) => typeof v === "string" && v.length <= max;
const nullableNumber = (v: unknown) => v === null || typeof v === "number" && Number.isFinite(v);
export function readDecisionNotes(raw: string | null): DecisionNote[] {
  try {
    const parsed: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(parsed)) return [];
    const ids = new Set<string>();
    return parsed.filter((r): r is DecisionNote => {
      if (!r || typeof r !== "object") return false;
      const e = r.evidence;
      const ok = text(r.id, 100) && !ids.has(r.id) && text(r.createdAt, 40) && text(r.period, 40) && text(r.company, 100) && /^[a-f0-9]{64}$/.test(r.sourceSha256) && /^[a-f0-9]{64}$/.test(r.implementationSha256) && text(r.hypothesis, 1500) && text(r.owner, 200) && text(r.due, 10) && (r.status === "open" || r.status === "reviewed") && text(r.result, 2000) && e && [e.salary, e.turnover, e.rateChange, e.within, e.weight].every(nullableNumber) && Number.isInteger(e.comparableN) && e.comparableN >= 0 && e.comparableN <= 40 && text(e.peerSize, 30) && text(e.peerUnion, 30) && typeof e.excludeFlagged === "boolean";
      if (ok) ids.add(r.id);
      return !!ok;
    }).slice(0, 100);
  } catch { return []; }
}
