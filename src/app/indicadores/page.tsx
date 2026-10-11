import { Activity, BriefcaseBusiness, Clock3, UserCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { RecruitmentSourcesChart, TimeToFillChart } from "@/components/classic-charts";
import { rejectionReasons } from "@/lib/classic-data";

export default function IndicatorsPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Dashboard clásico · modernizado"
        title="Indicadores / KPI"
        description="Contratación, fuentes de reclutamiento, calidad de candidatos, ausentismo y señales operativas con benchmark consistente."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Time-to-fill operativo" value="15 días" change={-16.7} changeLabel="vs. benchmark" icon={Clock3} inverse />
        <KpiCard label="Time-to-fill técnico" value="20 días" change={-23.1} changeLabel="vs. benchmark" icon={BriefcaseBusiness} inverse />
        <KpiCard label="Candidatos adecuados" value="4.5 / 10" change={5.4} changeLabel="vs. bimestre anterior" icon={UserCheck} />
        <KpiCard label="Ausentismo" value="3.8%" change={0.6} changeLabel="+0.6 pp vs. anterior" icon={Activity} inverse />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Contratación</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Tiempo de contratación por nivel</h2>
          <TimeToFillChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Talent sourcing</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Fuentes de reclutamiento · operativo</h2>
          <RecruitmentSourcesChart />
        </article>
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="eyebrow">Candidate quality</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Motivos de rechazo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-6 py-3">Causa</th><th className="px-6 py-3">Empresa</th><th className="px-6 py-3">Benchmark</th><th className="px-6 py-3">Señal</th></tr>
            </thead>
            <tbody>
              {rejectionReasons.map((row) => (
                <tr key={row.cause} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-semibold text-slate-800">{row.cause}</td>
                  <td className="px-6 py-3">{row.sample}%</td>
                  <td className="px-6 py-3">{row.benchmark}%</td>
                  <td className="px-6 py-3 text-xs font-bold text-cyan-700">Comparar cohort →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardFrame>
  );
}
