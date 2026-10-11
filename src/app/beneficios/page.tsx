import { Gift, HeartHandshake, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { BenefitPrevalenceChart, BenefitUsageChart } from "@/components/workforce-rewards-charts";
import { totalRewardsData } from "@/lib/workforce-rewards-data";

export default function BenefitsPage() {
  const breadth = totalRewardsData.packageBreadth;
  const prevalence = totalRewardsData.benefitPrevalence;
  const sgmm = prevalence.find((item) => item.benefit === "SGMM")!;
  const transportUsage = totalRewardsData.usageMedianPct.find((item) => item.benefit === "Transporte")!;
  const comedorUsage = totalRewardsData.usageMedianPct.find((item) => item.benefit === "Comedor")!;
  const sgmmUsage = totalRewardsData.usageMedianPct.find((item) => item.benefit === "SGMM")!;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Total Rewards · benchmark real"
        title="Beneficios"
        description="Compara amplitud del paquete, prevalencia de prestaciones, generosidad y uso efectivo para distinguir entre ofrecer un beneficio y que realmente genere valor."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Amplitud promedio" value={`${breadth.average} / ${breadth.benefitTypes}`} change={0} changeLabel="beneficios clave por empresa" icon={Sparkles} />
        <KpiCard label="Paquete completo" value={`${breadth.allSixPct}%`} change={0} changeLabel={`${breadth.allSixCompanies} de 40 ofrecen los 6`} icon={Gift} />
        <KpiCard label="Uso de transporte" value={`${transportUsage.median}%`} change={0} changeLabel="mediana entre usuarios válidos" icon={HeartHandshake} />
        <KpiCard label="SGMM disponible" value={`${sgmm.pct}%`} change={0} changeLabel="35 de 40 empresas" icon={ShieldCheck} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Benefit prevalence</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué tan común es cada prestación</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Porcentaje de las 40 empresas que reportan o evidencian disponibilidad del beneficio.</p>
          <BenefitPrevalenceChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Rewards signal</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">El paquete competitivo ya no se distingue solo por “tener” la prestación.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">Vales, fondo de ahorro, SGMM y seguro de vida aparecen en más de 80% de la muestra. La diferenciación real empieza en generosidad, cobertura, facilidad de uso y experiencia del colaborador.</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">92.5%</div><div className="mt-1 text-[10px] uppercase text-slate-400">Vales</div></div>
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">90%</div><div className="mt-1 text-[10px] uppercase text-slate-400">Fondo ahorro</div></div>
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">50%</div><div className="mt-1 text-[10px] uppercase text-slate-400">Ofrecen los 6 clave</div></div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-300">SGMM se marca como inferido cuando la respuesta directa está vacía pero la empresa seleccionó población elegible. Esa inferencia queda visible para mantener trazabilidad.</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Uso efectivo</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Mediana de utilización</h2>
          <BenefitUsageChart />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            {[sgmmUsage, transportUsage, comedorUsage].map((item) => (
              <div key={item.benefit} className="rounded-xl bg-slate-50 p-3"><strong className="block text-base text-slate-900">{item.median}%</strong><span className="text-slate-400">{item.benefit}</span></div>
            ))}
          </div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Generosidad</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Cuánto ofrece el mercado</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-sm font-extrabold text-slate-900">Vales · % mediano</div>
              <div className="mt-4 space-y-3">
                {totalRewardsData.generosity.vouchersPct.map((row) => (
                  <div key={row.population} className="flex items-center justify-between text-xs"><span className="text-slate-500">{row.population}</span><strong className="text-slate-900">{row.median}%</strong></div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-sm font-extrabold text-slate-900">Fondo ahorro · % mediano</div>
              <div className="mt-4 space-y-3">
                {totalRewardsData.generosity.savingsFundPct.map((row) => (
                  <div key={row.population} className="flex items-center justify-between text-xs"><span className="text-slate-500">{row.population}</span><strong className="text-slate-900">{row.median}%</strong></div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-sm font-extrabold text-slate-900">Vacaciones primer año</div>
              <div className="mt-4 space-y-3">
                {totalRewardsData.generosity.firstYearVacationDays.map((row) => (
                  <div key={row.population} className="flex items-center justify-between text-xs"><span className="text-slate-500">{row.population}</span><strong className="text-slate-900">{row.median} días</strong></div>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-slate-100 p-4">
              <div className="text-sm font-extrabold text-slate-900">Aguinaldo</div>
              <div className="mt-4 space-y-3">
                {totalRewardsData.generosity.bonusDays.map((row) => (
                  <div key={row.population} className="flex items-center justify-between text-xs"><span className="text-slate-500">{row.population}</span><strong className="text-slate-900">{row.median} días</strong></div>
                ))}
              </div>
            </div>
          </div>
        </article>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Package breadth</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Distribución de amplitud del paquete</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {breadth.distribution.map((row) => (
            <div key={row.count} className={`rounded-2xl border p-4 text-center ${row.count === 6 ? "border-cyan-200 bg-cyan-50" : "border-slate-100 bg-white"}`}>
              <div className="text-3xl font-black text-slate-950">{row.companies}</div>
              <div className="mt-1 text-xs font-semibold text-slate-400">empresas con {row.count}/6</div>
            </div>
          ))}
        </div>
      </section>
    </DashboardFrame>
  );
}
