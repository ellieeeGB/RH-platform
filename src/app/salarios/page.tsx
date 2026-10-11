import { BadgeDollarSign, ChartNoAxesCombined, Gauge, TrendingUp } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { SalaryBandsChart, SalaryTrendChart } from "@/components/classic-charts";
import { salaryBands } from "@/lib/classic-data";

export default function SalariesPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Compensation Intelligence"
        title="Personal y Salarios"
        description="Conserva las bandas salariales del dashboard original y agrega tendencia, índice de competitividad y lectura frente al mercado."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Salario ingreso" value="$345.16" change={1.2} changeLabel="MXN diarios" icon={BadgeDollarSign} />
        <KpiCard label="Salary index" value="72.2" change={3.2} changeLabel="benchmark = 100" icon={Gauge} />
        <KpiCard label="Amplitud salarial" value="1.62×" change={2.1} changeLabel="máximo / ingreso" icon={TrendingUp} />
        <KpiCard label="Posición mercado" value="P42" change={8} changeLabel="percentiles vs. anterior" icon={ChartNoAxesCombined} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <article className="panel p-5 md:p-6">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="eyebrow">Bandas</div>
              <h2 className="mt-1 text-lg font-extrabold text-slate-950">Rango salarial diario</h2>
            </div>
            <div className="flex gap-2 text-xs font-bold">
              {["Ingreso", "Medio bajo", "Medio alto", "Máximo"].map((item, index) => <button key={item} className={`rounded-full px-3 py-1.5 ${index === 0 ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"}`}>{item}</button>)}
            </div>
          </div>
          <SalaryBandsChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Historia</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Evolución vs. benchmark</h2>
          <SalaryTrendChart />
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {salaryBands.map((row) => (
          <article key={row.band} className="panel p-5">
            <div className="eyebrow">{row.band}</div>
            <div className="mt-2 text-2xl font-black text-slate-950">${row.company.toLocaleString("es-MX")}</div>
            <div className="mt-4 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-700" style={{ width: `${Math.min((row.company / row.benchmark) * 100, 100)}%` }} /></div>
            <div className="mt-2 flex justify-between text-[11px] text-slate-400"><span>Empresa</span><span>Benchmark ${row.benchmark}</span></div>
          </article>
        ))}
      </section>
    </DashboardFrame>
  );
}
