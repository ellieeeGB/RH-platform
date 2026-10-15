"use client";
import Link from "next/link";
import { ArrowRight, ScanLine } from "lucide-react";
import { useFilters } from "./filter-context";
import { analyzeSignal, type SignalMetric } from "@/lib/signal-analysis";
const items: Array<[SignalMetric,string]> = [["headcount","Empleados al cierre"],["hires","Contrataciones"],["exits","Bajas"],["vacancies","Puestos por cubrir"]];
export function SignalPreview() {
  const {period,company,isMarket} = useFilters();
  return <div className="rounded-[28px] border border-white/15 bg-white/[.055] p-5 shadow-2xl md:p-7">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300"><ScanLine size={17}/> Radar del bimestre</div>
    <h2 className="mt-3 text-2xl font-black">Mismas empresas.<br/>Una comparación más clara.</h2>
    <div className="mt-6 space-y-1">{items.map(([metric,label])=>{const r=analyzeSignal(metric,period,company),ready=r.n>=(isMarket?5:1);return <div key={metric} className="grid grid-cols-[1fr_auto] items-center gap-3 border-b border-white/10 py-3"><div><div className="text-sm font-bold text-white">{label}</div><div className="mt-1 text-xs text-slate-400">{r.n} empresas con datos en ambos periodos</div></div><div className="text-right"><div className="text-xl font-black tabular-nums text-cyan-200">{ready&&r.matchedPct!==null?`${r.matchedPct>0?"+":""}${r.matchedPct.toFixed(1)}%`:"—"}</div><div className="mt-1 text-[11px] text-slate-400">frente al bimestre anterior</div></div></div>})}</div>
    <Link href="/signals" className="mt-5 flex items-center justify-between gap-3 rounded-xl bg-cyan-300 px-4 py-3 text-sm font-black text-[#07182d] transition hover:bg-cyan-200">Investigar qué explica el cambio <ArrowRight size={17}/></Link>
  </div>;
}
