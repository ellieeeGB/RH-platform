import { Activity, AlertTriangle, HeartPulse, ShieldCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { LaborRiskEventsChart, LaborRiskTrendChart } from "@/components/risk-benchmark-charts";
import { laborRiskSummary } from "@/lib/risk-benchmark-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function LaborRiskPage() {
  const { current, peakAbsence, peakIncapacity } = laborRiskSummary;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="People Intelligence · Labor Risk"
        title="Labor Risk & Attendance"
        description="Monitorea presión operativa a través de ausentismo e incapacidades normalizadas por headcount. Los valores representan eventos/casos, no personas únicas."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ausencias / 100 HC" value={current.absenceEventsPer100.toFixed(1)} change={laborRiskSummary.absenceRateChangePct} changeLabel="vs. bimestre anterior" icon={Activity} inverse />
        <KpiCard label="Incapacidades / 100 HC" value={current.incapacityCasesPer100.toFixed(1)} change={laborRiskSummary.incapacityRateChangePct} changeLabel="vs. bimestre anterior" icon={HeartPulse} inverse />
        <KpiCard label="Eventos de ausencia" value={formatInt(current.absences)} change={laborRiskSummary.absenceRateChangePct} changeLabel="normalizado por HC" icon={AlertTriangle} inverse />
        <KpiCard label="Casos incapacidad" value={formatInt(current.incapacityCases)} change={laborRiskSummary.incapacityRateChangePct} changeLabel="normalizado por HC" icon={ShieldCheck} inverse />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Exposure trend</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Eventos por cada 100 de headcount</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Normalizar por headcount evita confundir crecimiento de plantilla con deterioro del indicador. No equivale a porcentaje de personas afectadas porque una persona puede generar más de un evento.</p>
          <LaborRiskTrendChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Risk signal</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">El ausentismo mejora desde el pico, pero las incapacidades siguen estructuralmente altas.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">El indicador de ausencias cayó {Math.abs(laborRiskSummary.absenceRateChangePct).toFixed(1)}% frente a May–Jun, mientras incapacidades bajó solo {Math.abs(laborRiskSummary.incapacityRateChangePct).toFixed(1)}%. Frente al inicio de la serie, incapacidades por 100 HC siguen {laborRiskSummary.incapacityVsFirstPct.toFixed(1)}% arriba.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-2xl font-black">{peakAbsence.absenceEventsPer100.toFixed(1)}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">pico ausencias /100 · {peakAbsence.period}</div></div>
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-2xl font-black">{peakIncapacity.incapacityCasesPer100.toFixed(1)}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">pico incapacidad /100 · {peakIncapacity.period}</div></div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-300">Siguiente evolución: separar incapacidad por riesgo de trabajo, enfermedad general y maternidad; después cruzar con turno, edad, antigüedad y proceso sin perfilar individuos.</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Volume context</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Volumen reportado por bimestre</h2>
          <LaborRiskEventsChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Interpretación</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Semáforo de lectura</h2>
          <div className="mt-5 space-y-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4"><div className="text-sm font-extrabold text-emerald-900">Mejora reciente · ausentismo</div><p className="mb-0 mt-1 text-xs leading-5 text-emerald-800/80">La exposición normalizada cae 23.3% contra el bimestre anterior.</p></div>
            <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4"><div className="text-sm font-extrabold text-amber-900">Vigilancia · incapacidades</div><p className="mb-0 mt-1 text-xs leading-5 text-amber-800/80">37.6 casos por 100 HC: cerca del máximo de la serie, aunque ligeramente debajo de May–Jun.</p></div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="text-sm font-extrabold text-slate-900">No inferir causalidad</div><p className="mb-0 mt-1 text-xs leading-5 text-slate-600">Sin días perdidos, personas únicas y causa específica no se debe llamar “severidad”, “frecuencia” ni atribuir el cambio a una política.</p></div>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
