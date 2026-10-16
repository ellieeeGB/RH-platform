"use client";

import { useEffect, useRef } from "react";
import { ArrowDownRight, ArrowUpRight, Check, Info, Minus, TriangleAlert } from "lucide-react";

export type Tone = "good" | "attention" | "alert" | "neutral";
export function StatusChip({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  const Icon = tone === "good" ? Check : tone === "alert" ? TriangleAlert : tone === "attention" ? Info : Minus;
  return <span className={`status-chip status-${tone}`}><Icon size={13} aria-hidden="true"/>{children}</span>;
}

export function DataQuality({ children, different = false }: { children: React.ReactNode; different?: boolean }) {
  return <details className="data-quality-note"><summary><Info size={13} aria-hidden="true"/>{different ? "Calidad del dato · bases distintas" : "Calidad del dato"}</summary><div>{children}</div></details>;
}

// Server and first client render match; only the decorative copy counts after mount.
export function MetricValue({ children, amount }: { children: React.ReactNode; amount?: number | null }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (amount == null || !Number.isFinite(amount) || typeof children !== "string" || !window.requestAnimationFrame) return;
    const node=ref.current, final=children, formatted=amount.toLocaleString("es-MX");
    if(!node || !final.startsWith(formatted)) return;
    const started=performance.now(); let frame=0;
    const draw=(time:number)=>{const progress=Math.min(1,(time-started)/450);node.textContent=progress===1?final:`${Math.round(amount*(1-Math.pow(1-progress,3))).toLocaleString("es-MX")}${final.slice(formatted.length)}`;if(progress<1)frame=window.requestAnimationFrame(draw);};
    frame=window.requestAnimationFrame(draw);
    const finish=()=>{window.cancelAnimationFrame(frame);node.textContent=final;};
    window.addEventListener("beforeprint",finish);
    return ()=>{finish();window.removeEventListener("beforeprint",finish);};
  }, [children,amount]);
  return <span className="metric-number"><span className="sr-only">{children}</span><span ref={ref} aria-hidden="true">{children}</span></span>;
}

export function Sparkline({ values, labels, selected, label }: { values: (number | null)[]; labels: string[]; selected?: number; label: string }) {
  const valid = values.filter((v): v is number => v !== null && Number.isFinite(v));
  const low = Math.min(...valid), high = Math.max(...valid), range = high - low || 1;
  const x = (i: number) => 8 + i / Math.max(1, values.length - 1) * 224;
  const y = (v: number) => high === low ? 30 : 53 - (v - low) / range * 43;
  const paths: string[] = []; let segment = "";
  values.forEach((v, i) => { if (v === null) { if(segment) paths.push(segment); segment = ""; } else segment += `${segment ? " L" : "M"}${x(i)},${y(v)}`; });
  if (segment) paths.push(segment);
  return <figure className="sparkline"><svg viewBox="0 0 240 64" role="img" aria-label={label}>
    <title>{`${label}. ${values.map((v,i)=>`${labels[i]}: ${v === null ? "sin dato" : v.toLocaleString("es-MX",{maximumFractionDigits:2})}`).join("; ")}`}</title>
    <path d="M8 56H232" stroke="currentColor" opacity=".18"/>
    {paths.map((d,i)=><path key={i} d={d} fill="none" stroke="currentColor" strokeWidth="2.5" className="sparkline-stroke"/>)}
    {values.map((v,i)=>v===null?null:<circle key={i} cx={x(i)} cy={y(v)} r={i===selected?4:2} fill="currentColor"><title>{`${labels[i]}: ${v.toLocaleString("es-MX",{maximumFractionDigits:2})}`}</title></circle>)}
  </svg><figcaption>{valid.length ? `${labels.length} bimestres · ${selected !== undefined && values[selected] === null ? "selección sin dato" : "selección marcada"}` : "Aún faltan datos para trazar la tendencia"}</figcaption></figure>;
}

export function Proportion({ value, total = 100, label }: { value: number | null; total?: number; label: string }) {
  const width = value === null ? 0 : Math.min(100, Math.max(0, value / total * 100));
  return <div className="proportion"><div role="img" aria-label={`${label}: ${value === null ? "sin dato" : `${value} de ${total}`}`} className="proportion-track"><span style={{width:`${width}%`}}/></div><span>{value === null ? "Sin información suficiente" : label}{value !== null && value > total ? " · supera la escala" : ""}</span></div>;
}

export function MarketBullet({ label, own, market, maximum, isMarket }: { label: string; own: number | null; market: number | null; maximum: number; isMarket: boolean }) {
  const delta = !isMarket && own !== null && market !== null ? own-market : null;
  const pos = (v:number) => 5 + v / Math.max(1, maximum) * 90;
  const Trend = delta !== null && delta < 0 ? ArrowDownRight : delta !== null && delta > 0 ? ArrowUpRight : Minus;
  return <div className="bullet-row"><div className="flex flex-wrap items-center justify-between gap-2"><h3>{label}</h3>{delta!==null && <span className={`bullet-interpretation ${delta<0?"text-emerald-800":delta>0?"text-rose-800":"text-slate-600"}`}><Trend size={14}/>{delta===0?"Al ritmo del mercado":`${Math.abs(delta)} días ${delta<0?"más rápido":"más lento"} que el mercado`}</span>}</div>
    <svg viewBox="0 0 500 100" role="img" aria-label={`${label}. ${isMarket?"Mercado":"Empresa"}: ${own??"sin dato"} días. Mercado: ${market??"sin dato"} días.`} className="bullet-chart">
      <line x1="25" x2="475" y1="49" y2="49" stroke="#e1e9ed" strokeWidth="9" strokeLinecap="round"/>
      {!isMarket&&own!==null&&<g><line x1={pos(own)*5} x2={pos(own)*5} y1="31" y2="49" stroke="#096773"/><circle cx={pos(own)*5} cy="49" r="6" fill="#096773"/><text x={pos(own)*5} y="20" textAnchor={own/maximum>.7?"end":own/maximum<.3?"start":"middle"} fill="#084e59">{`Empresa · ${own} días`}</text></g>}
      {market!==null&&<g><path d={`M${pos(market)*5},42 l7,7 -7,7 -7,-7 Z`} fill="#705199"/><line x1={pos(market)*5} x2={pos(market)*5} y1="56" y2="70" stroke="#705199"/><text x={pos(market)*5} y="88" textAnchor={market/maximum>.7?"end":market/maximum<.3?"start":"middle"} fill="#634585">{`Mercado · ${market} días`}</text></g>}
      {own===null&&<text x="25" y="20" fill="#526175">Empresa: sin dato</text>}
    </svg></div>;
}
