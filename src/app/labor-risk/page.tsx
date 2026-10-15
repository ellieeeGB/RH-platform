"use client";

import { Activity, AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { LaborRiskEventsChart, LaborRiskTrendChart } from "@/components/risk-benchmark-charts";
import { deriveScopeMetrics, getMarketSnapshot, getPreviousScopeSnapshot, getScopeSnapshot } from "@/lib/company-panel";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : value.toFixed(1);
const changePct = (current: number | null, previous: number | null) => current != null && previous != null && previous !== 0 ? ((current / previous) - 1) * 100 : null;

export default function LaborRiskPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const previous = getPreviousScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const metrics = deriveScopeMetrics(scope);
  const previousMetrics = deriveScopeMetrics(previous);
  const marketMetrics = deriveScopeMetrics(market);

  const absenceChange = changePct(metrics.absenceEventsPer100, previousMetrics.absenceEventsPer100);
  const incapacityChange = changePct(metrics.incapacityCasesPer100, previousMetrics.incapacityCasesPer100);
  const causeTotal = [scope?.attendance.workRisk, scope?.attendance.generalIllness, scope?.attendance.maternity]
    .filter((value): value is number => value != null)
    .reduce((sum, value) => sum + value, 0);

  const cards = [
    { label: "Ausencias por cada 100 empleados", value: pct(metrics.absenceEventsPer100), note: absenceChange == null ? `Mercado: ${pct(marketMetrics.absenceEventsPer100)}` : `${absenceChange > 0 ? "+" : ""}${absenceChange.toFixed(1)}% vs. bimestre anterior`, icon: Activity },
    { label: "Casos de incapacidad por cada 100 empleados", value: pct(metrics.incapacityCasesPer100), note: incapacityChange == null ? `Mercado: ${pct(marketMetrics.incapacityCasesPer100)}` : `${incapacityChange > 0 ? "+" : ""}${incapacityChange.toFixed(1)}% vs. bimestre anterior`, icon: HeartPulse },
    { label: "Eventos de falta", value: int(scope?.attendance.absences), note: isMarket ? "volumen agregado reportado" : `Mercado: ${int(market.attendance.absences)}`, icon: AlertTriangle },
    { label: "Casos de incapacidad", value: int(scope?.attendance.incapacityCases), note: isMarket ? "casos agregados reportados" : `Mercado: ${int(market.attendance.incapacityCases)}`, icon: ShieldCheck },
  ];

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Asistencia y salud laboral"
        title="Ausentismo e incapacidades"
        description={isMarket
          ? "Ausencias e incapacidades en relación con el número de empleados. Una persona puede registrar varios eventos."
          : `${companyLabel}: ausencias e incapacidades frente a las empresas del mismo bimestre. Los registros pueden incluir varios eventos de una persona.`}
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, note, icon: Icon }) => (
          <article key={label} className="panel p-5">
            <div className="flex items-center justify-between"><div className="metric-label">{label}</div><Icon size={18} className="text-cyan-700" /></div>
            <div className="mt-3 text-3xl font-black text-[#07182d]">{value}</div>
            <div className="mt-2 text-xs leading-5 text-slate-500">{note}</div>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Causas de incapacidad</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Composición reportada · {period}</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Riesgo de trabajo", scope?.attendance.workRisk],
              ["Enfermedad general", scope?.attendance.generalIllness],
              ["Maternidad", scope?.attendance.maternity],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-2xl bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-wide text-slate-400">{String(label)}</div>
                <div className="mt-2 text-2xl font-black text-slate-950">{int(value as number | null)}</div>
                <div className="mt-1 text-xs text-slate-500">{causeTotal > 0 && typeof value === "number" ? `${((value / causeTotal) * 100).toFixed(1)}% del desglose` : "sin desglose válido"}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl border border-amber-100 bg-amber-50 p-4 text-xs leading-5 text-amber-900">El desglose se muestra tal como fue reportado. Si la suma de causas no coincide con el total de casos, no se fuerza una conciliación automática.</div>
        </article>

        <article className="overflow-hidden rounded-3xl bg-[#07182d] p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Lectura ejecutiva</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">{isMarket ? "Por cada 100 empleados, ¿cuántas ausencias e incapacidades se reportaron?" : `${companyLabel} puede compararse sin que el tamaño de plantilla distorsione la lectura.`}</h2>
          <div className="mt-6 space-y-3 text-sm">
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-400">Ausencias por cada 100 empleados</div><div className="mt-1 flex items-end justify-between gap-3"><strong className="text-2xl">{pct(metrics.absenceEventsPer100)}</strong>{!isMarket && <span className="text-xs text-cyan-200">mercado {pct(marketMetrics.absenceEventsPer100)}</span>}</div></div>
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-400">Casos de incapacidad por cada 100 empleados</div><div className="mt-1 flex items-end justify-between gap-3"><strong className="text-2xl">{pct(metrics.incapacityCasesPer100)}</strong>{!isMarket && <span className="text-xs text-cyan-200">mercado {pct(marketMetrics.incapacityCasesPer100)}</span>}</div></div>
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-xs text-slate-400">Horas de capacitación por empleado</div><div className="mt-1 text-2xl font-black">{metrics.trainingHoursPerHead == null ? "—" : `${metrics.trainingHoursPerHead.toFixed(1)} h`}</div></div>
          </div>
          <p className="mb-0 mt-5 text-[11px] leading-5 text-slate-400">Estos indicadores describen exposición operativa. Sin personas únicas, días perdidos y diagnóstico específico no se interpretan como frecuencia o severidad médica.</p>
        </article>
      </section>

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Referencia de mercado</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Tendencia histórica completa</h2></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">Mercado agregado</span>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">La serie inferior conserva los siete bimestres de mercado. Los KPIs y el desglose superior sí responden a la empresa y periodo seleccionados.</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
          <div className="rounded-2xl bg-slate-50 p-4"><LaborRiskTrendChart /></div>
          <div className="rounded-2xl bg-slate-50 p-4"><LaborRiskEventsChart /></div>
        </div>
      </section>
    </DashboardFrame>
  );
}
