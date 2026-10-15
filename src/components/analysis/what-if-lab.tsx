"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Calculator, Clock3, RefreshCcw, TrendingDown, WalletCards } from "lucide-react";
import { calculateScenario, defaultScenario, scenarioBaseline, type ScenarioInputs } from "@/lib/scenario";

const mxn = (value: number) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 0,
}).format(value);

const mxn2 = (value: number) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
}).format(value);

function SliderField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
  helper,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  suffix: string;
  onChange: (value: number) => void;
  helper: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-extrabold text-slate-900">{label}</div>
          <div className="mt-1 text-[11px] leading-4 text-slate-400">{helper}</div>
        </div>
        <div className="shrink-0 rounded-xl bg-slate-950 px-3 py-2 text-sm font-black text-white">{value.toLocaleString("es-MX")}{suffix}</div>
      </div>
      <input
        className="mt-4 w-full accent-cyan-600"
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-1 flex justify-between text-[10px] font-semibold text-slate-300"><span>{min}{suffix}</span><span>{max}{suffix}</span></div>
    </div>
  );
}

export function WhatIfLab() {
  const [inputs, setInputs] = useState<ScenarioInputs>(defaultScenario);
  const scenario = useMemo(() => calculateScenario(inputs), [inputs]);

  const update = <K extends keyof ScenarioInputs>(key: K, value: ScenarioInputs[K]) => {
    setInputs((current) => ({ ...current, [key]: value }));
  };

  const salaryPosition = scenario.newSalaryEntryDaily >= scenarioBaseline.salaryEntryQ3Daily
    ? "Alcanza o supera Q3"
    : `${mxn2(Math.max(0, scenario.gapToQ3Daily))}/día debajo de Q3`;

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[.78fr_1.22fr]">
        <article className="panel p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="eyebrow">Supuestos del escenario</div>
              <h2 className="mt-1 text-lg font-extrabold text-slate-950">Mueve los supuestos</h2>
            </div>
            <button onClick={() => setInputs(defaultScenario)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-500"><RefreshCcw size={14} /> Restablecer</button>
          </div>

          <div className="space-y-3">
            <SliderField label="Bajas / plantilla objetivo" value={inputs.turnoverTargetPct} min={3} max={20} step={0.1} suffix="%" onChange={(value) => update("turnoverTargetPct", value)} helper={`Actual: ${scenarioBaseline.currentTurnoverPct.toFixed(2)}% bimestral`} />
            <SliderField label="Aumento salario de ingreso" value={inputs.salaryIncreasePct} min={0} max={15} step={0.5} suffix="%" onChange={(value) => update("salaryIncreasePct", value)} helper={`Mediana actual: ${mxn2(scenarioBaseline.currentSalaryEntryDaily)}/día`} />
            <SliderField label="Time-to-fill técnico objetivo" value={inputs.technicalTimeToFillTargetDays} min={10} max={30} step={1} suffix=" d" onChange={(value) => update("technicalTimeToFillTargetDays", value)} helper={`Actual: ${scenarioBaseline.currentTechnicalTimeToFillDays} días`} />
            <SliderField label="Contrataciones operativas afectadas" value={inputs.affectedOperationalHires} min={100} max={2500} step={25} suffix="" onChange={(value) => update("affectedOperationalHires", value)} helper={`Vacantes operativas previstas: ${scenarioBaseline.operationalVacancies.toLocaleString("es-MX")}`} />
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl bg-slate-950 p-5 text-white shadow-soft md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="eyebrow !text-cyan-300">Resultado del escenario</div>
              <h2 className="mt-1 text-xl font-black">Impacto calculado</h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-cyan-100">No causal · fórmula transparente</span>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-white/5 p-5">
              <div className="flex items-center justify-between"><TrendingDown size={18} className="text-emerald-300" /><span className="text-[10px] uppercase tracking-wide text-slate-400">Retención</span></div>
              <div className="mt-4 text-3xl font-black">≈ {scenario.estimatedExitsAvoided.toLocaleString("es-MX")}</div>
              <div className="mt-1 text-xs text-slate-300">bajas equivalentes evitadas si la tasa de bajas bajara a {inputs.turnoverTargetPct}%</div>
              <div className="mt-4 text-[10px] leading-4 text-slate-500">({scenarioBaseline.currentTurnoverPct.toFixed(2)}% − {inputs.turnoverTargetPct}%) × {scenarioBaseline.headcount.toLocaleString("es-MX")} personas · subconjunto con ambos datos</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-5">
              <div className="flex items-center justify-between"><WalletCards size={18} className="text-cyan-300" /><span className="text-[10px] uppercase tracking-wide text-slate-400">Compensación</span></div>
              <div className="mt-4 text-3xl font-black">{mxn(scenario.annualizedSalaryExposure)}</div>
              <div className="mt-1 text-xs text-slate-300">exposición salarial anualizada sobre {inputs.affectedOperationalHires.toLocaleString("es-MX")} contrataciones</div>
              <div className="mt-4 text-[10px] leading-4 text-slate-500">Δ diario {mxn2(scenario.dailySalaryDelta)} × contrataciones × 365 días</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-5">
              <div className="flex items-center justify-between"><Clock3 size={18} className="text-amber-300" /><span className="text-[10px] uppercase tracking-wide text-slate-400">Velocidad</span></div>
              <div className="mt-4 text-3xl font-black">{scenario.technicalVacancyDaysAvoided.toLocaleString("es-MX")}</div>
              <div className="mt-1 text-xs text-slate-300">vacancy-days técnicos evitados sobre el detalle estructurado</div>
              <div className="mt-4 text-[10px] leading-4 text-slate-500">({scenarioBaseline.currentTechnicalTimeToFillDays} − {inputs.technicalTimeToFillTargetDays}) días × {scenarioBaseline.structuredTechnicalDemand} posiciones técnicas</div>
            </div>

            <div className="rounded-2xl bg-white/5 p-5">
              <div className="flex items-center justify-between"><Calculator size={18} className="text-violet-300" /><span className="text-[10px] uppercase tracking-wide text-slate-400">Posición mercado</span></div>
              <div className="mt-4 text-3xl font-black">{mxn2(scenario.newSalaryEntryDaily)}</div>
              <div className="mt-1 text-xs text-slate-300">nuevo salario de ingreso diario · {salaryPosition}</div>
              <div className="mt-4 text-[10px] leading-4 text-slate-500">Para llegar a Q3 ({mxn2(scenarioBaseline.salaryEntryQ3Daily)}) se requiere ≈ {scenario.salaryIncreaseToQ3Pct.toFixed(1)}% desde la mediana actual.</div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Lectura para la decisión</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué sí puedes concluir</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-100 p-4"><div className="text-sm font-extrabold text-slate-900">Costo</div><p className="mb-0 mt-2 text-xs leading-5 text-slate-500">Cuánto presupuesto adicional implicaría una política salarial bajo un número explícito de contrataciones afectadas.</p></div>
            <div className="rounded-2xl border border-slate-100 p-4"><div className="text-sm font-extrabold text-slate-900">Capacidad</div><p className="mb-0 mt-2 text-xs leading-5 text-slate-500">Cuánta carga equivalente de reemplazo cambia cuando modificas el objetivo de rotación.</p></div>
            <div className="rounded-2xl border border-slate-100 p-4"><div className="text-sm font-extrabold text-slate-900">Velocidad</div><p className="mb-0 mt-2 text-xs leading-5 text-slate-500">Cuántos vacancy-days representa reducir el time-to-fill del segmento técnico estructurado.</p></div>
          </div>
        </article>

        <article className="rounded-3xl border border-amber-200 bg-amber-50 p-5 md:p-6">
          <div className="eyebrow !text-amber-700">Alcance del escenario</div>
          <h2 className="mt-1 text-lg font-extrabold text-amber-950">Qué revisar antes de usarlo</h2>
          <div className="mt-4 space-y-3 text-xs leading-5 text-amber-900/80">
            <p className="m-0">• No afirma que subir salario cause automáticamente menor rotación.</p>
            <p className="m-0">• No suma vacantes futuras + reemplazos porque podrían solaparse en la fuente.</p>
            <p className="m-0">• El detalle técnico de 93 posiciones se usa como señal estructurada y no reemplaza el total oficial de vacantes.</p>
            <p className="m-0">• El costo salarial es una exposición anualizada, no un presupuesto contable definitivo.</p>
          </div>
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="eyebrow">Siguiente paso</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Usa el escenario como hipótesis, no como pronóstico.</h2>
            <p className="mb-0 mt-2 max-w-3xl text-xs leading-5 text-slate-500">Contrasta el escenario con empresas de contexto parecido y guarda la pregunta que quieres comprobar. El estudio de decisiones conserva el corte y la evidencia junto a tu seguimiento.</p>
          </div>
          <a href="/decisiones" className="flex shrink-0 items-center gap-2 rounded-2xl bg-slate-950 px-4 py-3 text-xs font-black text-white">Abrir estudio de decisiones <ArrowRight size={14} /></a>
        </div>
      </section>
    </>
  );
}
