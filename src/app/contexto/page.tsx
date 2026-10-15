"use client";

import { Building2, Layers3, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/layout/dashboard-frame";
import { useFilters } from "@/components/filters/filter-context";
import { getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;

export default function ContextPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const hc = scope?.headcount.total ?? null;
  const operationalShare = hc && scope?.headcount.operational != null ? (scope.headcount.operational / hc) * 100 : null;
  const adminShare = hc && scope?.headcount.administrative != null ? (scope.headcount.administrative / hc) * 100 : null;
  const otherShare = hc && scope?.headcount.other != null ? (scope.headcount.other / hc) * 100 : null;
  const marketShare = !isMarket && hc && market.headcount.total ? (hc / market.headcount.total) * 100 : null;

  const composition = [
    { label: "Operativo", value: scope?.headcount.operational ?? null, share: operationalShare, className: "bg-cyan-500" },
    { label: "Administrativo", value: scope?.headcount.administrative ?? null, share: adminShare, className: "bg-violet-500" },
    { label: "Otro", value: scope?.headcount.other ?? null, share: otherShare, className: "bg-amber-400" },
  ];

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Contexto del estudio"
        title="Personas y empresas del estudio"
        description={isMarket
          ? "Tamaño y composición de la plantilla del mercado en el periodo seleccionado."
          : `${companyLabel}: estructura de plantilla y posición relativa frente a las 40 empresas participantes.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">Headcount total</div><UsersRound size={18} className="text-cyan-700" /></div><div className="mt-3 text-4xl font-black text-[#07182d]">{int(hc)}</div><div className="mt-2 text-xs text-slate-500">{isMarket ? "plantilla agregada" : companyLabel}</div></article>
        <article className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">Personal operativo</div><Layers3 size={18} className="text-cyan-700" /></div><div className="mt-3 text-4xl font-black text-[#07182d]">{int(scope?.headcount.operational)}</div><div className="mt-2 text-xs text-slate-500">{pct(operationalShare)} de la plantilla</div></article>
        <article className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">Personal administrativo</div><Building2 size={18} className="text-violet-700" /></div><div className="mt-3 text-4xl font-black text-[#07182d]">{int(scope?.headcount.administrative)}</div><div className="mt-2 text-xs text-slate-500">{pct(adminShare)} de la plantilla</div></article>
        <article className="panel p-5"><div className="metric-label">{isMarket ? "Empresas participantes" : "Peso en la muestra"}</div><div className="mt-3 text-4xl font-black text-[#07182d]">{isMarket ? "40" : pct(marketShare)}</div><div className="mt-2 text-xs text-slate-500">{isMarket ? "empresas que participan en el estudio" : "del personal de todas las empresas"}</div></article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.08fr_.92fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Composición de plantilla</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Dónde está concentrado el personal</h2>
          <div className="mt-8 space-y-6">
            {composition.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-end justify-between gap-4"><div><div className="text-sm font-extrabold text-slate-900">{item.label}</div><div className="text-xs text-slate-400">{int(item.value)} personas</div></div><div className="text-xl font-black text-[#07182d]">{pct(item.share)}</div></div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${item.className}`} style={{ width: `${Math.max(0, Math.min(100, item.share ?? 0))}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-3xl bg-[#07182d] p-6 text-white shadow-soft md:p-7">
          <div className="eyebrow !text-cyan-300">Lectura rápida</div>
          <h2 className="mt-4 text-3xl font-black leading-tight">{isMarket ? "La estructura operativa domina la muestra." : `${companyLabel} frente a la estructura del mercado.`}</h2>
          <div className="mt-7 space-y-3">
            {[
              ["Operativo", operationalShare, market.headcount.total && market.headcount.operational != null ? (market.headcount.operational / market.headcount.total) * 100 : null],
              ["Administrativo", adminShare, market.headcount.total && market.headcount.administrative != null ? (market.headcount.administrative / market.headcount.total) * 100 : null],
              ["Otro", otherShare, market.headcount.total && market.headcount.other != null ? (market.headcount.other / market.headcount.total) * 100 : null],
            ].map(([label, own, benchmark]) => (
              <div key={String(label)} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 rounded-2xl bg-white/[.06] p-4 text-sm">
                <span className="font-bold">{String(label)}</span>
                <span className="text-slate-300">{isMarket ? "Mercado" : companyLabel}: <strong className="text-white">{pct(own as number | null)}</strong></span>
                {!isMarket && <span className="text-slate-400">Mercado: {pct(benchmark as number | null)}</span>}
              </div>
            ))}
          </div>
          {!isMarket && marketShare != null && <p className="mt-6 text-sm leading-6 text-slate-300">La empresa representa aproximadamente <strong className="text-white">{pct(marketShare)}</strong> del personal total del estudio en {period}.</p>}
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Comparación de escala</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">{isMarket ? "Total de las empresas participantes" : `${companyLabel} contra el mercado`}</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {[
            ["Número de empleados", hc, market.headcount.total],
            ["Operativo", scope?.headcount.operational ?? null, market.headcount.operational],
            ["Administrativo", scope?.headcount.administrative ?? null, market.headcount.administrative],
          ].map(([label, own, total]) => (
            <div key={String(label)} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="text-[10px] font-black uppercase tracking-[.15em] text-slate-400">{String(label)}</div>
              <div className="mt-2 text-2xl font-black text-[#07182d]">{int(own as number | null)}</div>
              {!isMarket && <div className="mt-1 text-xs text-slate-500">Mercado: {int(total as number | null)}</div>}
            </div>
          ))}
        </div>
      </section>
    </DashboardFrame>
  );
}
