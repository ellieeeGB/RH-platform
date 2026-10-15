"use client";

import { BarChart3, BriefcaseBusiness, GraduationCap, TriangleAlert } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { TalentHotspotsChart, VacancyTrendChart, VacancyTotalTrendLine } from "@/components/workforce-rewards-charts";
import { deriveScopeMetrics, getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";
import { workforcePlanningData } from "@/lib/workforce-rewards-data";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;

export default function WorkforcePlanningPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const metrics = deriveScopeMetrics(scope);
  const opShare = scope?.vacancies.total && scope.vacancies.operational != null ? (scope.vacancies.operational / scope.vacancies.total) * 100 : null;
  const adminShare = scope?.vacancies.total && scope.vacancies.administrative != null ? (scope.vacancies.administrative / scope.vacancies.total) * 100 : null;
  const marketPressure = deriveScopeMetrics(market).hiringPressurePct;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Planeación de plantilla"
        title="Puestos por cubrir"
        description={isMarket
          ? "Cuántos puestos se necesitan cubrir y cómo priorizar su contratación."
          : `${companyLabel}: demanda futura comparada con el mercado en ${period}.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Vacantes próximas", int(scope?.vacancies.total), "total del corte", BriefcaseBusiness],
          ["Operativas", int(scope?.vacancies.operational), `${pct(opShare)} del total`, BarChart3],
          ["Administrativas", int(scope?.vacancies.administrative), `${pct(adminShare)} del total`, GraduationCap],
          ["Puestos pendientes por cada 100 empleados", pct(metrics.hiringPressurePct), isMarket ? "puestos pendientes en relación con el personal" : `mercado: ${pct(marketPressure)}`, TriangleAlert],
        ].map(([label, value, note, Icon]) => (
          <article key={String(label)} className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">{String(label)}</div><Icon size={18} className="text-cyan-700" /></div><div className="mt-3 text-3xl font-black text-[#07182d]">{String(value)}</div><div className="mt-2 text-xs text-slate-500">{String(note)}</div></article>
        ))}
      </section>

      {!isMarket && (
        <section className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            ["Vacantes empresa", int(scope?.vacancies.total)],
            ["Vacantes mercado", int(market.vacancies.total)],
            ["Relación con las empresas del estudio", metrics.hiringPressurePct == null || marketPressure == null || marketPressure === 0 ? "—" : `${(metrics.hiringPressurePct / marketPressure).toFixed(2)}×`],
          ].map(([label, value]) => <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-5"><div className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">{label}</div><div className="mt-2 text-3xl font-black text-[#07182d]">{value}</div></div>)}
        </section>
      )}

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5 md:p-6">
          <div className="flex items-start justify-between gap-4"><div><div className="eyebrow">Evolución del mercado</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Vacantes previstas por bimestre</h2><p className="mt-2 text-xs leading-5 text-slate-400">Referencia agregada de las 40 empresas.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Mercado</span></div>
          <VacancyTrendChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-[#07182d] p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Lectura de capacidad</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">{metrics.hiringPressurePct == null ? "No hay suficiente información para estimar la presión de contratación." : `Las vacantes representan ${pct(metrics.hiringPressurePct)} del personal registrado al cierre.`}</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">La cantidad por sí sola no define el riesgo: conviene cruzarla con tiempo de cobertura, rotación y salario para identificar posiciones realmente críticas.</p>
          <div className="mt-6 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-white/[.06] p-4"><div className="text-2xl font-black">{int(scope?.vacancies.operational)}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">operativas</div></div><div className="rounded-2xl bg-white/[.06] p-4"><div className="text-2xl font-black">{int(scope?.vacancies.administrative)}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">administrativas</div></div></div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <article className="panel p-5 md:p-6">
          <div className="flex items-start justify-between gap-4"><div><div className="eyebrow">Dónde se concentra la necesidad de contratar</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Puesto × escolaridad</h2><p className="mt-2 text-xs leading-5 text-slate-400">Detalle estructurado del último corte disponible para identificar concentraciones de demanda.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Jul–Ago 25</span></div>
          <TalentHotspotsChart />
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Demanda histórica</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Vacantes totales en el tiempo</h2>
          <VacancyTotalTrendLine />
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">La serie ayuda a distinguir un pico temporal de una presión sostenida de contratación.</div>
        </article>
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6"><div className="flex items-center justify-between"><div><div className="eyebrow">Demanda prioritaria</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Principales combinaciones de puesto y escolaridad</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Mercado · Jul–Ago 25</span></div></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-3">Familia</th><th className="px-6 py-3">Puesto</th><th className="px-6 py-3">Escolaridad</th><th className="px-6 py-3">Demanda</th></tr></thead>
            <tbody>{workforcePlanningData.hotspots.map((row) => <tr key={`${row.family}-${row.role}-${row.education}`} className="border-t border-slate-100"><td className="px-6 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{row.family}</span></td><td className="px-6 py-3 font-semibold text-slate-800">{row.role}</td><td className="px-6 py-3 text-slate-500">{row.education}</td><td className="px-6 py-3 font-black text-slate-950">{int(row.demand)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 md:p-6">
        <div className="flex gap-3"><TriangleAlert className="mt-0.5 shrink-0 text-amber-700" size={20} /><div><div className="font-extrabold text-amber-950">Nota de lectura</div><p className="mb-0 mt-1 text-sm leading-6 text-amber-900/80">El detalle por puesto del último corte suma un volumen ligeramente distinto al total general de vacantes. Por eso se usa para entender la composición de la demanda, mientras el total de la parte superior se mantiene como referencia principal.</p></div></div>
      </section>
    </DashboardFrame>
  );
}
