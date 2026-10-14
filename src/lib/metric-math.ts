export function completeSum(parts: Array<number | null>): number | null {
  return parts.length && parts.every(v => v !== null && Number.isFinite(v) && v >= 0)
    ? parts.reduce<number>((s, v) => s + v!, 0) : null;
}

export function matchedRate<T>(rows: T[], numerator: (row: T) => number | null, denominator: (row: T) => number | null, scale = 100) {
  const pairs = rows.map(row => [numerator(row), denominator(row)] as const)
    .filter((p): p is readonly [number, number] => p[0] !== null && p[1] !== null && Number.isFinite(p[0]) && Number.isFinite(p[1]) && p[0] >= 0 && p[1] > 0);
  const num = pairs.reduce((s, p) => s + p[0], 0);
  const den = pairs.reduce((s, p) => s + p[1], 0);
  return { n: pairs.length, numerator: num, denominator: den, value: den ? num / den * scale : null };
}
