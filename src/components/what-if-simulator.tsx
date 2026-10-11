"use client";

import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Calculator, ShieldCheck } from "lucide-react";

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const fmt = (value: number, digits = 0) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: digits }).format(value);
const money = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

type Props = {
  marketSalaryDaily: number;
};

export function WhatIfSimulator({ marketSalaryDaily }: Props) {
  const [headcount, setHeadcount] = useState(1800);
  const [dailySalary, setDailySalary] = useState(345);
  const [turnover, setTurnover] = useState(8);
  const [targetTurnover, setTargetTurnover] = useState(6);
  const [vacancies, setVacancies] = useState(120);
  const [salaryAdjustment, setSalaryAdjustment] = useState(5);

  const result = useMemo(() => {
    const safeHeadcount = Math.max(1, headcount);
    const safeTurnover = clamp(turnover, 0, 100);
    const safeTarget = clamp(targetTurnover, 0, 100);
    const currentExits = safeHeadcount * safeTurnover / 100;
    const targetExits = safeHeadcount * safeTarget / 100;
    const avoidedExits = Math.max(0, currentExits - targetExits);
    const currentHiringNeed = vacancies + currentExits;
    const targetHiringNeed = vacancies + targetExits;
    const hiringPressure = targetHiringNeed / safeHeadcount * 100;
    const newSalary = dailySalary * (1 + salaryAdjustment / 100);
    const salaryIndex = newSalary / marketSalaryDaily * 100;
    const payrollDeltaBimonthly = safeHeadcount * dailySalary * 60 * (salaryAdjustment / 100);

    const risk = hiringPressure >= 15 || safeTarget >= 10
      ? { label: "Alta", tone: "rose" }
      : hiringPressure >= 8 || safeTarget >= 7
        ? { label: "Media", tone: "amber" }
        : { label: "Controlada", tone: "emerald" };

    return {
      currentExits,
      targetExits,
      avoidedExits,
      currentHiringNeed,
      targetHiringNeed,
      hiringPressure,
      newSalary,
      salaryIndex,
      payrollDeltaBimonthly,
      risk,
    };
  }, [dailySalary, headcount, marketSalaryDaily, salaryAdjustment, targetTurnover, turnover, vacancies]);

  const inputs = [
    ["Headcount", headcount, setHeadcount, 100, 20000, 50, "personas"],
    ["Salario diario actual", dailySalary, setDailySalary, 200, 1200, 5, "MXN"],
    ["Rotación bimestral actual", turnover, setTurnover, 0, 25, 0.5, "%"],
    ["Rotación objetivo", targetTurnover, setTargetTurnover, 0, 25, 0.5, "%"],
    ["Vacantes próximas", vacancies, setVacancies, 0, 3000, 10, "plazas"],
    ["Ajuste salarial", salaryAdjustment, setSalaryAdjustment, -10, 30, 0.5, "%"],
  ] as const;

  return (
    <div className="grid gap-4 xl:grid-cols-[.82fr_1.18fr]">
      <section className="panel p-5 md:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-cyan-50 text-cyan-700"><Calculator size={19} /></div>
          <div>
            <div className="eyebrow">Inputs</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Escenario editable</h2>
          </div>
        </div>
        <div className="space-y-5">
          {inputs.map(([label, value, setter, min, max, step, suffix]) => (
            <label key={label} className="block">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-slate-600"><span>{label}</span><span>{fmt(Number(value), 1)} {suffix}</span></div>
              <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(event) => setter(Number(event.target.value))}
                className="w-full accent-cyan-600"
              />
            </label>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <article className="panel p-5"><div className="eyebrow">Bajas evitables</div><div className="mt-3 text-3xl font-black text-emerald-700">{fmt(result.avoidedExits, 0)}</div><div className="mt-1 flex items-center gap-1 text-xs font-bold text-emerald-600"><ArrowDownRight size={14}/> por bimestre</div></article>
          <article className="panel p-5"><div className="eyebrow">Necesidad de contratación</div><div className="mt-3 text-3xl font-black text-slate-950">{fmt(result.targetHiringNeed, 0)}</div><div className="mt-1 text-xs text-slate-400">vacantes + reemplazos</div></article>
          <article className="panel p-5"><div className="eyebrow">Hiring pressure</div><div className="mt-3 text-3xl font-black text-slate-950">{result.hiringPressure.toFixed(1)}%</div><div className="mt-1 text-xs text-slate-400">contratación requerida / headcount</div></article>
          <article className="panel p-5"><div className="eyebrow">Salary index</div><div className="mt-3 text-3xl font-black text-slate-950">{result.salaryIndex.toFixed(0)}</div><div className="mt-1 text-xs text-slate-400">mercado = 100</div></article>
        </div>

        <article className="panel p-5 md:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="eyebrow">Scenario output</div>
              <h2 className="mt-1 text-xl font-black text-slate-950">Impacto operativo y financiero</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">Este módulo no pretende demostrar causalidad. Calcula consecuencias matemáticas del escenario para que RH compare alternativas antes de construir un modelo predictivo.</p>
            </div>
            <div className={`rounded-2xl px-4 py-3 text-sm font-black ${result.risk.tone === "rose" ? "bg-rose-50 text-rose-700" : result.risk.tone === "amber" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>Riesgo de capacidad · {result.risk.label}</div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Demanda de reclutamiento</div>
              <div className="mt-3 flex items-end gap-3"><span className="text-3xl font-black text-slate-950">{fmt(result.currentHiringNeed, 0)}</span><ArrowDownRight className="mb-1 text-emerald-600" size={20}/><span className="text-3xl font-black text-cyan-800">{fmt(result.targetHiringNeed, 0)}</span></div>
              <div className="mt-2 text-xs text-slate-500">La reducción proviene exclusivamente de disminuir reemplazos por rotación.</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-wide text-slate-400">Costo salarial incremental · 60 días</div>
              <div className="mt-3 flex items-end gap-2"><span className="text-3xl font-black text-slate-950">{money(result.payrollDeltaBimonthly)}</span>{salaryAdjustment >= 0 ? <ArrowUpRight className="mb-1 text-amber-600" size={20}/> : <ArrowDownRight className="mb-1 text-emerald-600" size={20}/>}</div>
              <div className="mt-2 text-xs text-slate-500">Nuevo salario diario estimado: {money(result.newSalary)}.</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
            <div className="flex gap-3"><ShieldCheck className="mt-0.5 shrink-0 text-cyan-700" size={18}/><div><div className="text-sm font-extrabold text-cyan-950">Trazabilidad del cálculo</div><div className="mt-1 text-xs leading-5 text-cyan-900/70">Bajas = headcount × rotación. Contratación requerida = vacantes + bajas esperadas. Salary index = salario ajustado / mediana de mercado × 100. Costo incremental = headcount × salario diario × 60 × ajuste.</div></div></div>
          </div>
        </article>
      </section>
    </div>
  );
}
