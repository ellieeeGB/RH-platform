"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDownToLine, ArrowUpRight, Building2, CalendarDays, GitCompareArrows } from "lucide-react";
import { PageSummary } from "@/components/analysis/page-summary";
import { DataQuality } from "@/components/ui/data-visuals";
import { useFilters } from "@/components/filters/filter-context";
import { companySelectionLabel, timeSelectionLabel } from "@/lib/comparison-selection";
import { buildComparison, COMPARISON_METRICS, comparisonCsvRows, type ComparisonMetric } from "@/lib/selection-comparison";
import { downloadCsv } from "@/lib/company-detail";
import { DecisionReading } from "@/components/analysis/executive-brief";
import { EXECUTIVE_METRICS } from "@/lib/executive-reading";

const colors = ["#087e8b", "#7555b7", "#b25927", "#2563ab", "#a53d68", "#386a46"];
const strokes = [undefined, "9 4", "3 4", "12 4 3 4", "1 4", "7 3 1 3"];
const number = (value: number | null, digits = 1) => value === null ? "—" : value.toLocaleString("es-MX", { maximumFractionDigits: digits });
const signed = (value: number | null) => value === null ? "—" : `${value > 0 ? "+" : ""}${number(value)}`;
type Result = ReturnType<typeof buildComparison>;

export function ComparisonPlot({ result, grouped }: { result: Result; grouped: boolean }) {
  const id = useId();
  const [focus, setFocus] = useState<string | null>(null);
  const spec = COMPARISON_METRICS[result.metric];
  if (result.cuts.length === 1) {
    const max = Math.max(1, ...result.rows.map(r => r.values[0] ?? 0));
    return <div aria-label={`${spec.label} por compañía`} className="max-h-[360px] space-y-4 overflow-y-auto pr-3">{result.rows.map(r=><div key={r.company} className="grid grid-cols-[100px_1fr_82px] items-center gap-3 text-xs"><span className="font-semibold">{r.company}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full" style={{width:`${(r.values[0]??0)/max*100}%`,background:colors[0]}}/></div><span className="text-right font-bold">{number(r.values[0])}</span></div>)}</div>;
  }
  const series = grouped ? [{ company: "Conjunto comparable", values: result.points.map(p=>p.fixed.value) }] : result.rows;
  const activeFocus = series.some(row => row.company === focus) ? focus : null;
  const max = Math.max(1, ...series.flatMap(r=>r.values.filter((v):v is number=>v!==null))) * 1.1;
  const dates = result.cuts.map(c=>{const [year,month]=c.date.split("-").map(Number);return year*12+month;});
  const x = (index:number) => 85+(dates[index]-dates[0])/Math.max(1,dates.at(-1)!-dates[0])*790;
  const y = (value:number) => 245-value/max*190;
  return <>
    <svg role="img" aria-labelledby={`${id}-title ${id}-desc`} viewBox="0 0 960 300" className="w-full min-w-[560px]">
      <title id={`${id}-title`}>{`${spec.label} · ${grouped?"mismas compañías":"por compañía"}`}</title>
      <desc id={`${id}-desc`}>{`Eje vertical: ${spec.unit}. Eje horizontal: periodos seleccionados, con distancia proporcional al tiempo. Los datos faltantes interrumpen la línea. Valores exactos en la tabla inferior.`}</desc>
      {[0,1,2,3,4].map(t=><g key={t}><line x1="85" x2="875" y1={y(max*t/4)} y2={y(max*t/4)} stroke="#e6ebf2"/><text x="72" y={y(max*t/4)+4} textAnchor="end" fontSize="11" fill="#64748b">{number(max*t/4)}</text></g>)}
      {result.cuts.map((c,i)=><text key={c.id} x={x(i)} y={270+(i%2)*17} textAnchor="middle" fontSize="11" fill="#64748b">{c.label}</text>)}
      {series.map((r,index)=>{
        const segments:string[][]=[];let segment:string[]=[];
        r.values.forEach((v,i)=>{if(v===null){if(segment.length)segments.push(segment);segment=[];}else segment.push(`${x(i)},${y(v)}`);});
        if(segment.length)segments.push(segment);
        return <g key={r.company} data-company={r.company} opacity={activeFocus && activeFocus !== r.company ? .2 : 1} stroke={colors[index%colors.length]} fill={colors[index%colors.length]}>{segments.map((s,i)=><polyline key={i} points={s.join(" ")} fill="none" strokeWidth={activeFocus === r.company ? 4 : 2.5} strokeDasharray={strokes[index%strokes.length]}/>)}{r.values.map((v,i)=>v===null?null:<circle key={i} cx={x(i)} cy={y(v)} r="4.5"><title>{`${r.company} · ${result.cuts[i].label}: ${number(v)} ${spec.unit}`}</title></circle>)}</g>;
      })}
    </svg>
    <div className="plot-legend" role="group" aria-label="Destacar compañía en la gráfica">{series.map((s,i)=>series.length===1?<span key={s.company} className="text-xs font-semibold text-cyan-900">{s.company}</span>:<button key={s.company} type="button" aria-pressed={activeFocus===s.company} aria-label={`Destacar ${s.company}`} onClick={()=>setFocus(activeFocus===s.company?null:s.company)}><svg width="24" height="8" aria-hidden="true"><line x1="0" x2="24" y1="4" y2="4" stroke={colors[i%colors.length]} strokeWidth="2.5" strokeDasharray={strokes[i%strokes.length]}/></svg>{s.company}</button>)}</div>
    {series.length>1&&<p className="mt-2 text-xs text-slate-500" aria-live="polite">{activeFocus?`${activeFocus} destacada. Pulsa de nuevo para restablecer la vista.`:"Selecciona una compañía en la leyenda para destacar su trayectoria."}</p>}
  </>;
}

export function ComparisonView() {
  const { comparison, setCompany, setPeriod, setMonth } = useFilters();
  const router = useRouter();
  const [metric, setMetric] = useState<ComparisonMetric>("turnover");
  const [group, setGroup] = useState(false);
  const result = useMemo(()=>buildComparison(comparison,metric),[comparison,metric]);
  const spec = COMPARISON_METRICS[result.metric];
  const grouped = group || comparison.companies.length > 6;
  const latest = result.points.at(-1)!;
  const lastCut = result.cuts.at(-1)!;
  const hasTime = result.cuts.length > 1;
  const observations = result.rows.reduce((n,r)=>n+r.values.filter(v=>v!==null).length,0);
  const changeUnit = spec.unit === "%" ? "puntos porcentuales" : spec.unit;
  const allValues = result.rows.flatMap(r=>r.values).filter((v):v is number=>v!==null);
  const peak = Math.max(1,...allValues);
  function detail(company:string,index:number) {
    setCompany(company);setPeriod(result.cuts[index].period);
    if(comparison.timeMode==="months")setMonth(result.cuts[index].id);
    router.push(spec.href);
  }
  return <>
    <section className="page-heading mb-7">
      <div className="eyebrow flex items-center gap-2"><GitCompareArrows size={15}/> Análisis comparativo</div>
      <h1 className="mb-3 mt-2 text-3xl font-black tracking-tight md:text-[2.65rem]">Comparación de compañías y periodos</h1>
      <p className="max-w-3xl text-sm leading-6 text-slate-500">Compara indicadores entre compañías y periodos. Selecciona cualquier cifra de la tabla para consultar su detalle.</p>
      <div className="mt-4 flex flex-wrap gap-2" aria-live="polite"><span className="filter-chip"><Building2 size={14}/>{companySelectionLabel(comparison.companies)}</span><span className="filter-chip"><CalendarDays size={14}/>{timeSelectionLabel(comparison)}</span>{comparison.companies.length>1&&comparison.companies.length<=4&&<span className="self-center text-xs text-slate-500">{comparison.companies.join(" · ")}</span>}</div>
    </section>
    <PageSummary/>
    <section className="panel p-5 md:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <label className="text-xs font-bold text-slate-500">Indicador<select aria-label="Indicador a comparar" value={result.metric} onChange={e=>setMetric(e.target.value as ComparisonMetric)} className="mt-2 block max-w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-bold text-slate-900">{(Object.keys(COMPARISON_METRICS) as ComparisonMetric[]).filter(k=>comparison.timeMode==="months"?k==="monthlyExits":k!=="monthlyExits").map(k=><option key={k} value={k}>{EXECUTIVE_METRICS[k].label}</option>)}</select></label>
        <button type="button" onClick={()=>downloadCsv(comparisonCsvRows(result),`catch-comparacion-${result.metric}.csv`)} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-cyan-900"><ArrowDownToLine size={15}/> Descargar comparación</button>
      </div>
      <details className="mt-4 max-w-4xl text-xs leading-5 text-slate-500"><summary className="cursor-pointer font-bold text-slate-700">Qué mide y cómo se calcula</summary><p className="mt-2">{spec.description}</p></details>
      {comparison.timeMode==="months"&&<p className="mt-3 rounded-xl bg-cyan-50 p-3 text-xs leading-5 text-cyan-950">Vista mensual de bajas. Los demás indicadores están disponibles en «Un bimestre», «Comparar bimestres» o «Todo el historial».</p>}
    </section>
    <DecisionReading result={result}/>
    <section className="my-5 grid gap-4 md:grid-cols-2" aria-label="Resumen de la comparación">
      <article className="rounded-2xl bg-[#0b2140] p-5 text-white"><div className="text-xs text-cyan-100">{hasTime?"Último periodo seleccionado":"Periodo seleccionado"} · {lastCut.label}</div><div className="mt-3 text-3xl font-black">{number(latest.available.value)} <span className="text-xs font-medium text-cyan-100">{spec.unit}</span></div><DataQuality different={latest.available.n!==result.common.length}><p>{latest.available.n} de {comparison.companies.length} compañías con datos válidos · {spec.aggregation==="median"?"mediana de la selección":spec.aggregation==="rate"?"tasa ponderada del conjunto":"suma del conjunto en este corte"}.</p></DataQuality><p className="mt-2 text-xs text-cyan-100">Base disponible del corte</p></article>
      <article className="panel p-5"><div className="text-xs text-slate-500">{hasTime?"Cambio del primer al último periodo":"Compañías con información"}</div><div className="mt-3 text-3xl font-black">{hasTime?signed(result.delta):latest.available.n}<span className="ml-2 text-xs font-medium text-slate-500">{hasTime?changeUnit:"compañías"}</span></div><p className="mt-2 text-xs leading-5 text-slate-500">{hasTime?`${result.common.length} compañías tienen este indicador en todos los periodos elegidos. El cambio usa solo esas compañías.`:"Cada barra y fila corresponde a una compañía. Un guion significa que falta información."}{hasTime&&spec.unit==="%"?" Un punto porcentual equivale a un caso más o menos por cada 100 empleados.":""}</p></article>
      <div className="md:col-span-2"><DataQuality different={latest.available.n!==result.common.length}><p>{observations} / {comparison.companies.length*result.cuts.length} respuestas disponibles. Cada respuesta corresponde a una compañía en un periodo. «—» significa que falta información suficiente.</p><p>Último corte: {latest.available.n} empresas. Cambio comparable: las mismas {result.common.length} empresas en todos los periodos. No mezclar ambas bases al interpretar una diferencia.</p></DataQuality></div>
    </section>
    <section className="panel p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-black">{hasTime?"Evolución del indicador":"Comparación por compañía"}</h2><p className="mt-1 text-xs text-slate-500">{spec.label} · {spec.unit}</p></div>{hasTime&&comparison.companies.length<=6&&<div className="flex gap-1 rounded-xl bg-slate-100 p-1" role="group" aria-label="Mostrar gráfica"><button type="button" aria-pressed={!grouped} onClick={()=>setGroup(false)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${!grouped?"bg-white shadow-sm":"text-slate-500"}`}>Por compañía</button><button type="button" aria-pressed={grouped} onClick={()=>setGroup(true)} className={`rounded-lg px-3 py-2 text-xs font-semibold ${grouped?"bg-white shadow-sm":"text-slate-500"}`}>Conjunto comparable</button></div>}</div>
      {hasTime&&grouped&&<p className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">La gráfica conserva las mismas {result.common.length} compañías en todos los cortes. {comparison.companies.length>6?"Con más de seis compañías, mostramos el conjunto aquí y cada compañía en la tabla.":"Así evitamos confundir cambios de cobertura con cambios del indicador."}</p>}
      {(!allValues.length||(hasTime&&grouped&&!result.common.length))?<p role="status" className="py-14 text-center text-sm text-slate-500">{!allValues.length?"No hay datos válidos para esta selección.":"No hay compañías con datos válidos en todos los cortes. La tabla muestra lo disponible en cada periodo; elige menos periodos para encontrar una base común."}</p>:<div className="mt-6 overflow-x-auto"><ComparisonPlot result={result} grouped={grouped}/></div>}
    </section>
    <section className="panel mt-5 overflow-hidden">
      <div className="p-5 md:p-6"><h2 className="text-lg font-black">Detalle por compañía y periodo</h2><p className="mt-1 text-xs leading-5 text-slate-500">Más intensidad indica un valor mayor, no necesariamente un mejor resultado. Pulsa una cifra para abrir su detalle. Unidad: {spec.unit}.</p></div>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="Tabla de comparación desplazable"><table className="comparison-table w-full text-right text-xs"><caption className="sr-only">{spec.label} por compañía y periodo. Los guiones indican datos insuficientes.</caption><thead><tr className="bg-slate-50 text-slate-500"><th scope="col" className="text-left">Compañía</th>{result.cuts.map(c=><th scope="col" key={c.id}>{c.label}</th>)}{hasTime&&<th scope="col">Cambio entre extremos{spec.unit==="%"?" (pp)":""}</th>}</tr></thead><tbody>
        {result.rows.map(r=><tr key={r.company}><th scope="row">{r.company}</th>{r.values.map((v,i)=><td key={i} style={{background:v===null?"#f8fafc":`rgba(8,145,178,${.035+v/peak*.17})`}}>{v===null?<span aria-label="Sin dato válido">—</span>:<button type="button" onClick={()=>detail(r.company,i)} aria-label={`Ver ${r.company}, ${result.cuts[i].label}: ${number(v)} ${spec.unit}`} className="inline-flex items-center gap-1.5 rounded font-bold text-slate-800 hover:underline">{number(v)}<ArrowUpRight size={12} className="text-cyan-700"/></button>}</td>)}{hasTime&&<td className="font-semibold">{signed(r.values[0]!==null&&r.values.at(-1)!==null?r.values.at(-1)!-r.values[0]!:null)}</td>}</tr>)}
        <tr className="font-bold"><th scope="row">Conjunto disponible<span className="mt-1 block font-normal text-slate-500">Cobertura de cada periodo</span></th>{result.points.map(p=><td key={p.id}>{number(p.available.value)}<span className="mt-1 block font-normal text-slate-500">{p.available.n} compañías</span></td>)}{hasTime&&<td>—</td>}</tr>
        {hasTime&&<tr className="font-bold text-cyan-900"><th scope="row">Conjunto comparable<span className="mt-1 block font-normal text-slate-500">Las mismas {result.common.length} compañías</span></th>{result.points.map(p=><td key={p.id}>{number(p.fixed.value)}</td>)}<td>{signed(result.delta)}</td></tr>}
      </tbody></table></div>
      <details className="p-5 text-xs leading-6 text-slate-500"><summary className="cursor-pointer font-bold text-slate-700">Cómo leer la comparación</summary><p className="mt-2">Las filas muestran datos reportados para tu selección. El conjunto disponible puede cambiar de cobertura entre periodos. El conjunto comparable mantiene únicamente las compañías con información válida en todos los periodos elegidos. No se rellenan datos faltantes, ni se suman porcentajes, salarios o plantillas a través del tiempo. Las tasas del conjunto dividen sumas de cantidades emparejadas; no promedian los porcentajes individuales. Los cambios son descriptivos, no explicaciones causales.</p>{result.common.length>0&&<p className="mt-2">Base comparable: {result.common.join(", ")}.</p>}</details>
    </section>
  </>;
}
