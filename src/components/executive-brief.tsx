"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquareText } from "lucide-react";
import { useFilters } from "./filter-context";
import { getPreviousPeriod } from "@/lib/company-panel";
import { singleSelection } from "@/lib/comparison-selection";
import { buildComparison, COMPARISON_METRICS, type ComparisonMetric } from "@/lib/selection-comparison";
import { executiveReading } from "@/lib/executive-reading";

export function DecisionReading({ result, minimum = 1 }: { result: ReturnType<typeof buildComparison>; minimum?: number }) {
  const reading = executiveReading(result, minimum);
  return <section className="executive-reading my-5 p-5 md:p-6" aria-label="Lectura para dirección">
    <div className="flex items-center gap-2 text-xs font-bold text-cyan-800"><MessageSquareText size={17}/> Lectura para dirección</div>
    <h2 className="mt-3 max-w-4xl text-xl font-black leading-snug md:text-2xl">{reading.title}</h2>
    <div className="mt-5 grid gap-5 lg:grid-cols-3">
      <div><h3 className="text-xs font-bold uppercase tracking-wide text-cyan-800">Qué pasó</h3><p className="mt-2 text-sm leading-6 text-slate-700">{reading.observation}</p></div>
      <div><h3 className="text-xs font-bold uppercase tracking-wide text-cyan-800">Para qué sirve</h3><p className="mt-2 text-sm leading-6 text-slate-700">{reading.meaning}</p></div>
      <div className="rounded-xl border border-cyan-200 bg-white/80 p-4 lg:-mt-1"><h3 className="text-xs font-bold uppercase tracking-wide text-cyan-800">Pregunta para RH</h3><p className="mt-2 text-sm font-semibold leading-6">{reading.question}</p></div>
    </div>
    <p className="mt-4 border-t border-cyan-100 pt-3 text-xs leading-5 text-slate-600">{reading.scope}</p>
  </section>;
}

export function ExecutiveBrief() {
  const { company, period, isMarket } = useFilters();
  const [metric,setMetric] = useState<ComparisonMetric>("turnover");
  const result = useMemo(()=>{
    const selection=singleSelection(company,period),previous=getPreviousPeriod(period);
    if(previous){selection.timeMode="periods";selection.periods=[previous,period];}
    return buildComparison(selection,metric);
  },[company,period,metric]);
  return <div className="my-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="Tema de la lectura ejecutiva" className="flex flex-wrap gap-2">{([["turnover","Salidas de personal"],["vacancies","Puestos por cubrir"],["salary","Sueldos de entrada"]] as const).map(([key,label])=><button key={key} type="button" aria-pressed={key===metric} onClick={()=>setMetric(key)} className={`rounded-full border px-4 py-2 text-xs font-bold ${key===metric?"border-cyan-700 bg-cyan-800 text-white":"border-slate-200 bg-white text-slate-600"}`}>{label}</button>)}</div><Link href={COMPARISON_METRICS[metric].href} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-800">Abrir el detalle <ArrowUpRight size={15}/></Link></div>
    <DecisionReading result={result} minimum={isMarket?5:1}/>
  </div>;
}
