import Link from "next/link";
import {
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  BadgeDollarSign,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Database,
  MoveRight,
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
    ["HEADCOUNT", formatInt(latestMarket.headcount), `${latestMarket.headcountChangePct >= 0 ? "+" : ""}${latestMarket.headcountChangePct}%`],
    ["ROTACIÓN", `${latestMarket.turnoverBimonthlyPct.toFixed(1)}%`, `${turnoverDelta >= 0 ? "+" : ""}${turnoverDelta.toFixed(2)} pp`],
    ["CONTRATACIONES", formatInt(latestMarket.hires), `${marketChange.hiresPct.toFixed(1)}%`],
    ["SALARIO INGRESO", formatMoney(latestMarket.salaryBandsDaily.entryMedian), "MXN / día"],
    ["TIME TO FILL TÉCNICO", `${latestMarket.timeToFillDays.technical} días`, `+${marketChange.technicalTimeToFillDays} días`],
    ["DATA HEALTH", `${qualitySummary.score}/100`, `${qualitySummary.rulesPassed} reglas válidas`],
  ];

  return (
    <DashboardFrame>
      <div className="visual-home -mx-5 -mt-5 md:-mx-8 md:-mt-8">
        <section className="hero-stage relative min-h-[calc(100vh-80px)] overflow-hidden bg-[#07182d] text-white">
          <div className="hero-grid absolute inset-0 opacity-40" />
          <div className="hero-orb hero-orb-a" />
          <div className="hero-orb hero-orb-b" />

          <div className="relative mx-auto grid min-h-[calc(100vh-80px)] max-w-[1760px] items-center gap-10 px-6 py-12 md:px-10 xl:grid-cols-[.88fr_1.12fr] xl:px-14">
            <div className="z-10 max-w-3xl animate-reveal">
              <div className="mb-7 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.28em] text-cyan-300">
                <span className="h-px w-10 bg-cyan-300/70" /> Catch Consulting Intelligence
              </div>
              <h1 className="display-title max-w-4xl text-[3.2rem] font-black leading-[.92] tracking-[-0.07em] sm:text-[4.2rem] xl:text-[5.6rem] 2xl:text-[6.5rem]">
                Datos que se ven.
                <span className="block text-gradient-catch">Decisiones que se sienten.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                Una lectura visual del mercado laboral para entender qué cambió, dónde está el riesgo y qué conviene hacer antes de abrir cualquier reporte.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="#story" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-black text-[#07182d] transition hover:-translate-y-0.5 hover:shadow-2xl">
                  Explorar el panorama <ArrowDownRight size={15} />
                </Link>
                <Link href="/indicadores" className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 py-3 text-xs font-black text-white backdrop-blur transition hover:border-cyan-300/50 hover:bg-white/[0.1]">
                  Ir a KPIs <ArrowRight size={15} />
                </Link>
              </div>

              <div className="mt-12 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
                <div className="bg-[#07182d]/70 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Muestra</div>
                  <div className="mt-1 text-2xl font-black">40</div>
                  <div className="text-[10px] text-slate-400">empresas</div>
                </div>
                <div className="bg-[#07182d]/70 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Historia</div>
                  <div className="mt-1 text-2xl font-black">7</div>
                  <div className="text-[10px] text-slate-400">bimestres</div>
                </div>
                <div className="bg-[#07182d]/70 p-4 backdrop-blur">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Calidad</div>
                  <div className="mt-1 text-2xl font-black">{qualitySummary.score}</div>
                  <div className="text-[10px] text-slate-400">/100</div>
                </div>
              </div>
            </div>

            <div className="relative mx-auto h-[560px] w-full max-w-[780px] animate-reveal-delay-1 md:h-[650px] xl:h-[720px]">
              <div className="absolute left-[4%] top-[7%] h-[71%] w-[62%] rotate-[-3deg] overflow-hidden rounded-[38px] shadow-[0_45px_120px_rgba(0,0,0,.45)] ring-1 ring-white/10">
                <img
                  src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1400&q=88"
                  alt="Entorno industrial"
                  className="kenburns h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061529]/90 via-[#061529]/10 to-cyan-500/10" />
                <div className="absolute bottom-7 left-7 right-7">
                  <div className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-300">Market signal</div>
                  <div className="mt-2 max-w-md text-2xl font-black leading-tight">El talento técnico tarda más en llegar.</div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                    <span className="rounded-full bg-rose-400/15 px-2.5 py-1 font-bold text-rose-200">+{marketChange.technicalTimeToFillDays} días</span>
                    vs. bimestre anterior
                  </div>
                </div>
              </div>

              <div className="absolute right-[2%] top-[18%] h-[42%] w-[39%] rotate-[4deg] overflow-hidden rounded-[30px] border-[6px] border-[#07182d] shadow-[0_30px_90px_rgba(0,0,0,.45)]">
                <img
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=88"
                  alt="Equipo colaborando"
                  className="h-full w-full object-cover transition duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#07182d]/80" />
              </div>

              <div className="floating-card absolute bottom-[13%] right-[4%] w-[45%] rounded-[26px] border border-white/15 bg-white/[0.1] p-5 backdrop-blur-2xl">
                <div className="flex items-center justify-between">
                  <div className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-200">Market Health</div>
                  <Sparkles size={15} className="text-cyan-300" />
                </div>
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-5xl font-black tracking-[-0.07em]">{healthScore}</span>
                  <span className="pb-1 text-xs text-slate-400">/100</span>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-300 to-violet-400" style={{ width: `${healthScore}%` }} />
                </div>
              </div>

              <div className="floating-dot absolute left-[2%] top-[6%] grid h-16 w-16 place-items-center rounded-full border border-white/15 bg-cyan-300 text-xl font-black text-[#07182d] shadow-2xl">C</div>
            </div>
          </div>

          <div className="ticker-shell absolute bottom-0 left-0 right-0 border-y border-white/10 bg-white/[0.035] py-3 backdrop-blur-xl">
            <div className="metric-marquee">
              {[...pulseMetrics, ...pulseMetrics].map(([label, value, note], index) => (
                <div key={`${label}-${index}`} className="flex shrink-0 items-center gap-3 pr-10 text-xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                  <span className="font-black tracking-[0.08em] text-white">{label}</span>
                  <span className="text-cyan-200">{value}</span>
                  <span className="text-slate-500">{note}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="story" className="bg-[#f4f6f9] px-6 py-24 md:px-10 xl:px-14 xl:py-32">
          <div className="mx-auto max-w-[1660px]">
            <div className="grid items-end gap-8 lg:grid-cols-[.78fr_1.22fr]">
              <div className="reveal-on-scroll">
                <div className="eyebrow">Cómo leer Catch Intelligence</div>
                <h2 className="mt-4 max-w-xl text-4xl font-black leading-[.98] tracking-[-0.05em] text-[#07182d] md:text-6xl">
                  Primero la historia. Después el dashboard.
                </h2>
              </div>
              <p className="max-w-3xl text-base leading-8 text-slate-500 lg:justify-self-end lg:text-lg">
                La plataforma deja de pedirle al usuario que interprete veinte gráficas. Cada sección presenta una señal, la contextualiza y luego abre la evidencia detallada.
              </p>
            </div>

            <div className="mt-16 grid gap-4 lg:grid-cols-3">
              <article className="presentation-card group min-h-[430px] overflow-hidden bg-[#0a2141] text-white">
                <div className="absolute inset-0 opacity-20 [background:radial-gradient(circle_at_70%_10%,#22d3ee,transparent_35%)]" />
                <div className="relative flex h-full flex-col justify-between p-7 md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-[0.22em] text-cyan-300">01 · MIDE</span>
                    <BarChart3 size={20} className="text-cyan-300" />
                  </div>
                  <div>
                    <div className="text-[6rem] font-black leading-none tracking-[-0.09em] text-white/10 md:text-[8rem]">40</div>
                    <h3 className="-mt-5 text-3xl font-black tracking-tight">Ver el mercado completo.</h3>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">Headcount, salarios, contratación, bajas, beneficios y calidad del dato en una sola lectura.</p>
                    <Link href="/indicadores" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-cyan-200">Abrir indicadores <MoveRight size={14} /></Link>
                  </div>
                </div>
              </article>

              <article className="presentation-card group min-h-[430px] overflow-hidden bg-white">
                <img
                  src="https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=88"
                  alt="Análisis estratégico"
                  className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07182d] via-[#07182d]/35 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-7 text-white md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-[0.22em] text-cyan-200">02 · ANALIZA</span>
                    <TrendingUp size={20} className="text-cyan-200" />
                  </div>
                  <div>
                    <div className="mb-3 inline-flex rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[10px] font-bold backdrop-blur">{earlyAttrition}% de bajas antes de 3 meses</div>
                    <h3 className="text-3xl font-black tracking-tight">Encontrar la señal dentro del ruido.</h3>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-slate-200">No basta con saber que existe rotación: importa saber cuándo aparece y dónde concentra riesgo.</p>
                    <Link href="/retencion" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-cyan-200">Explorar rotación <MoveRight size={14} /></Link>
                  </div>
                </div>
              </article>

              <article className="presentation-card group min-h-[430px] overflow-hidden bg-[#6b5cf5] text-white">
                <div className="absolute -right-16 top-10 h-64 w-64 rounded-full border-[40px] border-white/10 transition duration-700 group-hover:scale-110" />
                <div className="absolute -left-12 bottom-0 h-44 w-44 rounded-full bg-cyan-300/30 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between p-7 md:p-9">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black tracking-[0.22em] text-white/80">03 · DECIDE</span>
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <div className="text-[5.5rem] font-black leading-none tracking-[-0.08em] text-white/15">WHAT IF?</div>
                    <h3 className="-mt-4 text-3xl font-black tracking-tight">Mover variables antes de mover presupuesto.</h3>
                    <p className="mt-4 max-w-sm text-sm leading-6 text-violet-100">Simula rotación, vacantes y ajustes salariales con cálculos trazables antes de ejecutar una decisión.</p>
                    <Link href="/what-if" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-white">Abrir Scenario Lab <MoveRight size={14} /></Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="overflow-hidden bg-white px-6 py-24 md:px-10 xl:px-14 xl:py-32">
          <div className="mx-auto max-w-[1660px]">
            <div className="grid gap-12 xl:grid-cols-[.72fr_1.28fr] xl:items-center">
              <div>
                <div className="eyebrow">The signal</div>
                <div className="mt-5 text-[6rem] font-black leading-[.8] tracking-[-0.09em] text-[#07182d] md:text-[8rem]">+{marketChange.technicalTimeToFillDays}</div>
                <div className="mt-4 text-2xl font-black text-[#07182d] md:text-4xl">días para cubrir talento técnico.</div>
                <p className="mt-5 max-w-lg text-sm leading-7 text-slate-500 md:text-base">La señal cobra sentido al cruzarla con {formatInt(latestMarket.vacancies.total)} plazas próximas y una caída de {Math.abs(marketChange.hiresPct).toFixed(1)}% en contrataciones respecto al corte anterior.</p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/talent-acquisition" className="rounded-full bg-[#07182d] px-5 py-3 text-xs font-black text-white">Ver evidencia</Link>
                  <Link href="/copilot" className="rounded-full border border-slate-200 px-5 py-3 text-xs font-black text-slate-700">Preguntar a Catch AI</Link>
                </div>
              </div>

              <div className="relative min-h-[620px]">
                <div className="absolute inset-x-0 top-0 overflow-hidden rounded-[42px] bg-[#f2f6fa] p-6 shadow-[0_35px_90px_rgba(9,30,60,.12)] md:p-8">
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Talent pressure</div>
                      <h3 className="mt-1 text-xl font-black text-[#07182d]">Demanda futura vs. velocidad de cobertura</h3>
                    </div>
                    <div className="rounded-full bg-amber-100 px-3 py-1.5 text-[10px] font-black text-amber-800">ATENCIÓN</div>
                  </div>
                  <HiringPressureChart />
                </div>

                <div className="absolute bottom-0 left-[7%] w-[44%] overflow-hidden rounded-[30px] bg-[#07182d] p-5 text-white shadow-2xl md:p-6">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-cyan-300">Vacantes próximas</div>
                  <div className="mt-2 text-4xl font-black">{formatInt(latestMarket.vacancies.total)}</div>
                  <div className="mt-2 text-xs leading-5 text-slate-400">{latestMarket.hiringPressurePct}% del headcount de la muestra</div>
                </div>

                <div className="absolute bottom-[4%] right-[3%] w-[43%] overflow-hidden rounded-[30px] border border-slate-200 bg-white p-5 shadow-xl md:p-6">
                  <div className="text-[9px] font-black uppercase tracking-[0.18em] text-violet-600">Candidatos adecuados</div>
                  <div className="mt-2 text-4xl font-black text-[#07182d]">{latestMarket.candidateAcceptancePer10Median}/10</div>
                  <div className="mt-2 text-xs leading-5 text-slate-500">Mediana de la muestra en el último corte.</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-[#07182d] px-6 py-24 text-white md:px-10 xl:px-14 xl:py-32">
          <div className="absolute inset-0 opacity-30 [background:radial-gradient(circle_at_20%_10%,rgba(34,211,238,.3),transparent_26%),radial-gradient(circle_at_80%_85%,rgba(109,93,252,.3),transparent_30%)]" />
          <div className="relative mx-auto max-w-[1660px]">
            <div className="grid gap-12 xl:grid-cols-[.8fr_1.2fr] xl:items-end">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-cyan-300">Workforce story</div>
                <h2 className="mt-4 text-4xl font-black leading-none tracking-[-0.055em] md:text-6xl">La gráfica deja de ser el final.<br />Se vuelve evidencia.</h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 md:text-base">Cada visualización importante vive dentro de una historia: qué ocurrió, por qué importa, qué hipótesis revisar y qué acción tiene sentido probar.</p>
              </div>
              <div className="rounded-[36px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl md:p-7">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <div className="text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">Headcount trend</div>
                    <div className="mt-1 text-lg font-black">Reportado vs. ajuste analítico</div>
                  </div>
                  <Link href="/contexto" className="rounded-full border border-white/10 px-3 py-2 text-[10px] font-bold text-slate-300">Abrir contexto →</Link>
                </div>
                <div className="rounded-[26px] bg-white p-4 text-slate-900">
                  <WorkforceTrendChart />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f4f6f9] px-6 py-24 md:px-10 xl:px-14 xl:py-32">
          <div className="mx-auto max-w-[1660px]">
            <div className="mb-12 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="eyebrow">Intelligence Feed</div>
                <h2 className="mt-3 text-4xl font-black tracking-[-0.05em] text-[#07182d] md:text-6xl">Tres cosas que mirar hoy.</h2>
              </div>
              <Link href="/copilot" className="inline-flex items-center gap-2 text-xs font-black text-cyan-800">Explícamelo con Catch AI <ArrowRight size={14} /></Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <article className="insight-poster insight-poster-risk">
                <div className="poster-number">01</div>
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-rose-200"><span>Riesgo</span><Clock3 size={17} /></div>
                  <div>
                    <h3 className="text-3xl font-black leading-tight">Contratación técnica más lenta.</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-300">De {previous.timeToFill.technical} a {latestMarket.timeToFillDays.technical} días en un bimestre.</p>
                    <Link href="/talent-acquisition" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-white">Analizar <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </article>

              <article className="insight-poster insight-poster-warn">
                <div className="poster-number">02</div>
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-amber-900"><span>Atención</span><TrendingDown size={17} /></div>
                  <div>
                    <h3 className="text-3xl font-black leading-tight text-[#07182d]">Rotación temprana.</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-700">{earlyAttrition}% de las bajas conciliadas ocurre antes de cumplir tres meses.</p>
                    <Link href="/retencion" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[#07182d]">Abrir rotación <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </article>

              <article className="insight-poster insight-poster-opportunity">
                <div className="poster-number">03</div>
                <div className="relative z-10 flex h-full flex-col justify-between">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-cyan-950"><span>Oportunidad</span><BadgeDollarSign size={17} /></div>
                  <div>
                    <h3 className="text-3xl font-black leading-tight text-[#07182d]">Salario de entrada estable.</h3>
                    <p className="mt-4 text-sm leading-6 text-slate-700">La mediana permanece en {formatMoney(latestMarket.salaryBandsDaily.entryMedian)} diarios: una buena base para simular escenarios.</p>
                    <Link href="/what-if" className="mt-7 inline-flex items-center gap-2 text-xs font-black text-[#07182d]">Simular <ArrowRight size={14} /></Link>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden bg-white px-6 py-24 md:px-10 xl:px-14 xl:py-32">
          <div className="mx-auto max-w-[1660px]">
            <div className="grid overflow-hidden rounded-[44px] bg-[#07182d] text-white shadow-[0_45px_120px_rgba(7,24,45,.18)] lg:grid-cols-[1.1fr_.9fr]">
              <div className="relative p-8 md:p-12 xl:p-16">
                <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="relative">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-cyan-300">From data to decision</div>
                  <h2 className="mt-5 max-w-2xl text-4xl font-black leading-[.98] tracking-[-0.05em] md:text-6xl">No necesitas abrir 50 páginas para encontrar el problema.</h2>
                  <p className="mt-6 max-w-xl text-sm leading-7 text-slate-300 md:text-base">Usa la experiencia visual para entender el panorama y baja a los dashboards cuando necesites evidencia, comparación o detalle operativo.</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link href="/benchmark" className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-black text-[#07182d]">Comparar benchmark</Link>
                    <Link href="/data-quality" className="rounded-full border border-white/15 px-5 py-3 text-xs font-black text-white">Ver calidad del dato</Link>
                  </div>
                </div>
              </div>
              <div className="relative min-h-[420px] overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1400&q=88"
                  alt="Consultoría moderna"
                  className="h-full w-full object-cover transition duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#07182d] via-[#07182d]/20 to-transparent lg:bg-gradient-to-l lg:from-transparent lg:via-[#07182d]/15 lg:to-[#07182d]" />
                <div className="absolute bottom-7 right-7 rounded-2xl border border-white/15 bg-[#07182d]/70 p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2 text-xs font-black"><ShieldCheck size={15} className="text-emerald-300" /> Data quality controlado</div>
                  <div className="mt-2 text-3xl font-black">{qualitySummary.score}/100</div>
                  <div className="mt-1 text-[10px] text-slate-400">{qualitySummary.rulesPassed} reglas aprobadas</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardFrame>
  );
}
