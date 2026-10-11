"use client";

import { Bus, Gift, ShieldCheck, Soup, WalletCards } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { useFilters } from "@/components/filter-context";
import { BenefitPrevalenceChart, BenefitUsageChart } from "@/components/workforce-rewards-charts";
import { getMarketExtendedStats, getMarketSnapshot, getScopeSnapshot } from "@/lib/company-panel";
import { totalRewardsData } from "@/lib/workforce-rewards-data";
import { rewardsEconomics, vendorEcosystem } from "@/lib/extended-intelligence";

const pct = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(1)}%`;
const days = (value: number | null | undefined) => value == null || !Number.isFinite(value) ? "—" : `${value.toFixed(value % 1 ? 1 : 0)} días`;
const yesNo = (value: boolean | null | undefined) => value == null ? "Sin dato" : value ? "Sí" : "No";
const formatMoney = (value: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);

export default function BenefitsPage() {
  const { period, company, companyLabel, isMarket } = useFilters();
  const scope = getScopeSnapshot(company, period);
  const market = getMarketSnapshot(period);
  const marketStats = getMarketExtendedStats(period);

  const comparisonCards = [
    { label: "Vales · operativo", value: pct(scope?.benefits.voucherOperationalPct), market: pct(market.benefits.voucherOperationalPct), icon: Gift },
    { label: "Fondo de ahorro · operativo", value: pct(scope?.benefits.savingsOperationalPct), market: pct(market.benefits.savingsOperationalPct), icon: WalletCards },
    { label: "Vacaciones · 1er año", value: days(scope?.benefits.vacationOperationalYear1), market: days(market.benefits.vacationOperationalYear1), icon: ShieldCheck },
  ];

  const availability = [
    { label: "Seguro de vida", value: scope?.benefits.lifeInsurance, market: marketStats.benefits.lifeInsurance },
    { label: "Transporte", value: scope?.benefits.transport, market: marketStats.benefits.transport },
    { label: "Comedor", value: scope?.benefits.cafeteria, market: marketStats.benefits.cafeteria },
  ];

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Total Rewards"
        title="Beneficios"
        description={isMarket
          ? "Generosidad y disponibilidad de prestaciones para el bimestre seleccionado."
          : `${companyLabel}: prestaciones principales comparadas con la mediana y prevalencia del mercado del mismo periodo.`}
      />

      <section className="grid gap-4 md:grid-cols-3">
        {comparisonCards.map(({ label, value, market: marketValue, icon: Icon }) => (
          <article key={label} className="panel p-5">
            <div className="flex items-center justify-between"><div className="metric-label">{label}</div><Icon size={18} className="text-cyan-700" /></div>
            <div className="mt-3 text-3xl font-black text-[#07182d]">{value}</div>
            <div className="mt-2 text-xs text-slate-500">{isMarket ? "mediana del mercado" : `mediana mercado: ${marketValue}`}</div>
          </article>
        ))}
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Disponibilidad</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Prestaciones operativas clave</h2>
        <p className="mt-2 text-xs leading-5 text-slate-500">{isMarket ? "Porcentaje de empresas con respuesta válida que reportan la prestación." : `${companyLabel} frente a la prevalencia del mercado del mismo bimestre.`}</p>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {availability.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <div className="text-sm font-black text-slate-900">{item.label}</div>
              {isMarket ? (
                <>
                  <div className="mt-3 text-3xl font-black text-[#07182d]">{pct(item.market.pct)}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.market.yes} de {item.market.valid} empresas con dato</div>
                </>
              ) : (
                <>
                  <div className={`mt-3 text-3xl font-black ${item.value === true ? "text-emerald-700" : item.value === false ? "text-slate-500" : "text-slate-400"}`}>{yesNo(item.value)}</div>
                  <div className="mt-1 text-xs text-slate-500">mercado: {pct(item.market.pct)} de empresas con dato</div>
                </>
              )}
            </div>
          ))}
        </div>
      </section>

      {!isMarket && (
        <section className="mt-4 grid gap-4 lg:grid-cols-2">
          <article className="panel p-5 md:p-6">
            <div className="eyebrow">Administrativos</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Generosidad por población</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Vales</span><strong>{pct(scope?.benefits.voucherAdministrativePct)}</strong></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Fondo de ahorro</span><strong>{pct(scope?.benefits.savingsAdministrativePct)}</strong></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Vacaciones 1er año</span><strong>{days(scope?.benefits.vacationAdministrativeYear1)}</strong></div>
            </div>
          </article>
          <article className="panel p-5 md:p-6">
            <div className="eyebrow">Gerenciales</div>
            <h2 className="mt-1 text-lg font-extrabold text-slate-950">Prestaciones monetarias</h2>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Vales</span><strong>{pct(scope?.benefits.voucherManagerialPct)}</strong></div>
              <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"><span className="text-slate-600">Fondo de ahorro</span><strong>{pct(scope?.benefits.savingsManagerialPct)}</strong></div>
            </div>
          </article>
        </section>
      )}

      <section className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><div className="eyebrow">Referencia de mercado</div><h2 className="mt-1 text-lg font-extrabold text-slate-950">Uso y amplitud · Jul–Ago 25</h2></div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-black uppercase tracking-wide text-slate-500">Último corte agregado</span>
        </div>
        <p className="mt-2 max-w-3xl text-xs leading-5 text-slate-500">Estas visualizaciones profundizan en la composición del último mercado disponible. Los indicadores superiores sí cambian con la empresa y bimestre seleccionados.</p>
        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-extrabold text-slate-900">Prevalencia de beneficios</div><BenefitPrevalenceChart /></div>
          <div className="rounded-2xl bg-slate-50 p-4"><div className="text-sm font-extrabold text-slate-900">Utilización reportada</div><BenefitUsageChart /></div>
        </div>
      </section>

      <section className="mt-4">
        <div className="mb-4"><div className="eyebrow">Economía de beneficios · mercado</div><h2 className="mt-1 text-xl font-black text-[#07182d]">Costo y uso del último corte</h2></div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="rounded-[26px] bg-[#0a2141] p-5 text-white"><Bus size={18} className="text-cyan-300" /><div className="mt-5 text-3xl font-black">{formatMoney(rewardsEconomics.transport.monthlyCostPerPersonMedian)}</div><div className="mt-1 text-sm font-black">transporte / persona / mes</div><div className="mt-3 text-xs text-slate-400">{rewardsEconomics.transport.routesMedian} rutas medianas · {rewardsEconomics.transport.usageMedianPct}% de uso</div></article>
          <article className="rounded-[26px] bg-[#ffdf6e] p-5 text-[#07182d]"><Soup size={18} /><div className="mt-5 text-3xl font-black">{formatMoney(rewardsEconomics.cafeteria.mealTotalMedian)}</div><div className="mt-1 text-sm font-black">costo mediano del platillo</div><div className="mt-3 text-xs text-slate-700">empresa {formatMoney(rewardsEconomics.cafeteria.companyShareMedian)} · empleado {formatMoney(rewardsEconomics.cafeteria.employeeShareMedian)}</div></article>
          <article className="rounded-[26px] bg-[#705df8] p-5 text-white"><WalletCards size={18} /><div className="mt-5 text-3xl font-black">{formatMoney(rewardsEconomics.gasoline.monthlyBudgetMedian)}</div><div className="mt-1 text-sm font-black">presupuesto mensual de gasolina</div><div className="mt-3 text-xs text-violet-100">28 empresas lo ofrecen · {rewardsEconomics.gasoline.usageMedianPct}% uso mediano</div></article>
        </div>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Servicios tercerizados · mercado</div>
        <h2 className="mt-1 text-lg font-extrabold text-slate-950">Adopción y evaluación de proveedores</h2>
        <div className="mt-5 grid gap-3 lg:grid-cols-5">
          {vendorEcosystem.outsourcingAdoption.map((item) => (
            <div key={item.service} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="text-xs font-black text-slate-900">{item.service}</div>
              <div className="mt-3 text-2xl font-black text-[#07182d]">{item.pct}%</div>
              <div className="mt-1 text-[10px] text-slate-400">{item.companies} empresas · rating {item.medianRating}/10</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-4 panel p-5 md:p-6">
        <div className="eyebrow">Amplitud del paquete · Jul–Ago 25</div>
        <div className="mt-5 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {totalRewardsData.packageBreadth.distribution.map((row) => (
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
