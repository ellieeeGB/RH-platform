import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Database,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import { HiringPressureChart, WorkforceTrendChart } from "@/components/charts";
import { DashboardFrame } from "@/components/dashboard-frame";
import {
  benchmarkData,
  latestMarket,
  marketChange,
  qualitySummary,
} from "@/lib/benchmark-data";
import peopleData from "../../data/processed/people-intelligence.json";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const formatMoney = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

export default function Home() {
  const previous = benchmarkData.periods.at(-2)!;
  const beforePrevious = benchmarkData.periods.at(-3)!;
  const previousTurnover = previous.exits / ((beforePrevious.qualityAdjustedHeadcount + previous.qualityAdjustedHeadcount) / 2) * 100;
  const turnoverDelta = latestMarket.turnoverBimonthlyPct - previousTurnover;
  const earlyAttrition = peopleData.retention.earlyAttritionUnder3MonthsPct;

  const stabilityScore = Math.max(0, 100 - latestMarket.turnoverBimonthlyPct * 4.5);
  const capacityScore = Math.max(0, 100 - latestMarket.hiringPressurePct * 3);
  const hiringSpeedScore = Math.max(0, 100 - Math.max(0, latestMarket.timeToFillDays.technical - 15) * 2.5);
  const healthScore = Math.round(stabilityScore * 0.35 + capacityScore * 0.25 + hiringSpeedScore * 0.2 + qualitySummary.score * 0.2);

  const pulseMetrics = [
    {
      label: "Headcount muestra",
      value: formatInt(latestMarket.headcount),
      note: `${latestMarket.headcountChangePct >= 0 ? "+" : ""}${latestMarket.headcountChangePct}% vs. corte anterior`,
      icon: UsersRound,
      tone: "text-cyan-700 bg-cyan-50",
    },
    {
      label: "Rotación bimestral",
      value: `${latestMarket.turnoverBimonthlyPct.toFixed(1)}%`,
      note: `${turnoverDelta >= 0 ? "+" : ""}${turnoverDelta.toFixed(2)} pp vs. anterior`,
      icon: TrendingUp,
      tone: "text-amber-700 bg-amber-50",
    },
    {
      label: "Contrataciones",
      value: formatInt(latestMarket.hires),
      note: `${marketChange.hiresPct.toFixed(1)}% vs. corte anterior`,
      icon: BriefcaseBusiness,
      tone: "text-violet-700 bg-violet-50",
    },
    {
      label: "Salario ingreso",
      value: formatMoney(latestMarket.salaryBandsDaily.entryMedian),
      note: "mediana diaria · estable",
      icon: BadgeDollarSign,
      tone: "text-emerald-700 bg-emerald-50",
    },
  ];

  const insights = [
    {
      severity: "Crítico",
      color: "bg-rose-500",
      title: "La contratación técnica perdió velocidad",
      detail: `El time-to-fill técnico pasó de ${previous.timeToFill.technical} a ${latestMarket.timeToFillDays.technical} días en un bimestre.`,
      meta: `+${marketChange.technicalTimeToFillDays} días · señal de capacidad`,
      href: "/talent-acquisition",
      cta: "Analizar contratación",
    },
    {
      severity: "Atención",
      color: "bg-amber-400",
      title: "La rotación temprana concentra el riesgo",
      detail: `En las empresas con distribución válida por antigüedad, ${earlyAttrition}% de las bajas ocurre antes de cumplir tres meses.`,
      meta: `${peopleData.retention.tenureValidCompanies} empresas con base conciliada`,
      href: "/retencion",
      cta: "Abrir rotación",
    },
    {
      severity: "Oportunidad",
      color: "bg-emerald-500",
      title: "La compensación de entrada se mantiene estable",
      detail: `La mediana de salario diario de ingreso permanece en ${formatMoney(latestMarket.salaryBandsDaily.entryMedian)} frente al corte anterior.`,
      meta: "Úsalo como referencia para escenarios salariales",
      href: "/what-if",
      cta: "Simular escenario",
    },
  ];

  return (
    <DashboardFrame>
      <section className="animate-reveal overflow-hidden rounded-[32px] border border-slate-200/60 bg-white/75 shadow-[0_30px_80px_rgba(20,40,75,.08)] backdrop-blur-xl">
        <div className="grid lg:grid-cols-[1.28fr_.72fr]">
          <div className="relative overflow-hidden p-6 md:p-9 xl:p-11">
            <div className="pointer-events-none absolute -left-16 top-6 h-52 w-52 rounded-full bg-cyan-300/15 blur-3xl" />
            <div className="relative">
              <div className="mb-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-cyan-700">
                <Sparkles size={14} /> Catch Consulting · Executive Brief
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-[-0.045em] text-[#07182d] md:text-5xl md:leading-[1.02] xl:text-[3.5rem]">
                Esto es lo más importante que está ocurriendo en tu mercado laboral.
              </h1>
              <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
                El mercado permanece relativamente estable, pero hay dos señales que merecen atención inmediata: la contratación técnica está tardando más y la rotación temprana concentra una parte relevante de las bajas.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/talent-acquisition" className="inline-flex items-center gap-2 rounded-xl bg-[#0b2140] px-4 py-3 text-xs font-black text-white shadow-lg shadow-slate-900/10 transition hover:-translate-y-0.5">
                  Ver qué cambió <ArrowRight size={14} />
                </Link>
                <Link href="/copilot" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black text-slate-700 transition hover:border-cyan-300 hover:text-cyan-800">
                  <Sparkles size={14} className="text-cyan-600" /> Explícame qué está pasando
                </Link>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden bg-[#07182d] p-7 text-white md:p-9">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-cyan-400/20 blur-3xl" />
            <div className="absolute -bottom-20 left-8 h-52 w-52 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.18em] text-cyan-300">Market Health Score</div>
                <div className="mt-5 flex items-end gap-3">
                  <div className="text-7xl font-black tracking-[-0.07em]">{healthScore}</div>
                  <div className="pb-2 text-sm font-bold text-slate-400">/ 100</div>
                </div>
                <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold text-cyan-100">
                  <span className="h-2 w-2 rounded-full bg-amber-300" /> Estable, con señales de atención
                </div>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-2xl bg-white/[0.055] p-4 ring-1 ring-inset ring-white/10">
                  <div className="text-slate-400">Data Health</div>
                  <div className="mt-1 text-xl font-black">{qualitySummary.score}/100</div>
                </div>
                <div className="rounded-2xl bg-white/[0.055] p-4 ring-1 ring-inset ring-white/10">
                  <div className="text-slate-400">Hiring pressure</div>
                  <div className="mt-1 text-xl font-black">{latestMarket.hiringPressurePct}%</div>
                </div>
              </div>
              <p className="mb-0 mt-5 text-[10px] leading-5 text-slate-500">Score compuesto para orientación ejecutiva: estabilidad, presión de contratación, velocidad de cobertura y calidad del dato. No sustituye el análisis de cada indicador.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="animate-reveal-delay-1 mt-5 panel overflow-hidden">
        <div className="grid divide-y divide-slate-100 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
          {pulseMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.label} className="p-5 xl:p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="metric-label">{metric.label}</div>
                    <div className="mt-2 text-2xl font-black tracking-[-0.04em] text-[#0b2140]">{metric.value}</div>
                  </div>
                  <div className={`grid h-9 w-9 place-items-center rounded-xl ${metric.tone}`}><Icon size={16} /></div>
                </div>
                <div className="mt-2 text-[11px] font-semibold text-slate-400">{metric.note}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="animate-reveal-delay-2 mt-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <div className="eyebrow">Decision Journey</div>
            <h2 className="mt-1 text-xl font-black tracking-tight text-[#0b2140]">De la señal a la decisión</h2>
          </div>
          <div className="hidden text-xs font-semibold text-slate-400 md:block">Jul–Ago 2025 · muestra anonimizada</div>
        </div>
        <div className="grid gap-3 lg:grid-cols-4">
          <div className="story-card">
            <div className="flex items-center justify-between"><span className="metric-label">01 · Qué pasó</span><TrendingDown size={16} className="text-rose-500" /></div>
            <div className="mt-3 text-sm font-black text-slate-900">La velocidad de contratación técnica empeoró.</div>
            <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">El time-to-fill subió de {previous.timeToFill.technical} a {latestMarket.timeToFillDays.technical} días y las contrataciones bajaron {Math.abs(marketChange.hiresPct).toFixed(1)}%.</p>
          </div>
          <div className="story-card">
            <div className="flex items-center justify-between"><span className="metric-label">02 · Por qué importa</span><Clock3 size={16} className="text-amber-500" /></div>
            <div className="mt-3 text-sm font-black text-slate-900">La demanda futura no desapareció.</div>
            <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">Hay {formatInt(latestMarket.vacancies.total)} plazas próximas reportadas, equivalentes a {latestMarket.hiringPressurePct}% del headcount de la muestra.</p>
          </div>
          <div className="story-card">
            <div className="flex items-center justify-between"><span className="metric-label">03 · Dónde mirar</span><UsersRound size={16} className="text-violet-500" /></div>
            <div className="mt-3 text-sm font-black text-slate-900">Retención temprana y talento técnico.</div>
            <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">{earlyAttrition}% de las bajas de la base conciliada ocurre antes de tres meses: contratar más sin retener puede amplificar el problema.</p>
          </div>
          <div className="story-card border-cyan-200/70 bg-gradient-to-br from-cyan-50/80 to-white">
            <div className="flex items-center justify-between"><span className="metric-label !text-cyan-700">04 · Qué hacer ahora</span><CheckCircle2 size={16} className="text-cyan-600" /></div>
            <div className="mt-3 text-sm font-black text-slate-900">Probar escenarios antes de decidir.</div>
            <p className="mb-3 mt-2 text-xs leading-5 text-slate-500">Simula menor rotación, ajustes salariales o nuevas vacantes y observa el impacto en capacidad y costo.</p>
            <Link href="/what-if" className="inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir Scenario Lab <ArrowRight size={13} /></Link>
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <article className="panel p-5 md:p-6">
          <div className="mb-5 flex items-start justify-between gap-4">
            <div>
              <div className="eyebrow">Workforce signal</div>
              <h2 className="mt-1 text-lg font-black text-[#0b2140]">Cómo se ha movido la plantilla</h2>
              <p className="mt-1 text-xs leading-5 text-slate-400">Reportado vs. ajuste analítico; el dato original nunca se reemplaza.</p>
            </div>
            <Link href="/contexto" className="hidden rounded-xl border border-slate-200 px-3 py-2 text-[11px] font-bold text-slate-500 md:block">Ver contexto →</Link>
          </div>
          <WorkforceTrendChart />
        </article>

        <article className="panel p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Intelligence Feed</div>
              <h2 className="mt-1 text-lg font-black text-[#0b2140]">Lo que merece atención</h2>
            </div>
            <Sparkles size={18} className="text-cyan-600" />
          </div>
          <div className="mt-5 space-y-3">
            {insights.map((insight) => (
              <div key={insight.title} className="rounded-2xl border border-slate-100 bg-slate-50/65 p-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                  <span className={`h-2 w-2 rounded-full ${insight.color}`} /> {insight.severity}
                </div>
                <div className="mt-2 text-sm font-black text-slate-900">{insight.title}</div>
                <p className="mb-0 mt-1.5 text-xs leading-5 text-slate-500">{insight.detail}</p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-[10px] font-semibold text-slate-400">{insight.meta}</span>
                  <Link href={insight.href} className="shrink-0 text-[11px] font-black text-cyan-800">{insight.cta} →</Link>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[1fr_.9fr]">
        <article className="panel p-5 md:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="eyebrow">Talent capacity</div>
              <h2 className="mt-1 text-lg font-black text-[#0b2140]">Vacantes próximas vs. tiempo de cobertura</h2>
            </div>
            <BriefcaseBusiness size={18} className="text-violet-600" />
          </div>
          <HiringPressureChart />
        </article>

        <article className="panel p-5 md:p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="eyebrow">Trust layer</div>
              <h2 className="mt-1 text-lg font-black text-[#0b2140]">¿Qué tan confiable es esta lectura?</h2>
            </div>
            <ShieldCheck size={19} className="text-emerald-600" />
          </div>
          <div className="mt-6 flex items-end gap-3">
            <div className="text-5xl font-black tracking-[-0.06em] text-[#0b2140]">{qualitySummary.score}</div>
            <div className="pb-1 text-sm font-bold text-emerald-600">/100 · controlado</div>
          </div>
          <p className="mt-4 text-xs leading-5 text-slate-500">La plataforma revisa reconciliaciones, porcentajes, orden salarial y anomalías longitudinales antes de usar un dato para benchmark o recomendación.</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4"><Database size={15} className="text-slate-400" /><div className="mt-2 text-xl font-black text-slate-900">{qualitySummary.rulesEvaluated}</div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">reglas evaluadas</div></div>
            <div className="rounded-2xl bg-slate-50 p-4"><ShieldCheck size={15} className="text-emerald-500" /><div className="mt-2 text-xl font-black text-slate-900">{qualitySummary.rulesPassed}</div><div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">reglas correctas</div></div>
          </div>
          <Link href="/data-quality" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Revisar calidad del dato <ArrowRight size={13} /></Link>
        </article>
      </section>
    </DashboardFrame>
  );
}
