"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, MessageSquareText } from "lucide-react";
import { useFilters } from "@/components/filters/filter-context";
import { getPreviousPeriod } from "@/lib/company-panel";
import { singleSelection } from "@/lib/comparison-selection";
import { buildComparison, COMPARISON_METRICS, type ComparisonMetric } from "@/lib/selection-comparison";
import { executiveReading, EXECUTIVE_METRICS } from "@/lib/executive-reading";

export function DecisionReading({ result, minimum = 1 }: { result: ReturnType<typeof buildComparison>; minimum?: number }) {
  const reading = executiveReading(result, minimum);
  const endpoints = reading.canCompare ? [result.points[0], result.points.at(-1)!] : [];
  const format = (value: number) => value.toLocaleString("es-MX", { maximumFractionDigits: 2 });
  const peak = Math.max(1, ...endpoints.map(point => point.fixed.value!));
  return <section className="executive-reading my-5 p-5 md:p-6" aria-label="Resultado del periodo">
    <div className={endpoints.length ? "reading-layout" : ""}>
    <div>
    <div className="flex items-center gap-2 text-xs font-bold text-cyan-800"><MessageSquareText size={17}/> Resultado del periodo</div>
    <h2 className="mt-3 max-w-4xl text-xl font-black leading-snug md:text-2xl">{reading.title}</h2>
    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">{reading.observation}</p>
    <p className="mt-2 text-xs leading-5 text-slate-600">{reading.scope}</p>
    </div>
    {endpoints.length > 0 && <figure className="reading-endpoints" aria-label="Valores del primer y último periodo en las mismas compañías">
      <figcaption className="mb-4 text-xs font-semibold text-slate-600">{EXECUTIVE_METRICS[result.metric].unit}</figcaption>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {endpoints.map((point, index) => <div key={index} className={index ? "contents" : "min-w-0"}>
          {index === 1 && <ArrowRight size={18} className="text-slate-400" aria-hidden="true"/>}
          <div className="min-w-0"><div className="text-xs text-slate-600">{result.cuts[index === 0 ? 0 : result.cuts.length - 1].label}</div>
          <div className={`mt-2 text-3xl font-bold tracking-tight ${index ? "text-cyan-900" : "text-slate-500"}`}>{format(point.fixed.value!)}</div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100" aria-hidden="true"><div className={`h-full rounded-full ${index ? "bg-cyan-700" : "bg-slate-400"}`} style={{width:`${point.fixed.value! / peak * 100}%`}}/></div></div>
        </div>)}
      </div>
    </figure>}
    </div>
    <details className="mt-4 border-t border-cyan-100 pt-3">
      <summary className="cursor-pointer text-xs font-bold text-cyan-900">Interpretación y seguimiento</summary>
      <div className="mt-4 grid gap-5 md:grid-cols-2">
        <div><h3 className="text-xs font-bold text-cyan-800">Interpretación</h3><p className="mt-2 text-sm leading-6 text-slate-700">{reading.meaning}</p></div>
        <div><h3 className="text-xs font-bold text-cyan-800">Seguimiento sugerido</h3><p className="mt-2 text-sm leading-6 text-slate-700">{reading.question}</p></div>
      </div>
    </details>
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
    <div className="flex flex-wrap items-center justify-between gap-3"><div role="group" aria-label="Tema de la lectura ejecutiva" className="metric-tabs">{([["turnover","Salidas de personal"],["vacancies","Puestos por cubrir"],["salary","Sueldos de entrada"]] as const).map(([key,label])=><button key={key} type="button" aria-pressed={key===metric} onClick={()=>setMetric(key)}>{label}</button>)}</div><Link href={COMPARISON_METRICS[metric].href} className="inline-flex items-center gap-1 text-xs font-bold text-cyan-800">Abrir el detalle <ArrowUpRight size={15}/></Link></div>
    <DecisionReading result={result} minimum={isMarket?5:1}/>
  </div>;
}
