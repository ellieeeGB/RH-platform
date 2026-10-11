import {
  BadgeDollarSign,
  BriefcaseBusiness,
  CircleGauge,
  ShieldAlert,
  UsersRound,
} from "lucide-react";
import { HiringPressureChart, WorkforceTrendChart } from "@/components/charts";
import { KpiCard } from "@/components/kpi-card";
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";
import {
  benchmarkData,
  latestMarket,
  marketChange,
  qualitySummary,
} from "@/lib/benchmark-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const formatMoney = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);

export default function Home() {
  const previous = benchmarkData.periods.at(-2)!;
  const beforePrevious = benchmarkData.periods.at(-3)!;
  const previousTurnover = previous.exits / ((beforePrevious.qualityAdjustedHeadcount + previous.qualityAdjustedHeadcount) / 2) * 100;
  const turnoverDelta = latestMarket.turnoverBimonthlyPct - previousTurnover;

  const marketRows = [
    { metric: "Salario ingreso mediano", value: `${formatMoney(latestMarket.salaryBandsDaily.entryMedian)}/día`, context: `máximo mediano ${formatMoney(latestMarket.salaryBandsDaily.maxMedian)}` },
    { metric: "Time-to-fill técnico", value: `${latestMarket.timeToFillDays.technical} días`, context: `+${marketChange.technicalTimeToFillDays} días vs. bimestre anterior` },
    { metric: "Candidatos adecuados", value: `${latestMarket.candidateAcceptancePer10Median}/10`, context: "mediana de la muestra" },
    { metric: "Capacitación", value: `${latestMarket.trainingHoursPerHead} h/persona`, context: "intensidad bimestral agregada" },
  ];

  const alerts = [
    {
      level: "high",
      title: "Contratación técnica más lenta",
      body: `La mediana de time-to-fill técnico subió de ${previous.timeToFill.technical} a ${latestMarket.timeToFillDays.technical} días.`,
    },
    {
      level: "medium",
      title: "Presión de contratación",
      body: `La muestra reporta ${formatInt(latestMarket.vacancies.total)} plazas operativas y administrativas próximas a cubrir (${latestMarket.hiringPressurePct}% del headcount).`,
    },
    {
      level: "good",
      title: "Salario de entrada estable",
      body: `La mediana de salario diario de ingreso se mantiene en ${formatMoney(latestMarket.salaryBandsDaily.entryMedian)} frente al bimestre anterior.`,
    },
  ];

  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <Topbar />
        <main className="mx-auto max-w-[1600px] p-5 md:p-8">
          <section className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="eyebrow">Executive Pulse · {latestMarket.period}</div>
              <h1 className="mb-2 mt-2 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">El mercado de talento, sin esconder la calidad del dato.</h1>
              <p className="m-0 max-w-2xl text-sm leading-6 text-slate-500">Vista agregada de 40 compañías y siete bimestres. Las métricas reportadas se conservan y cualquier ajuste analítico queda señalado de forma explícita.</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {[`Periodo · ${latestMarket.period}`, "Vista · Mercado / 40 empresas", "Benchmark · Muestra anonimizada"].map((label) => (
                <button key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm">{label}</button>
              ))}
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <KpiCard label="Headcount muestra" value={formatInt(latestMarket.headcount)} change={latestMarket.headcountChangePct} changeLabel="vs. bimestre anterior" icon={UsersRound} />
            <KpiCard label="Rotación bimestral" value={`${latestMarket.turnoverBimonthlyPct.toFixed(1)}%`} change={Number(turnoverDelta.toFixed(2))} changeLabel="pp vs. anterior" icon={CircleGauge} inverse />
            <KpiCard label="Contrataciones" value={formatInt(latestMarket.hires)} change={Number(marketChange.hiresPct.toFixed(1))} changeLabel="vs. bimestre anterior" icon={BriefcaseBusiness} />
            <KpiCard label="Salario ingreso mediano" value={formatMoney(latestMarket.salaryBandsDaily.entryMedian)} change={0} changeLabel="MXN diarios · estable" icon={BadgeDollarSign} />
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_.9fr]">
            <article className="panel p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="eyebrow">Workforce Intelligence</div>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">Evolución de personal · reportado vs. ajustado</h2>
                </div>
                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-800">7 bimestres</span>
              </div>
              <WorkforceTrendChart />
              <p className="mb-0 mt-3 text-xs leading-5 text-slate-400">El ajuste analítico solo se usa para comparación y modelado; nunca reemplaza el valor reportado en la fuente.</p>
            </article>

            <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
              <div className="mb-9 flex items-center justify-between">
                <div className="eyebrow !text-cyan-300">Evidence Insight</div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold text-cyan-100">Datos Jul–Ago 2025</div>
              </div>
              <h2 className="max-w-lg text-2xl font-black leading-tight">El cuello de botella visible está en la velocidad de contratación técnica.</h2>
              <p className="mt-4 text-sm leading-6 text-slate-300">La mediana técnica pasó de {previous.timeToFill.technical} a {latestMarket.timeToFillDays.technical} días. Al mismo tiempo, las empresas reportan {formatInt(latestMarket.vacancies.total)} plazas operativas y administrativas próximas a cubrir.</p>
              <div className="mt-7 grid grid-cols-3 gap-2">
                {[[`+${marketChange.technicalTimeToFillDays} d`, "time-to-fill técnico"], [formatInt(latestMarket.vacancies.total), "vacantes próximas"], [`${latestMarket.candidateAcceptancePer10Median}/10`, "candidatos adecuados"]].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/5 p-3">
                    <div className="text-lg font-black">{value}</div>
                    <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
              <button className="mt-7 rounded-2xl bg-cyan-400 px-4 py-2.5 text-xs font-black text-slate-950">Explorar evidencia →</button>
            </article>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
            <article className="panel p-5 md:p-6">
              <div className="mb-5">
                <div className="eyebrow">Talent Acquisition</div>
                <h2 className="mt-1 text-lg font-extrabold text-slate-950">Vacantes próximas + tiempo de contratación</h2>
              </div>
              <HiringPressureChart />
            </article>

            <article className="panel p-5 md:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="eyebrow">Benchmark Studio</div>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">Pulso de la muestra</h2>
                </div>
                <span className="text-xs font-semibold text-slate-400">medianas / agregados</span>
              </div>
              <div className="space-y-3">
                {marketRows.map((row) => (
                  <div key={row.metric} className="grid grid-cols-[1.1fr_auto] items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                    <div>
                      <div className="text-sm font-bold text-slate-800">{row.metric}</div>
                      <div className="mt-1 text-[11px] text-slate-400">{row.context}</div>
                    </div>
                    <div className="text-right text-sm font-black text-slate-900">{row.value}</div>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.65fr]">
            <article className="panel p-5 md:p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-50 text-amber-700"><ShieldAlert size={19} /></div>
                <div>
                  <div className="eyebrow">Risks & Opportunities</div>
                  <h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué atender primero</h2>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {alerts.map((alert) => (
                  <div key={alert.title} className="rounded-2xl border border-slate-100 p-4">
                    <span className={`mb-3 inline-block h-2.5 w-2.5 rounded-full ${alert.level === "high" ? "bg-rose-500" : alert.level === "medium" ? "bg-amber-400" : "bg-emerald-500"}`} />
                    <div className="text-sm font-extrabold text-slate-900">{alert.title}</div>
                    <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">{alert.body}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="panel p-5 md:p-6">
              <div className="eyebrow">Data Quality</div>
              <div className="mt-4 flex items-end gap-3">
                <div className="text-5xl font-black tracking-tight text-slate-950">{qualitySummary.score}</div>
                <div className="pb-1 text-sm font-bold text-emerald-600">/ 100 · Controlado</div>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-500">El score se calcula sobre reglas de reconciliación, consistencia de porcentajes, orden salarial y anomalías longitudinales.</p>
              <div className="mt-5 space-y-2 text-xs font-semibold text-slate-600">
                <div className="flex justify-between"><span>Reglas evaluadas</span><strong>{qualitySummary.rulesEvaluated}</strong></div>
                <div className="flex justify-between"><span>Reglas correctas</span><strong className="text-emerald-600">{qualitySummary.rulesPassed}</strong></div>
                <div className="flex justify-between"><span>Fallos de regla</span><strong className="text-amber-600">{qualitySummary.ruleFailures}</strong></div>
                <div className="flex justify-between"><span>Anomalías críticas</span><strong className="text-rose-600">{qualitySummary.criticalAnomalies}</strong></div>
              </div>
            </article>
          </section>
        </main>
      </div>
    </div>
  );
}
