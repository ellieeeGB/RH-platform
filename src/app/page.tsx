"use client";

import Link from "next/link";
import {
  ArrowRight,
  BadgeDollarSign,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  TrendingDown,
  TrendingUp,
  UserMinus,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { DashboardFrame } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import {
  deriveScopeMetrics,
  getMarketSalaryPercentile,
  getMarketSnapshot,
  getPreviousPeriod,
  getScopeSnapshot,
} from "@/lib/company-panel";

const int = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);
const money = (value: number | null | undefined) => value == null ? "—" : new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
const pct = (value: number | null | undefined, digits = 1) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(digits)}%`;
const deltaPct = (current: number | null | undefined, previous: number | null | undefined) => current != null && previous != null && previous !== 0 ? ((current / previous) - 1) * 100 : null;

export default function Home() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const previousPeriod = getPreviousPeriod(period);
  const previousScope = previousPeriod ? getScopeSnapshot(company, previousPeriod) : null;
  const metrics = deriveScopeMetrics(scope);
  const previousMetrics = deriveScopeMetrics(previousScope);

  const hcChange = deltaPct(scope?.headcount.total, previousScope?.headcount.total);
  const hiresChange = deltaPct(scope?.hires, previousScope?.hires);
  const exitsChange = deltaPct(scope?.exits, previousScope?.exits);
  const salaryGap = !isMarket && scope?.salaryDaily.entry != null && market.salaryDaily.entry != null
    ? ((scope.salaryDaily.entry / market.salaryDaily.entry) - 1) * 100
    : deltaPct(scope?.salaryDaily.entry, previousScope?.salaryDaily.entry);
  const technicalGap = !isMarket && scope?.timeToFill.technical != null && market.timeToFill.technical != null
    ? scope.timeToFill.technical - market.timeToFill.technical
    : scope?.timeToFill.technical != null && previousScope?.timeToFill.technical != null
      ? scope.timeToFill.technical - previousScope.timeToFill.technical
      : null;
  const salaryPercentile = !isMarket ? getMarketSalaryPercentile(scope?.salaryDaily.entry ?? null, period) : null;

  const primarySignal = metrics.netMovement == null
    ? "No hay datos suficientes de altas y bajas para este corte."
    : metrics.netMovement >= 0
      ? `La plantilla tuvo un balance neto de +${int(metrics.netMovement)} personas.`
      : `La plantilla cerró con un balance neto de ${int(metrics.netMovement)} personas.`;

  const cards = [
    {
      label: "Headcount",
      value: int(scope?.headcount.total),
      note: hcChange == null ? "sin comparación anterior" : `${hcChange >= 0 ? "+" : ""}${hcChange.toFixed(1)}% vs. corte anterior`,
      icon: UsersRound,
    },
    {
      label: "Contrataciones",
      value: int(scope?.hires),
      note: hiresChange == null ? "dato del periodo" : `${hiresChange >= 0 ? "+" : ""}${hiresChange.toFixed(1)}% vs. corte anterior`,
      icon: UserPlus,
    },
    {
      label: "Bajas",
      value: int(scope?.exits),
      note: exitsChange == null ? "dato del periodo" : `${exitsChange >= 0 ? "+" : ""}${exitsChange.toFixed(1)}% vs. corte anterior`,
      icon: UserMinus,
    },
    {
      label: "Vacantes próximas",
      value: int(scope?.vacancies.total),
      note: metrics.hiringPressurePct == null ? "sin base suficiente" : `${pct(metrics.hiringPressurePct)} del headcount`,
      icon: BriefcaseBusiness,
    },
  ];

  return (
    <DashboardFrame>
      <div className="-mx-5 -mt-5 overflow-hidden md:-mx-7 md:-mt-7 xl:-mx-8 xl:-mt-8">
        <section className="relative min-h-[680px] overflow-hidden bg-[#061529] px-6 py-14 text-white md:px-10 xl:px-14 xl:py-20">
          <div className="absolute inset-0 opacity-40 [background:radial-gradient(circle_at_78%_18%,rgba(34,211,238,.25),transparent_28%),radial-gradient(circle_at_22%_85%,rgba(112,93,248,.22),transparent_28%)]" />
          <div className="relative mx-auto grid max-w-[1660px] gap-12 xl:grid-cols-[.88fr_1.12fr] xl:items-center">
            <div className="z-10 max-w-3xl">
              <div className="flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-[.18em] text-cyan-300">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5"><CalendarDays size={12} /> {period}</span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.05] px-3 py-1.5"><Building2 size={12} /> {companyLabel}</span>
              </div>
              <h1 className="mt-7 max-w-4xl text-[3.3rem] font-black leading-[.9] tracking-[-.07em] sm:text-[4.2rem] xl:text-[5.7rem]">
                Panorama laboral
                <span className="block text-cyan-300">del bimestre.</span>
              </h1>
              <p className="mt-7 max-w-2xl text-base leading-7 text-slate-300 md:text-lg">
                {isMarket
                  ? "Una lectura ejecutiva de plantilla, contratación, rotación, compensación y demanda futura en las 40 empresas participantes."
                  : `${companyLabel} comparada con el mercado para identificar brechas, presión de talento y cambios relevantes del periodo.`}
              </p>
              <div className="mt-9 rounded-[28px] border border-white/10 bg-white/[.06] p-5 backdrop-blur-xl md:max-w-xl md:p-6">
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Señal principal</div>
                <div className="mt-2 text-2xl font-black leading-tight">{primarySignal}</div>
                <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-300">
                  <span>Movimiento de talento: <strong className="text-white">{pct(metrics.movementLoadPct)}</strong></span>
                  <span>·</span>
                  <span>Presión de contratación: <strong className="text-white">{pct(metrics.hiringPressurePct)}</strong></span>
                </div>
              </div>
            </div>

            <div className="relative min-h-[520px] md:min-h-[590px]">
              <div className="absolute left-[2%] top-[4%] h-[78%] w-[69%] overflow-hidden rounded-[42px] shadow-[0_45px_120px_rgba(0,0,0,.4)] ring-1 ring-white/10">
                <img src="https://images.unsplash.com/photo-1565793298595-6a879b1d9492?auto=format&fit=crop&w=1400&q=88" alt="Operación industrial" className="kenburns h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#061529]/95 via-[#061529]/15 to-transparent" />
                <div className="absolute bottom-8 left-7 right-7">
                  <div className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Cobertura de talento técnico</div>
                  <div className="mt-2 text-4xl font-black">{scope?.timeToFill.technical ?? "—"} <span className="text-lg text-slate-300">días</span></div>
                  <div className="mt-2 text-xs text-slate-300">
                    {technicalGap == null ? "Sin comparación disponible" : isMarket ? `${technicalGap >= 0 ? "+" : ""}${technicalGap.toFixed(0)} días vs. bimestre anterior` : `${technicalGap >= 0 ? "+" : ""}${technicalGap.toFixed(0)} días vs. mercado`}
                  </div>
                </div>
              </div>
              <div className="absolute right-[1%] top-[17%] h-[43%] w-[40%] rotate-[3deg] overflow-hidden rounded-[32px] border-[6px] border-[#061529] shadow-2xl">
                <img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=88" alt="Equipo de trabajo" className="h-full w-full object-cover" />
              </div>
              <div className="absolute bottom-[7%] right-[2%] w-[48%] rounded-[28px] border border-white/15 bg-[#16283f]/90 p-5 shadow-2xl backdrop-blur-2xl">
                <div className="text-[9px] font-black uppercase tracking-[.2em] text-cyan-200">Salario diario de ingreso</div>
                <div className="mt-2 text-4xl font-black">{money(scope?.salaryDaily.entry)}</div>
                <div className="mt-2 text-xs text-slate-300">
                  {isMarket
                    ? salaryGap == null ? "Sin comparación anterior" : `${salaryGap >= 0 ? "+" : ""}${salaryGap.toFixed(1)}% vs. corte anterior`
                    : salaryGap == null ? "Sin benchmark disponible" : `${salaryGap >= 0 ? "+" : ""}${salaryGap.toFixed(1)}% vs. mediana de mercado`}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f4f6f9] px-6 py-12 md:px-10 xl:px-14 xl:py-16">
          <div className="mx-auto max-w-[1660px]">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {cards.map(({ label, value, note, icon: Icon }) => (
                <article key={label} className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_16px_42px_rgba(15,35,65,.05)] md:p-6">
                  <div className="flex items-start justify-between">
                    <div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{label}</div>
                    <Icon size={18} className="text-cyan-700" />
                  </div>
                  <div className="mt-4 text-4xl font-black tracking-[-.05em] text-[#07182d]">{value}</div>
                  <div className="mt-2 text-xs font-semibold text-slate-500">{note}</div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white px-6 py-20 md:px-10 xl:px-14 xl:py-24">
          <div className="mx-auto max-w-[1660px]">
            <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[.22em] text-cyan-700">Lo importante de este corte</div>
                <h2 className="mt-3 max-w-4xl text-4xl font-black tracking-[-.055em] text-[#07182d] md:text-6xl">Tres lecturas para orientar la conversación de RH.</h2>
              </div>
              <Link href="/reportes" className="inline-flex items-center gap-2 text-xs font-black text-cyan-800">Abrir reporte bimestral <ArrowRight size={14} /></Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              <article className="relative min-h-[370px] overflow-hidden rounded-[34px] bg-[#07182d] p-7 text-white md:p-8">
                <TrendingUp className="absolute right-7 top-7 text-cyan-300" />
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-cyan-300">Movimiento de plantilla</div>
                <div className="mt-16 text-[4.8rem] font-black leading-none tracking-[-.08em]">{pct(metrics.movementLoadPct)}</div>
                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-300">Altas y bajas combinadas respecto al headcount. Ayuda a detectar mucha actividad interna aunque el tamaño de la plantilla cambie poco.</p>
                <Link href="/retencion" className="mt-8 inline-flex items-center gap-2 text-xs font-black text-white">Ver rotación <ArrowRight size={14} /></Link>
              </article>

              <article className="relative min-h-[370px] overflow-hidden rounded-[34px] bg-[#ffdf6e] p-7 text-[#07182d] md:p-8">
                <BriefcaseBusiness className="absolute right-7 top-7" />
                <div className="text-[10px] font-black uppercase tracking-[.2em] opacity-60">Demanda futura</div>
                <div className="mt-16 text-[4.8rem] font-black leading-none tracking-[-.08em]">{pct(metrics.hiringPressurePct)}</div>
                <p className="mt-5 max-w-sm text-sm leading-6 text-slate-700">Vacantes próximas como proporción de la plantilla. Entre más alto el indicador, mayor capacidad de reclutamiento será necesaria.</p>
                <Link href="/talent-acquisition" className="mt-8 inline-flex items-center gap-2 text-xs font-black">Ver reclutamiento <ArrowRight size={14} /></Link>
              </article>

              <article className="relative min-h-[370px] overflow-hidden rounded-[34px] bg-[#705df8] p-7 text-white md:p-8">
                <BadgeDollarSign className="absolute right-7 top-7" />
                <div className="text-[10px] font-black uppercase tracking-[.2em] text-violet-100">Posición salarial</div>
                <div className="mt-16 text-[4.8rem] font-black leading-none tracking-[-.08em]">{isMarket ? money(scope?.salaryDaily.entry) : salaryPercentile == null ? "—" : `P${salaryPercentile}`}</div>
                <p className="mt-5 max-w-sm text-sm leading-6 text-violet-100">
                  {isMarket ? "Mediana diaria de ingreso del mercado para el periodo seleccionado." : salaryPercentile == null ? "No hay salario de ingreso suficiente para estimar la posición." : `El salario de ingreso de ${companyLabel} se ubica aproximadamente en el percentil ${salaryPercentile} de la muestra.`}
                </p>
                <Link href="/salarios" className="mt-8 inline-flex items-center gap-2 text-xs font-black text-white">Ver salarios <ArrowRight size={14} /></Link>
              </article>
            </div>
          </div>
        </section>

        {!isMarket && (
          <section className="bg-[#f4f6f9] px-6 py-20 md:px-10 xl:px-14 xl:py-24">
            <div className="mx-auto max-w-[1660px]">
              <div className="grid gap-10 xl:grid-cols-[.72fr_1.28fr] xl:items-center">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[.22em] text-violet-600">{companyLabel} vs. mercado</div>
                  <h2 className="mt-3 text-4xl font-black tracking-[-.055em] text-[#07182d] md:text-6xl">Tu posición, sin perder el contexto.</h2>
                  <p className="mt-5 max-w-xl text-sm leading-7 text-slate-500">El código de empresa mantiene la confidencialidad del estudio y permite comparar el resultado propio con las medianas del mercado.</p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {[
                    ["Salario de ingreso", money(scope?.salaryDaily.entry), money(market.salaryDaily.entry), salaryGap == null ? "—" : `${salaryGap >= 0 ? "+" : ""}${salaryGap.toFixed(1)}%`],
                    ["TTF técnico", scope?.timeToFill.technical == null ? "—" : `${scope.timeToFill.technical} días`, market.timeToFill.technical == null ? "—" : `${market.timeToFill.technical} días`, technicalGap == null ? "—" : `${technicalGap >= 0 ? "+" : ""}${technicalGap.toFixed(0)} días`],
                    ["Candidatos adecuados", scope?.acceptedPer10 == null ? "—" : `${scope.acceptedPer10}/10`, market.acceptedPer10 == null ? "—" : `${market.acceptedPer10}/10`, ""],
                    ["Vacantes próximas", int(scope?.vacancies.total), int(market.vacancies.total), pct(metrics.hiringPressurePct)],
                  ].map(([label, own, benchmark, difference]) => (
                    <article key={label} className="rounded-[26px] border border-slate-200 bg-white p-5">
                      <div className="text-[10px] font-black uppercase tracking-[.16em] text-slate-400">{label}</div>
                      <div className="mt-4 flex items-end justify-between gap-4">
                        <div><div className="text-[10px] text-slate-400">{companyLabel}</div><div className="text-2xl font-black text-[#07182d]">{own}</div></div>
                        <div className="text-right"><div className="text-[10px] text-slate-400">Mercado</div><div className="text-lg font-black text-slate-600">{benchmark}</div></div>
                      </div>
                      {difference && <div className="mt-3 text-xs font-black text-cyan-700">{difference}</div>}
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        <section className="bg-white px-6 py-20 md:px-10 xl:px-14 xl:py-24">
          <div className="mx-auto max-w-[1660px]">
            <div className="mb-9">
              <div className="text-[10px] font-black uppercase tracking-[.2em] text-slate-400">Explorar</div>
              <h2 className="mt-2 text-3xl font-black tracking-[-.045em] text-[#07182d] md:text-5xl">Profundiza donde necesitas decidir.</h2>
            </div>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                ["Compensación", "Bandas, percentiles y posición contra mercado.", "/salarios", BadgeDollarSign],
                ["Reclutamiento", "Tiempo de cobertura, candidatos y vacantes.", "/talent-acquisition", BriefcaseBusiness],
                ["Rotación", "Bajas, antigüedad y causas de salida.", "/retencion", TrendingDown],
                ["Plantilla", "Demanda futura y planeación de capacidad.", "/workforce-planning", UsersRound],
              ].map(([title, text, href, Icon]) => (
                <Link key={String(title)} href={String(href)} className="group rounded-[28px] border border-slate-200 bg-[#f8fafc] p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl">
                  <Icon size={20} className="text-cyan-700" />
                  <h3 className="mt-8 text-xl font-black text-[#07182d]">{String(title)}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-500">{String(text)}</p>
                  <div className="mt-6 inline-flex items-center gap-2 text-xs font-black text-cyan-800">Abrir <ArrowRight size={14} /></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </DashboardFrame>
  );
}
