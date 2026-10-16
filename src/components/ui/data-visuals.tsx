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

/** A common zero baseline keeps a small change from looking dramatic. */
export function PeriodSlope({ before, after, firstLabel, lastLabel, unit, tone }: {
  before: number; after: number; firstLabel: string; lastLabel: string; unit: string; tone: Tone;
}) {
  const maximum = Math.max(1, before, after) * 1.1;
  const y = (value: number) => 190 - value / maximum * 105;
  const format = (value: number) => value.toLocaleString("es-MX", { maximumFractionDigits: 2 });
  const color = tone === "good" ? "#176144" : tone === "alert" ? "#a43832" : tone === "attention" ? "#80500b" : "#096773";
  const delta = after - before;
  const label = Math.abs(delta) < 1e-9 ? "Sin cambio entre periodos" : tone === "good" ? "Mejora entre periodos" : tone === "alert" ? "Requiere atención" : tone === "attention" ? "Priorizar cobertura" : "Contrastar con el plan";
  return <figure className="slope-chart">
    <figcaption className="slope-unit">{unit}</figcaption>
    <svg viewBox="0 0 360 215" role="img" aria-label={`${firstLabel}: ${format(before)}; ${lastLabel}: ${format(after)} ${unit}. ${label}. Escala desde cero.`}>
      <title>{`${format(before)} → ${format(after)} ${unit}`}</title>
      <text x="18" y="35" className="slope-value" fill="#526773">{format(before)}</text>
      <text x="342" y="35" textAnchor="end" className="slope-value" fill={color}>{format(after)}</text>
      <path d={`M35 ${y(before)} L325 ${y(after)} L325 190 L35 190 Z`} fill={color} opacity=".07"/>
      <line x1="35" x2="325" y1="190" y2="190" stroke="#b9c9be"/>
      <text x="15" y="195" fill="#526773" fontSize="13">0</text>
      <line x1="35" x2="35" y1="52" y2="190" stroke="#c4d1c7" strokeDasharray="3 4"/>
      <line x1="325" x2="325" y1="52" y2="190" stroke="#c4d1c7" strokeDasharray="3 4"/>
      <path d={`M35 ${y(before)} L325 ${y(after)}`} stroke={color} strokeWidth="3" fill="none" className="sparkline-stroke"/>
      <circle cx="35" cy={y(before)} r="6" fill="#e9efe6" stroke={color} strokeWidth="2"/>
      <circle cx="325" cy={y(after)} r="7" fill={color}/>
    </svg>
    <div className="slope-periods"><span>{firstLabel}</span><span>{lastLabel}</span></div>
    <StatusChip tone={tone}>{label}</StatusChip>
    <p className="slope-caption">Mismas empresas · escala desde cero. Se muestran los extremos seleccionados.</p>
  </figure>;
}
