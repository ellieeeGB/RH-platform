"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, MessageSquareText } from "lucide-react";
import { DataQuality, PeriodSlope } from "@/components/ui/data-visuals";
import { useFilters } from "@/components/filters/filter-context";
import { getPreviousPeriod } from "@/lib/company-panel";
import { singleSelection } from "@/lib/comparison-selection";
import { buildComparison, COMPARISON_METRICS, type ComparisonMetric } from "@/lib/selection-comparison";
import { executiveReading, EXECUTIVE_METRICS } from "@/lib/executive-reading";

export function DecisionReading({ result, minimum = 1 }: { result: ReturnType<typeof buildComparison>; minimum?: number }) {
  const reading = executiveReading(result, minimum);
  const endpoints = reading.canCompare ? [result.points[0], result.points.at(-1)!] : [];
  const directional = ["turnover", "exits", "monthlyExits", "vacancies", "vacancyRate", "absenceRate", "timeToFill"].includes(result.metric);
  const tone = !reading.canCompare || !directional || Math.abs(result.delta ?? 0) < 1e-9 ? "neutral" : result.delta! < 0 ? "good" : ["vacancies", "vacancyRate"].includes(result.metric) ? "attention" : "alert";
  return <section className="executive-reading my-5 p-5 md:p-6" aria-label="Hallazgo del periodo">
    <div className={endpoints.length ? "reading-layout" : ""}>
    <div>
    <div className="flex items-center gap-2 text-xs font-bold text-cyan-800"><MessageSquareText size={17}/> Hallazgo del periodo</div>
    <h2 className="mt-3 max-w-4xl text-xl font-black leading-snug md:text-2xl">{reading.title}</h2>
    <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">{reading.observation}</p>
    <DataQuality different={result.common.length !== result.points.at(-1)?.available.n}><p>{reading.scope}</p><p>El total del corte usa las respuestas disponibles; el cambio mantiene las mismas empresas. Por eso las cifras pueden diferir.</p></DataQuality>
    </div>
    {endpoints.length > 0 && <div className="reading-endpoints"><PeriodSlope before={endpoints[0].fixed.value!} after={endpoints[1].fixed.value!} firstLabel={result.cuts[0].label} lastLabel={result.cuts.at(-1)!.label} unit={EXECUTIVE_METRICS[result.metric].unit} tone={tone}/></div>}
    </div>
    <div className="finding-action"><span>Qué hacer</span><p>{reading.question}</p></div>
    <details className="mt-4 border-t border-cyan-100 pt-3">
      <summary className="cursor-pointer text-xs font-bold text-cyan-900">Qué mide y cómo se calcula</summary>
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
