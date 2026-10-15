"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, ArrowRight, Download, Fingerprint, Layers3, ScanLine, Sparkles } from "lucide-react";
import { DashboardFrame } from "@/components/layout/dashboard-frame";
import { useFilters } from "@/components/filters/filter-context";
import { analyzeSignal, signalCoverage, signalMetrics, type SignalMetric } from "@/lib/signal-analysis";
import { qualityReport } from "@/lib/data-quality";
import manifest from "../../../data/processed/pipeline-manifest.json";

const fmt = (n: number | null) => n === null ? "—" : new Intl.NumberFormat("es-MX", {maximumFractionDigits:1}).format(n);
const signed = (n: number | null, suffix = "") => n === null ? "Sin base comparable" : `${n > 0 ? "+" : ""}${fmt(n)}${suffix}`;

export default function SignalsPage() {
  const [metric, setMetric] = useState<SignalMetric>("exits");
  const {period, company, companyLabel, isMarket} = useFilters();
  const result = analyzeSignal(metric, period, company);
  const spec = signalMetrics[metric];
  const coverage = signalCoverage(metric, company);
  const quality = qualityReport(period, company);
  const comparable = result.n >= (isMarket ? 5 : 1);
  const maxContribution = Math.max(1, ...result.contributors.map(c => Math.abs(c.delta)));
  const exportEvidence = () => {
    const report = {title: `Catch · ${spec.label}`, period, company: companyLabel, sourceSha256: manifest.sourceSha256, sourceColumns: spec.source, method: "Suma de respuestas no negativas; comparación entre empresas con datos en ambos cortes. Sensibilidad al omitir una empresa, no intervalo de confianza ni efecto causal.", result, quality, nextStep: "Confirmar los cambios con mayor aportación y completar las respuestas ausentes antes de decidir."};
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], {type:"application/json"}));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = `catch-evidencia-${metric}-${period.toLowerCase().replaceAll(" ", "-")}.json`; anchor.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const direction = result.matchedDelta === null ? "Falta un corte comparable" : result.matchedDelta > 0 ? `${spec.label} en aumento` : result.matchedDelta < 0 ? `${spec.label} en descenso` : `${spec.label} sin cambio neto`;
  return <DashboardFrame>
    <section className="relative overflow-hidden rounded-[28px] bg-[#091d35] p-6 text-white md:p-8">
      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:radial-gradient(#6be6dd_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-2xl"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.18em] text-cyan-300"><ScanLine size={16}/> Catch Signals · Laboratorio de evidencia</div><h1 className="mt-4 text-3xl font-black leading-tight tracking-tight md:text-4xl">Cambios y solidez de la evidencia</h1><p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">Separa el cambio de las mismas empresas del cambio en respuestas. Explora quién lo explica y cuánto depende de un solo caso.</p></div>
        <button onClick={exportEvidence} className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-4 py-3 text-xs font-bold hover:bg-white/20"><Download size={16}/> Descargar evidencia</button>
      </div>
      <div className="relative mt-6 flex flex-wrap gap-2 text-xs text-slate-200"><span className="rounded-full bg-white/10 px-3 py-2">{companyLabel}</span><span className="rounded-full bg-white/10 px-3 py-2">{result.previous ?? "Sin corte anterior"} → {period}</span><span className="rounded-full bg-cyan-300/10 px-3 py-2 text-cyan-200">Datos reportados · sin imputación</span></div>
    </section>

    <div className="my-5 flex flex-wrap gap-2" role="group" aria-label="Indicador por investigar">{Object.entries(signalMetrics).map(([key, s]) => <button key={key} onClick={() => setMetric(key as SignalMetric)} aria-pressed={metric === key} className={`rounded-full border px-4 py-2.5 text-sm font-bold transition ${metric === key ? "border-cyan-700 bg-cyan-700 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-cyan-600"}`}>{s.label}</button>)}</div>

    <section aria-live="polite" className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
      <article className="panel p-5 md:p-7">
        <div className="flex items-center justify-between gap-3"><div className="eyebrow">01 · El cambio comparable</div><Layers3 size={20} className="text-cyan-700"/></div>
        <h2 className="mt-3 text-xl font-black text-slate-950">{comparable ? direction : "Necesitamos más respuestas comparables"}</h2>
        <div className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2"><div className="text-5xl font-black tracking-tight text-[#0b2140]">{comparable && result.matchedPct !== null ? signed(result.matchedPct, "%") : "—"}</div><div className="text-sm font-semibold text-slate-500">{result.n} {result.n === 1 ? "empresa en ambos cortes" : "empresas en ambos cortes"}</div></div>
        <p className="mt-4 text-sm leading-6 text-slate-600">{comparable ? `${fmt(result.matchedBefore)} → ${fmt(result.matchedAfter)} ${spec.unit}. ${result.matchedBefore === 0 ? "La base anterior es cero: se muestra el cambio absoluto, sin inventar un porcentaje." : "La comparación conserva exactamente las mismas empresas."}` : result.previous ? "El mercado necesita al menos cinco empresas con este dato en ambos periodos. Puedes revisar la cobertura abajo." : "Este es el primer bimestre disponible. Selecciona uno posterior para comparar."}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[["Cambio observado",result.delta,"Todas las respuestas"],["Mismas empresas",result.matchedDelta,"Cambio dentro del panel"],["Respuestas que cambian",result.compositionDelta,`${result.entering} aparecen · ${result.leaving} faltan`]].map(([label,value,note])=><div key={String(label)} className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-xs font-bold text-slate-500">{String(label)}</div><div className="mt-2 text-2xl font-black text-slate-950">{signed(value as number|null)}</div><div className="mt-2 text-xs leading-5 text-slate-500">{String(note)}</div></div>)}
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-500">Cambio observado = cambio de las mismas empresas + aportación de respuestas que aparecen o faltan. Esto describe los datos disponibles; no demuestra una causa.</p>
      </article>
      <article className="rounded-[26px] border border-cyan-200 bg-[#eaf8f8] p-5 md:p-7">
        <div className="flex items-center justify-between"><div className="eyebrow">02 · Pon la señal a prueba</div><Fingerprint size={21} className="text-cyan-800"/></div>
        <h2 className="mt-3 text-xl font-black text-[#0b2140]">Sensibilidad a cada empresa</h2>
        {result.sensitivity ? <><div className="mt-6 flex flex-wrap items-baseline gap-2 text-3xl font-black tracking-tight text-cyan-900"><span>{signed(result.sensitivity.min, "%")}</span><span className="text-lg font-normal">a</span><span>{signed(result.sensitivity.max, "%")}</span></div><p className="mt-3 text-sm leading-6 text-slate-700">Rango del cambio al retirar cada empresa, una por una. Siempre quedan al menos cinco.</p><div className="mt-5 rounded-2xl border border-cyan-200 bg-white/80 p-4"><div className="text-sm font-black text-cyan-950">{result.sensitivity.directionStable ? "La dirección se mantiene" : "La dirección puede cambiar"}</div><p className="mt-2 text-xs leading-5 text-slate-600">{result.sensitivity.directionStable ? "Ninguna empresa por sí sola invierte el sentido del cambio. Revisa también la cobertura y la magnitud." : "Conviene confirmar las principales aportaciones antes de generalizar la señal."}</p></div></> : <p className="mt-6 text-sm leading-7 text-slate-600">Esta prueba necesita al menos seis empresas comparables y denominadores positivos después de cada exclusión. Selecciona mercado completo u otro indicador.</p>}
        <p className="mt-5 text-xs leading-5 text-slate-600">Es una prueba de sensibilidad, no una predicción ni un intervalo de confianza estadístico.</p>
      </article>
    </section>

    <section className="mt-4 grid items-start gap-4 xl:grid-cols-[1.45fr_1fr]">
      <article className="panel overflow-hidden"><div className="p-5 md:p-7"><div className="eyebrow">03 · Sigue las aportaciones</div><h2 className="mt-2 text-xl font-black text-slate-950">Qué empresas explican el movimiento</h2><p className="mt-2 text-xs leading-5 text-slate-500">Ordenadas por cambio absoluto. El signo indica aumento o descenso, sin calificarlo como bueno o malo.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[480px] text-sm"><caption className="sr-only">Aportación por empresa al cambio de {spec.label}</caption><thead className="border-y border-slate-100 bg-slate-50 text-left text-xs text-slate-500"><tr><th className="px-5 py-3">Empresa</th><th className="px-3 py-3 text-right">Anterior</th><th className="px-3 py-3 text-right">Actual</th><th className="px-5 py-3 text-right">Cambio</th></tr></thead><tbody>{comparable && result.contributors.map(c=><tr key={c.company} className="border-b border-slate-100 last:border-0"><th scope="row" className="px-5 py-3 text-left text-xs font-bold text-slate-700">{c.company}</th><td className="px-3 py-3 text-right tabular-nums text-slate-500">{fmt(c.before)}</td><td className="px-3 py-3 text-right tabular-nums text-slate-800">{fmt(c.after)}</td><td className="px-5 py-3"><div className="flex items-center justify-end gap-1 font-bold text-slate-800">{c.delta >= 0 ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>} {signed(c.delta)}</div><div className="ml-auto mt-1.5 h-1 w-24 rounded-full bg-slate-100"><div className={`ml-auto h-1 rounded-full ${c.delta >= 0 ? "bg-cyan-600" : "bg-indigo-400"}`} style={{width:`${Math.abs(c.delta)/maxContribution*100}%`}}/></div></td></tr>)}</tbody></table>{!comparable&&<p className="p-6 text-sm text-slate-500">Sin detalle comparable para esta selección.</p>}</div></article>
      <div className="space-y-4">
        <article className="panel p-5 md:p-7"><div className="eyebrow">04 · El contexto que suele faltar</div><h2 className="mt-2 text-xl font-black text-slate-950">La huella de cobertura</h2><p className="mt-2 text-xs leading-5 text-slate-500">Empresas con {spec.label.toLowerCase()} completo en cada bimestre. Un cero reportado sí cuenta.</p><div className="mt-5 space-y-3">{coverage.map(c=><div key={c.period} className="grid grid-cols-[80px_1fr_40px] items-center gap-3 text-xs"><span className={c.period===period?"font-black text-cyan-800":"text-slate-600"}>{c.period}</span><div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${c.period===period?"bg-cyan-600":"bg-slate-300"}`} style={{width:`${c.n/(isMarket?40:1)*100}%`}}/></div><span className="text-right font-bold text-slate-600">{c.n}/{isMarket?40:1}</span></div>)}</div></article>
        <article className="rounded-[26px] bg-[#0b2140] p-5 text-white md:p-7"><div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><Sparkles size={15}/> Prioridad de revisión</div><h2 className="mt-3 text-xl font-black">{quality.anomalies.length ? "Confirma primero la plantilla atípica" : result.compositionDelta ? "Comprueba qué respuestas cambiaron" : "Empieza por las mayores aportaciones"}</h2><p className="mt-3 text-sm leading-6 text-slate-300">{quality.anomalies.length ? "Hay un salto histórico pendiente de confirmación en este corte. Se conserva el valor original; no se sustituye por una estimación." : "Contrasta los primeros casos con el equipo. Esta vista permite formular una hipótesis; para explicar causas hacen falta motivos y contexto operativo."}</p><Link href="/data-quality" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-200">Revisar calidad de este corte <ArrowRight size={16}/></Link></article>
        <details className="rounded-2xl border border-slate-200 bg-white p-5 text-xs leading-6 text-slate-600"><summary className="cursor-pointer font-bold text-slate-800">Cómo se calculó esta evidencia</summary><p className="mt-3">Fuente: BASE HISTORICA.xlsx · columnas {spec.source}. Valores negativos y ausentes no forman parte de los cálculos. Los componentes deben estar completos. Las exclusiones no borran ni corrigen la fuente.</p><p>Edición de datos <code>{manifest.sourceSha256.slice(0,12)}</code> · {manifest.records} registros. El archivo descargable conserva el método, los resultados y las comprobaciones.</p></details>
      </div>
    </section>
  </DashboardFrame>;
}
