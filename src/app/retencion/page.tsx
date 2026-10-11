"use client";

import { CalendarClock, DoorOpen, UserMinus, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { ExitAgeChart, ExitReasonsChart, ExitTenureChart, TurnoverTrendChart } from "@/components/people-intelligence-charts";
import { deriveScopeMetrics, getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";
import { retentionData } from "@/lib/people-intelligence-data";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;

export default function RetentionPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const metrics = deriveScopeMetrics(scope);
  const marketMetrics = deriveScopeMetrics(market);
  const turnoverGap = !isMarket && metrics.turnoverPct != null && marketMetrics.turnoverPct != null ? metrics.turnoverPct - marketMetrics.turnoverPct : null;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Retención"
        title="Rotación y Retención"
        description={isMarket
          ? "Bajas, movimiento de plantilla y patrones de permanencia para el periodo seleccionado."
          : `${companyLabel}: rotación bimestral comparada con el mercado, con referencias de causas y antigüedad de salida.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["Rotación bimestral", pct(metrics.turnoverPct), isMarket ? "bajas / headcount del corte" : `mercado: ${pct(marketMetrics.turnoverPct)}`, DoorOpen],
          ["Bajas", int(scope?.exits), "en el bimestre", UserMinus],
          ["Balance altas-bajas", metrics.netMovement == null ? "—" : `${metrics.netMovement > 0 ? "+" : ""}${int(metrics.netMovement)}`, "movimiento neto", UsersRound],
          ["Movimiento de talento", pct(metrics.movementLoadPct), "altas + bajas / headcount", CalendarClock],
        ].map(([label, value, note, Icon]) => (
          <article key={String(label)} className="panel p-5"><div className="flex items-center justify-between"><div className="metric-label">{String(label)}</div><Icon size={18} className="text-cyan-700" /></div><div className="mt-3 text-3xl font-black text-[#07182d]">{String(value)}</div><div className="mt-2 text-xs text-slate-500">{String(note)}</div></article>
        ))}
      </section>

      {!isMarket && turnoverGap != null && (
        <section className={`mt-4 rounded-[26px] border p-5 ${turnoverGap <= 0 ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
          <div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-500">Comparación con mercado</div>
          <div className="mt-2 text-2xl font-black text-[#07182d]">{Math.abs(turnoverGap).toFixed(1)} puntos porcentuales {turnoverGap <= 0 ? "por debajo" : "por encima"} del mercado.</div>
        </section>
      )}

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.1fr_.9fr]">
        <article className="panel p-5 md:p-6">
          <div className="flex items-start justify-between gap-4"><div><div className="eyebrow">Evolución del mercado</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Rotación a través de los siete bimestres</h2><p className="mt-2 text-xs leading-5 text-slate-400">Serie histórica de referencia del mercado completo.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Mercado</span></div>
          <TurnoverTrendChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-[#07182d] p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Referencia de permanencia</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">La mayor concentración de salidas del mercado ocurre al inicio de la relación laboral.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">En el último corte con desglose consistente, {retentionData.earlyAttritionUnder3MonthsPct}% de las bajas se concentra en los primeros tres meses y {retentionData.firstYearExitSharePct}% antes del primer año.</p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/[.06] p-4 text-xs leading-5 text-slate-300">Conviene revisar este patrón junto con onboarding, salario de entrada, fuente de reclutamiento, transporte, turno y supervisión.</div>
          <div className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-slate-500">Referencia de mercado · Jul–Ago 25</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="panel p-5 md:p-6"><div className="flex items-center justify-between"><div><div className="eyebrow">Antigüedad de salida</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Cuándo ocurre la baja</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Mercado · Jul–Ago 25</span></div><ExitTenureChart /></article>
        <article className="panel p-5 md:p-6"><div className="flex items-center justify-between"><div><div className="eyebrow">Edad de salida</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">En qué edades se concentran las bajas</h2></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Mercado · Jul–Ago 25</span></div><ExitAgeChart /></article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="flex items-start justify-between gap-4"><div><div className="eyebrow">Motivos reportados</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Principales razones de salida</h2><p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Las causas se presentan como distribución de los eventos reportados. Algunas empresas registran más de una causa, por lo que no deben sumarse directamente contra el total de bajas.</p></div><span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-500">Mercado · Jul–Ago 25</span></div>
        <ExitReasonsChart />
      </section>
    </DashboardFrame>
  );
}
