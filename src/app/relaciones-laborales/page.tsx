import { AlertTriangle, CalendarRange, Gavel, Handshake, ShieldCheck, UsersRound } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { laborRelations } from "@/lib/extended-intelligence";

const maxMonth = Math.max(...laborRelations.collectiveBargaining.reviewMonths.map((item) => item.companies));
const totalLegalCases = laborRelations.legalExposure.reduce((sum, item) => sum + item.cases, 0);

export default function LaborRelationsPage() {
  const granted = laborRelations.collectiveBargaining.granted;
  const planned = laborRelations.collectiveBargaining.planned;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="People Intelligence · Relaciones Laborales"
        title="Negociación colectiva y clima sindical"
        description="Convierte el bloque sindical del estudio en una lectura ejecutiva: cobertura sindical, relación, calendario de revisiones, incrementos, prestaciones negociadas y exposición conciliatoria."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[26px] bg-[#07182d] p-5 text-white">
          <UsersRound size={18} className="text-cyan-300" />
          <div className="mt-5 text-4xl font-black tracking-[-.06em]">{laborRelations.unionization.pct}%</div>
          <div className="mt-1 text-sm font-black">empresas sindicalizadas</div>
          <div className="mt-2 text-xs text-slate-400">{laborRelations.unionization.yes} de 40 en el corte actual</div>
        </article>
        <article className="panel p-5">
          <Handshake size={18} className="text-emerald-600" />
          <div className="mt-5 text-4xl font-black tracking-[-.06em] text-[#07182d]">{laborRelations.relationship[0].companies}</div>
          <div className="mt-1 text-sm font-black text-slate-900">relación excelente</div>
          <div className="mt-2 text-xs text-slate-400">+ {laborRelations.relationship[1].companies} la califican como buena</div>
        </article>
        <article className="panel p-5">
          <CalendarRange size={18} className="text-violet-600" />
          <div className="mt-5 text-4xl font-black tracking-[-.06em] text-[#07182d]">{laborRelations.collectiveBargaining.status[0].companies}</div>
          <div className="mt-1 text-sm font-black text-slate-900">revisiones pendientes</div>
          <div className="mt-2 text-xs text-slate-400">la fecha de negociación aún no llega</div>
        </article>
        <article className="panel p-5">
          <Gavel size={18} className="text-amber-600" />
          <div className="mt-5 text-4xl font-black tracking-[-.06em] text-[#07182d]">{totalLegalCases}</div>
          <div className="mt-1 text-sm font-black text-slate-900">casos reportados</div>
          <div className="mt-2 text-xs text-slate-400">conciliación + tribunales; no son empresas únicas</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Collective bargaining</div>
          <h2 className="mt-1 text-xl font-black text-[#07182d]">Incrementos otorgados vs. intención futura</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Medianas de respuestas válidas. Se muestra n porque algunos componentes de prestaciones tienen menor cobertura.</p>
          <div className="mt-6 space-y-5">
            {[
              ["Salario operativo", granted.salaryOperationalPct.median, planned.salaryOperationalPct.median, granted.salaryOperationalPct.n],
              ["Salario administrativo", granted.salaryAdministrativePct.median, null, granted.salaryAdministrativePct.n],
              ["Prestaciones operativas", granted.benefitsOperationalPct.median, planned.benefitsOperationalPct.median, granted.benefitsOperationalPct.n],
              ["Prestaciones administrativas", granted.benefitsAdministrativePct.median, null, granted.benefitsAdministrativePct.n],
            ].map(([label, current, future, n]) => (
              <div key={String(label)}>
                <div className="mb-2 flex items-end justify-between gap-4">
                  <div><div className="text-sm font-black text-slate-900">{label}</div><div className="text-[10px] font-bold text-slate-400">n={n}</div></div>
                  <div className="flex items-center gap-4 text-right"><div><span className="text-2xl font-black text-[#07182d]">{current}%</span><div className="text-[9px] uppercase text-slate-400">otorgado</div></div>{future !== null && <div><span className="text-2xl font-black text-violet-600">{future}%</span><div className="text-[9px] uppercase text-slate-400">planeado</div></div>}</div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500" style={{ width: `${Math.min(Number(current) * 10, 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </article>

        <article className="overflow-hidden rounded-[28px] bg-[#0a2141] p-6 text-white md:p-7">
          <div className="eyebrow !text-cyan-300">Negotiation calendar</div>
          <h2 className="mt-2 text-xl font-black">Cuándo se concentra la revisión</h2>
          <div className="mt-6 space-y-3">
            {laborRelations.collectiveBargaining.reviewMonths.map((item) => (
              <div key={item.month} className="grid grid-cols-[70px_1fr_32px] items-center gap-3">
                <div className="text-xs font-bold text-slate-300">{item.month}</div>
                <div className="h-7 overflow-hidden rounded-full bg-white/[.06]"><div className="h-full rounded-full bg-cyan-300/85" style={{ width: `${(item.companies / maxMonth) * 100}%` }} /></div>
                <div className="text-right text-xs font-black">{item.companies}</div>
              </div>
            ))}
          </div>
          <div className="mt-7 rounded-2xl border border-white/10 bg-white/[.05] p-4 text-xs leading-5 text-slate-300">Abril concentra la mayor cantidad de revisiones reportadas. Para una empresa cliente, esta vista puede convertirse en un calendario anticipado de presión salarial y preparación de CCT.</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Prestaciones negociadas</div>
          <h2 className="mt-1 text-lg font-black text-[#07182d]">Qué componentes se están moviendo</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {laborRelations.collectiveBargaining.benefitsAdjusted.map((item, index) => (
              <div key={item.benefit} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <div className="text-[10px] font-black uppercase tracking-[.14em] text-slate-400">0{index + 1}</div>
                <div className="mt-2 text-sm font-black text-slate-900">{item.benefit}</div>
                <div className="mt-2 text-2xl font-black text-cyan-700">{item.companies}</div>
                <div className="text-[10px] text-slate-400">empresas reportan incremento</div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Continuidad y riesgo</div>
          <h2 className="mt-1 text-lg font-black text-[#07182d]">Preparación ante eventos laborales y operativos</h2>
          <div className="mt-5 space-y-3">
            {laborRelations.contingencyPlans.map((item) => (
              <div key={item.plan} className="flex items-center gap-3">
                <div className="w-36 shrink-0 text-xs font-bold text-slate-600">{item.plan}</div>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#0b82b9]" style={{ width: `${item.pct}%` }} /></div>
                <div className="w-12 text-right text-xs font-black text-slate-700">{item.pct}%</div>
              </div>
            ))}
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {laborRelations.legalExposure.map((item) => (
              <div key={item.channel} className="rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <AlertTriangle size={15} className="text-amber-600" />
                <div className="mt-3 text-2xl font-black text-amber-950">{item.cases}</div>
                <div className="mt-1 text-[10px] leading-4 text-amber-900/70">{item.channel}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-start gap-2 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-600"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-emerald-600" />Esta pantalla es analítica, no una conclusión legal. Casos y planes deben interpretarse con contexto de tamaño, actividad y periodo.</div>
        </article>
      </section>
    </DashboardFrame>
  );
}
