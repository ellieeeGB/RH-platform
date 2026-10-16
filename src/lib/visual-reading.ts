import type { SignalMetric } from "./signal-analysis";
export function movementTone(metric: SignalMetric, delta: number | null) {
  if (delta === null || delta === 0) return "neutral" as const;
  // More people or hires is not inherently good: it can reflect replacement or growth.
  if (metric !== "exits" && metric !== "vacancies") return "neutral" as const;
  return delta < 0 ? "good" as const : metric === "exits" ? "alert" as const : "attention" as const;
}
export function movementSentence(metric: SignalMetric, delta: number | null) {
  if (delta === null) return "Faltan datos para comparar el cambio.";
  if (delta === 0) return "Sin cambio frente al bimestre anterior.";
  const nouns: Record<SignalMetric,string> = { exits:"salidas", hires:"contrataciones", headcount:"personas", vacancies:"puestos pendientes", training:"horas de capacitación" };
  return `${Math.abs(delta).toLocaleString("es-MX",{maximumFractionDigits:1})} ${nouns[metric]} ${delta>0?"más":"menos"} que el bimestre anterior.`;
}
