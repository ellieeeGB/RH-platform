import { Activity, BriefcaseBusiness, Clock3, UserCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { RecruitmentSourcesChart, TimeToFillChart } from "@/components/classic-charts";
import {
  latestMarket,
  marketChange,
  rejectionReasonBenchmark,
} from "@/lib/benchmark-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function IndicatorsPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Dashboard clásico · datos reales"
        title="Indicadores / KPI"
        description="Contratación, fuentes de reclutamiento, calidad de candidatos y presión de talento calculados sobre la muestra histórica agregada."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Time-to-fill operativo" value={`${latestMarket.timeToFillDays.operational} días`} change={0} changeLabel="sin cambio vs. May–Jun" icon={Clock3} inverse />
        <KpiCard label="Time-to-fill técnico" value={`${latestMarket.timeToFillDays.technical} días`} change={33.3} changeLabel={`+${marketChange.technicalTimeToFillDays} días vs. anterior`} icon={BriefcaseBusiness} inverse />
        <KpiCard label="Candidatos adecuados" value={`${latestMarket.candidateAcceptancePer10Median} / 10`} change={0} changeLabel="mediana de la muestra" icon={UserCheck} />
        <KpiCard label="Vacantes próximas" value={formatInt(latestMarket.vacancies.total)} change={latestMarket.hiringPressurePct} changeLabel="% del headcount de muestra" icon={Activity} inverse />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Contratación</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Tiempo de contratación por nivel</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Comparación de medianas entre los dos últimos bimestres. Técnico es el único nivel que empeoró de forma visible.</p>
          <TimeToFillChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Talent sourcing</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Fuentes utilizadas por las empresas</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Porcentaje de las 40 compañías que reportan utilizar cada fuente. No es participación de contrataciones.</p>
          <RecruitmentSourcesChart />
        </article>
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="eyebrow">Candidate quality</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Motivos de rechazo · mediana de la muestra</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-6 py-3">Causa</th><th className="px-6 py-3">Mediana</th><th className="px-6 py-3">Respuestas válidas</th><th className="px-6 py-3">Lectura</th></tr>
            </thead>
            <tbody>
              {rejectionReasonBenchmark.map((row) => (
                <tr key={row.cause} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-semibold text-slate-800">{row.cause}</td>
                  <td className="px-6 py-3 font-black text-slate-900">{row.medianPct}%</td>
                  <td className="px-6 py-3">{row.responses} / 40</td>
                  <td className="px-6 py-3 text-xs font-bold text-cyan-700">{row.medianPct >= 10 ? "Revisar impacto →" : "Señal baja"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardFrame>
  );
}
