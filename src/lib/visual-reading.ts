import type { ComparisonMetric } from "./selection-comparison";
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


export function comparisonTone(metric: ComparisonMetric, delta: number | null) {
  if (delta === null || Math.abs(delta) < 1e-9 || ["headcount", "hires", "salary"].includes(metric)) return "neutral" as const;
  return delta < 0 ? "good" as const : ["vacancies", "vacancyRate"].includes(metric) ? "attention" as const : "alert" as const;
}

export function comparisonMovement(metric: ComparisonMetric, delta: number | null) {
  if (delta === null) return "Faltan datos para comparar el cambio.";
  if (Math.abs(delta) < 1e-9) return "Sin cambio entre los periodos seleccionados.";
  const magnitude = Math.abs(delta) < .01 ? "Menos de 0.01" : Math.abs(delta).toLocaleString("es-MX", { maximumFractionDigits: 2 });
  const direction = delta > 0 ? "más" : "menos";
  const units: Record<ComparisonMetric, [string, string]> = {
    turnover: ["salidas", "por cada 100 empleados"], exits: ["salidas", ""], monthlyExits: ["salidas", ""], headcount: ["personas", "al cierre"], hires: ["contrataciones", ""], vacancies: ["puestos pendientes", ""], vacancyRate: ["puestos pendientes", "por cada 100 empleados"], salary: ["MXN", "al día"], absenceRate: ["ausencias", "por cada 100 empleados"], timeToFill: ["días", "para cubrir un puesto"]
  };
  const [noun, suffix] = units[metric];
  return `${magnitude} ${noun} ${direction}${suffix ? ` ${suffix}` : ""}.`;
}
