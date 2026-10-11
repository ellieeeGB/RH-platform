import Link from "next/link";
import { ArrowRight, BadgeDollarSign, BriefcaseBusiness, Building2, CalendarRange, FileText, HeartPulse, ShieldCheck, TrendingDown, UsersRound } from "lucide-react";
import { DashboardFrame } from "@/components/dashboard-frame";
import { latestMarket, qualitySummary } from "@/lib/benchmark-data";
import peopleData from "../../../data/processed/people-intelligence.json";
import rewardsData from "../../../data/processed/workforce-rewards.json";
import { laborRelations, rewardsEconomics, talentMarket } from "@/lib/extended-intelligence";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const formatMoney = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

const chapters = [
  ["01", "Contexto y muestra", "/contexto"],
  ["02", "Personal y compensación", "/salarios"],
  ["03", "Negociación colectiva", "/relaciones-laborales"],
  ["04", "Rotación bimestral", "/retencion"],
  ["05", "Talent Acquisition", "/talent-acquisition"],
  ["06", "Posiciones próximas", "/workforce-planning"],
  ["07", "Ausentismo y salud", "/labor-risk"],
  ["08", "Beneficios y Total Rewards", "/beneficios"],
  ["09", "Benchmark y calidad", "/benchmark"],
] as const;

export default function ReportsPage() {
  const topRole = talentMarket.technicalRoles[0];
  const transport = rewardsEconomics.transport;

  return (
    <DashboardFrame>
      <section className="overflow-hidden rounded-[34px] bg-[#07182d] text-white shadow-[0_30px_90px_rgba(7,24,45,.14)]">
        <div className="grid min-h-[440px] lg:grid-cols-[1.2fr_.8fr]">
          <div className="relative p-7 md:p-10 xl:p-14">
            <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-400/15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.24em] text-cyan-300"><FileText size={14} /> Catch Consulting · Reporte Bimestral Digital</div>
              <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[.92] tracking-[-.065em] md:text-7xl">Julio – Agosto 2025</h1>
              <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">La lógica del reporte histórico se conserva, pero cada conclusión ahora conecta con evidencia navegable, benchmark, calidad del dato y escenarios de decisión.</p>
              <div className="mt-9 flex flex-wrap gap-3">
                <Link href="/signals" className="rounded-full bg-cyan-300 px-5 py-3 text-xs font-black text-[#07182d]">Ver señales ejecutivas</Link>
                <Link href="/data-atlas" className="rounded-full border border-white/15 px-5 py-3 text-xs font-black text-white">Explorar cobertura del estudio</Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-white/10">
            {[
              ["Muestra", "40", "empresas"],
              ["Headcount", formatInt(latestMarket.headcount), "personas reportadas"],
              ["Data health", `${qualitySummary.score}/100`, "reglas de calidad"],
              ["Vacantes", formatInt(latestMarket.vacancies.total), "próximas a cubrir"],
            ].map(([label, value, note]) => (
              <div key={label} className="flex flex-col justify-end bg-[#0a2141] p-6 md:p-7">
                <div className="text-[10px] font-black uppercase tracking-[.18em] text-slate-500">{label}</div>
                <div className="mt-2 text-4xl font-black tracking-[-.055em]">{value}</div>
                <div className="mt-1 text-xs text-slate-400">{note}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-5 grid gap-4 xl:grid-cols-[.72fr_1.28fr]">
        <aside className="panel p-5 md:p-6">
          <div className="eyebrow">Índice</div>
          <h2 className="mt-1 text-lg font-black text-[#07182d]">Capítulos del corte</h2>
          <div className="mt-5 space-y-1">
            {chapters.map(([number, title, href]) => (
              <Link key={number} href={href} className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition hover:bg-slate-50">
                <span className="w-7 text-[10px] font-black text-cyan-700">{number}</span>
                <span className="flex-1 text-xs font-bold text-slate-600 group-hover:text-slate-950">{title}</span>
                <ArrowRight size={13} className="text-slate-300 group-hover:text-cyan-600" />
              </Link>
            ))}
          </div>
        </aside>

        <article className="rounded-[28px] border border-slate-200 bg-white p-6 md:p-8">
          <div className="eyebrow">Executive brief</div>
          <h2 className="mt-2 max-w-4xl text-3xl font-black tracking-[-.04em] text-[#07182d]">El mercado se mantiene estable en tamaño, pero la operación de talento sigue bajo presión.</h2>
          <div className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl bg-rose-50 p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-rose-700">Retención</div><div className="mt-2 text-2xl font-black text-rose-950">{peopleData.retention.earlyAttritionUnder3MonthsPct}%</div><p className="mb-0 mt-1 text-xs leading-5 text-rose-900/70">de las bajas conciliadas sucede antes de 3 meses.</p></div>
            <div className="rounded-2xl bg-violet-50 p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-violet-700">Cobertura futura</div><div className="mt-2 text-2xl font-black text-violet-950">{latestMarket.hiringPressurePct}%</div><p className="mb-0 mt-1 text-xs leading-5 text-violet-900/70">del headcount equivale a vacantes próximas.</p></div>
            <div className="rounded-2xl bg-cyan-50 p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-cyan-700">Negociación</div><div className="mt-2 text-2xl font-black text-cyan-950">{laborRelations.collectiveBargaining.granted.salaryOperationalPct.median}%</div><p className="mb-0 mt-1 text-xs leading-5 text-cyan-900/70">mediana de incremento salarial operativo reportado.</p></div>
            <div className="rounded-2xl bg-amber-50 p-4"><div className="text-[10px] font-black uppercase tracking-[.14em] text-amber-700">Candidate fit</div><div className="mt-2 text-2xl font-black text-amber-950">{latestMarket.candidateAcceptancePer10Median}/10</div><p className="mb-0 mt-1 text-xs leading-5 text-amber-900/70">candidatos acreditan requisitos en la mediana de la muestra.</p></div>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="panel p-5 md:p-6">
          <Building2 size={18} className="text-cyan-700" /><div className="eyebrow mt-4">Muestra</div><h3 className="mt-1 text-xl font-black text-[#07182d]">35,128 de headcount</h3><p className="mt-3 text-xs leading-6 text-slate-500">El corte reúne 40 empresas. La serie conserva siete bimestres y una corrección analítica documentada para un outlier histórico.</p><Link href="/contexto" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir muestra <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <BadgeDollarSign size={18} className="text-emerald-700" /><div className="eyebrow mt-4">Compensación</div><h3 className="mt-1 text-xl font-black text-[#07182d]">{formatMoney(latestMarket.salaryBandsDaily.entryMedian)} diarios</h3><p className="mt-3 text-xs leading-6 text-slate-500">Mediana de ingreso operativo. El dataset además permite comparar bandas y posiciones técnicas: {topRole.role} aparece en {topRole.companies} empresas con mediana mensual de {formatMoney(topRole.salaryMarketMedian)}.</p><Link href="/salarios" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir salarios <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <CalendarRange size={18} className="text-violet-700" /><div className="eyebrow mt-4">Negociación colectiva</div><h3 className="mt-1 text-xl font-black text-[#07182d]">23 revisiones pendientes</h3><p className="mt-3 text-xs leading-6 text-slate-500">Abril concentra el mayor número de revisiones reportadas. Vales y fondo de ahorro son los componentes de prestaciones con más ajustes.</p><Link href="/relaciones-laborales" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir negociación <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <TrendingDown size={18} className="text-rose-700" /><div className="eyebrow mt-4">Rotación</div><h3 className="mt-1 text-xl font-black text-[#07182d]">{latestMarket.turnoverBimonthlyPct}% bimestral</h3><p className="mt-3 text-xs leading-6 text-slate-500">La fuga temprana domina el patrón: {peopleData.retention.firstYearExitSharePct}% de bajas conciliadas ocurre antes del primer año.</p><Link href="/retencion" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir retención <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <BriefcaseBusiness size={18} className="text-blue-700" /><div className="eyebrow mt-4">Talent Acquisition</div><h3 className="mt-1 text-xl font-black text-[#07182d]">{latestMarket.timeToFillDays.technical} días técnico</h3><p className="mt-3 text-xs leading-6 text-slate-500">El dataset no solo contiene fuentes: también tiene mezcla porcentual por nivel. LinkedIn aparece entre las fuentes de mayor uso mediano para administrativos y gerenciales.</p><Link href="/talent-acquisition" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir recruiting <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <UsersRound size={18} className="text-fuchsia-700" /><div className="eyebrow mt-4">Workforce Planning</div><h3 className="mt-1 text-xl font-black text-[#07182d]">{formatInt(rewardsData.workforcePlanning.latest.total)} vacantes</h3><p className="mt-3 text-xs leading-6 text-slate-500">El principal hotspot estructurado es {rewardsData.workforcePlanning.hotspots[0].role.toLowerCase()} con {rewardsData.workforcePlanning.hotspots[0].education.toLowerCase()}.</p><Link href="/workforce-planning" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir planning <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <HeartPulse size={18} className="text-amber-700" /><div className="eyebrow mt-4">Beneficios operativos</div><h3 className="mt-1 text-xl font-black text-[#07182d]">{transport.usageMedianPct}% usa transporte</h3><p className="mt-3 text-xs leading-6 text-slate-500">En empresas con dato válido, la mediana es {transport.routesMedian} rutas y {formatMoney(transport.monthlyCostPerPersonMedian)} mensuales por persona.</p><Link href="/beneficios" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Abrir Total Rewards <ArrowRight size={13} /></Link>
        </article>
        <article className="panel p-5 md:p-6">
          <ShieldCheck size={18} className="text-emerald-700" /><div className="eyebrow mt-4">Quality</div><h3 className="mt-1 text-xl font-black text-[#07182d]">{qualitySummary.score}/100</h3><p className="mt-3 text-xs leading-6 text-slate-500">La plataforma separa dato reportado de ajuste analítico y mantiene visibles fallas de conciliación antes de usar una métrica para decisión.</p><Link href="/data-quality" className="mt-5 inline-flex items-center gap-1 text-xs font-black text-cyan-800">Ver Data Health <ArrowRight size={13} /></Link>
        </article>
      </section>
    </DashboardFrame>
  );
}
