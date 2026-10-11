import { BriefcaseBusiness, Clock3, Radar, UserCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { RecruitmentSourcesChart, TimeToFillChart } from "@/components/classic-charts";
import { HiringPressureChart } from "@/components/charts";
import { latestMarket, rejectionReasonBenchmark } from "@/lib/benchmark-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function TalentAcquisitionPage() {
  const topRejection = [...rejectionReasonBenchmark].sort((a, b) => b.medianPct - a.medianPct).slice(0, 5);

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="People Intelligence · Talent Acquisition"
        title="Talent Acquisition"
        description="Integra demanda futura, velocidad de contratación, calidad de candidatos y canales para detectar dónde se está formando el cuello de botella de talento."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Vacantes próximas" value={formatInt(latestMarket.vacancies.total)} change={latestMarket.hiringPressurePct} changeLabel="% del headcount de muestra" icon={BriefcaseBusiness} inverse />
        <KpiCard label="Time-to-fill técnico" value={`${latestMarket.timeToFillDays.technical} días`} change={33.3} changeLabel="vs. bimestre anterior" icon={Clock3} inverse />
        <KpiCard label="Candidatos adecuados" value={`${latestMarket.candidateAcceptancePer10Median}/10`} change={0} changeLabel="mediana por cada 10" icon={UserCheck} />
        <KpiCard label="Contrataciones realizadas" value={formatInt(latestMarket.hires)} change={-20.8} changeLabel="vs. May–Jun" icon={Radar} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Demand pressure</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Vacantes próximas vs. velocidad de cobertura</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">La demanda operativa domina en volumen; el segmento técnico destaca por deterioro en tiempo de contratación.</p>
          <HiringPressureChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Time-to-fill</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Cambio entre los últimos dos bimestres</h2>
          <TimeToFillChart />
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_.85fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Channel strategy</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Fuentes utilizadas por el mercado</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Prevalencia de uso por empresa. No equivale todavía a efectividad: la siguiente evolución será cruzar canal con contratación y permanencia.</p>
          <RecruitmentSourcesChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Acquisition signal</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">El reto no parece ser encontrar candidatos únicamente: también es convertirlos en talento elegible.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">La empresa mediana reporta solo {latestMarket.candidateAcceptancePer10Median} candidatos que cumplen requisitos por cada 10 entrevistados. Al mismo tiempo, la demanda futura suma {formatInt(latestMarket.vacancies.total)} posiciones operativas y administrativas.</p>
          <div className="mt-6 space-y-2">
            {topRejection.slice(0, 3).map((row) => (
              <div key={row.cause} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 text-xs">
                <span className="text-slate-300">{row.cause}</span><strong>{row.medianPct}%</strong>
              </div>
            ))}
          </div>
          <p className="mt-5 text-[11px] leading-5 text-slate-400">Los porcentajes de rechazo se presentan como medianas de empresas con respuesta válida y no deben sumarse como un funnel.</p>
        </article>
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="eyebrow">Screening friction</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Principales motivos de rechazo</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-6 py-3">Motivo</th><th className="px-6 py-3">Mediana</th><th className="px-6 py-3">Empresas con dato</th><th className="px-6 py-3">Uso sugerido</th></tr>
            </thead>
            <tbody>
              {topRejection.map((row) => (
                <tr key={row.cause} className="border-t border-slate-100">
                  <td className="px-6 py-3 font-semibold text-slate-800">{row.cause}</td>
                  <td className="px-6 py-3 font-black text-slate-950">{row.medianPct}%</td>
                  <td className="px-6 py-3 text-slate-500">{row.responses} / 40</td>
                  <td className="px-6 py-3 text-xs font-bold text-cyan-700">Cruzar con canal y puesto →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardFrame>
  );
}
