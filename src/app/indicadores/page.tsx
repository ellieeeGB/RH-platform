"use client";

import { IndicatorKpis } from "@/components/analysis/indicator-kpis";
import { MarketBullet, Proportion } from "@/components/ui/data-visuals";
import { DashboardFrame, PageHeader } from "@/components/layout/dashboard-frame";
import { useFilters } from "@/components/filters/filter-context";
import { RecruitmentSourcesChart } from "@/components/charts/recruitment-charts";
import { rejectionReasonBenchmark } from "@/lib/benchmark-data";
import { deriveScopeMetrics, getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;

export default function IndicatorsPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const metrics = deriveScopeMetrics(scope);

  const ttfRows = [
    ["Operativo", scope?.timeToFill.operational ?? null, market.timeToFill.operational],
    ["Técnico", scope?.timeToFill.technical ?? null, market.timeToFill.technical],
    ["Administrativo", scope?.timeToFill.administrative ?? null, market.timeToFill.administrative],
    ["Gerencial", scope?.timeToFill.managerial ?? null, market.timeToFill.managerial],
  ] as const;
  const maxTtf = Math.max(...ttfRows.flatMap(([, own, benchmark]) => [own ?? 0, benchmark ?? 0]), 1);

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Indicadores de talento"
        title="Indicadores principales de personal"
        description={isMarket
          ? "Cuánto tarda contratar, cuántos candidatos cumplen lo requerido y qué puestos faltan por cubrir."
          : `${companyLabel}: indicadores operativos comparados con la mediana del mercado en ${period}.`}
      />

      <IndicatorKpis/>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.12fr_.88fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Tiempo de cobertura</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Cuántos días toma cubrir cada nivel</h2>
          <p className="mt-2 text-xs leading-5 text-slate-600">{isMarket ? "Medianas del mercado para el corte seleccionado." : "Menos días significa una cobertura más rápida. Cada marcador identifica su referencia."}</p>
          <div className="mt-6">{ttfRows.map(([label,own,benchmark])=><MarketBullet key={label} label={label} own={own} market={benchmark} maximum={maxTtf} isMarket={isMarket}/>)}</div>
        </article>

        <article className="overflow-hidden rounded-3xl bg-[#07182d] p-6 text-white shadow-soft md:p-7">
          <div className="eyebrow !text-cyan-300">Capacidad de contratación</div>
          <h2 className="mt-4 text-3xl font-black leading-tight">{metrics.hiringPressurePct == null ? "No hay suficiente información de vacantes para este corte." : `Las vacantes equivalen a ${pct(metrics.hiringPressurePct)} de la plantilla seleccionada.`}</h2>
          <Proportion value={metrics.hiringPressurePct} label="Vacantes por cada 100 empleados con datos emparejados"/>
          <div className="mt-7 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[.06] p-4"><div className="text-3xl font-black">{int(scope?.vacancies.operational)}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">vacantes operativas</div></div>
            <div className="rounded-2xl bg-white/[.06] p-4"><div className="text-3xl font-black">{int(scope?.vacancies.administrative)}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">vacantes administrativas</div></div>
          </div>
          <p className="mt-6 text-sm leading-6 text-slate-300">Cruza esta presión con el tiempo de cobertura y la calidad de candidatos para decidir dónde reforzar fuentes, capacidad o propuesta salarial.</p>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Fuentes de reclutamiento</div>
          <div className="flex items-start justify-between gap-4"><div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué canales usa el mercado</h2><p className="mt-2 text-xs leading-5 text-slate-400">Referencia general del último corte disponible. Muestra presencia de cada fuente entre empresas; no equivale a conversiones o contrataciones atribuibles.</p></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Jul–Ago 25</span></div>
          <RecruitmentSourcesChart />
        </article>

        <article className="panel overflow-hidden">
          <div className="border-b border-slate-100 p-5 md:p-6">
            <div className="eyebrow">Motivos de rechazo</div>
            <div className="flex items-start justify-between gap-4"><div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Dónde se pierde candidato</h2><p className="mt-2 text-xs leading-5 text-slate-400">Medianas de mercado del último corte disponible.</p></div><span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Jul–Ago 25</span></div>
          </div>
          <div className="max-h-[390px] overflow-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Causa</th><th className="px-5 py-3">Mediana</th><th className="px-5 py-3">Cobertura</th></tr></thead>
              <tbody>{rejectionReasonBenchmark.map((row) => <tr key={row.cause} className="border-t border-slate-100"><td className="px-5 py-3 font-semibold text-slate-800">{row.cause}</td><td className="px-5 py-3 font-black text-slate-900">{row.medianPct}%</td><td className="px-5 py-3 text-xs text-slate-500">{row.responses} empresas</td></tr>)}</tbody>
            </table>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
