import { BadgeDollarSign, ChartNoAxesCombined, Gauge, TrendingUp } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { SalaryDistributionChart, SalaryEntryTrendChart } from "@/components/people-intelligence-charts";
import { compensationBandCards, compensationData } from "@/lib/people-intelligence-data";

const mxn = (value: number) => new Intl.NumberFormat("es-MX", {
  style: "currency",
  currency: "MXN",
  maximumFractionDigits: 2,
}).format(value);

export default function SalariesPage() {
  const entry = compensationData.bands[0];
  const maximum = compensationData.bands[3];
  const annualEntryGrowth = ((compensationData.entryMedianTrend.at(-1)!.value / compensationData.entryMedianTrend[0].value) - 1) * 100;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Compensation Intelligence · benchmark real"
        title="Personal y Salarios"
        description="Conserva las bandas salariales del dashboard original, pero las convierte en distribuciones de mercado con cuartiles, progresión salarial y tendencia histórica."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Ingreso mediano" value={mxn(entry.median)} change={Number(annualEntryGrowth.toFixed(1))} changeLabel="vs. Jul–Ago 2024" icon={BadgeDollarSign} />
        <KpiCard label="Q1–Q3 ingreso" value={`${mxn(entry.q1)}–${mxn(entry.q3)}`} change={0} changeLabel="50% central de la muestra" icon={Gauge} />
        <KpiCard label="Progresión salarial" value={`${compensationData.salaryProgressionRatio.toFixed(2)}×`} change={0} changeLabel="máximo mediano / ingreso" icon={TrendingUp} />
        <KpiCard label="Máximo mediano" value={mxn(maximum.median)} change={compensationData.highToMaxPct} changeLabel="salto desde intermedio alto" icon={ChartNoAxesCombined} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Mercado</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Distribución de bandas salariales</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Q1, mediana y Q3 de salario diario operativo para 40 compañías. Esto permite ver dispersión y no solo un único promedio.</p>
          <SalaryDistributionChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Historia</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Mediana del salario de ingreso</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">El mercado pasó de {mxn(compensationData.entryMedianTrend[0].value)} a {mxn(compensationData.entryMedianTrend.at(-1)!.value)} diarios durante la ventana histórica.</p>
          <SalaryEntryTrendChart />
        </article>
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {compensationBandCards.map((row) => (
          <article key={row.band} className="panel p-5">
            <div className="eyebrow">{row.band}</div>
            <div className="mt-2 text-2xl font-black text-slate-950">{mxn(row.median)}</div>
            <div className="mt-1 text-xs font-semibold text-slate-400">mediana diaria · n={row.n}</div>
            <div className="mt-5 grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-[10px] uppercase tracking-wide text-slate-400">Q1</span><strong className="mt-1 block text-slate-800">{mxn(row.q1)}</strong></div>
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-[10px] uppercase tracking-wide text-slate-400">Q3</span><strong className="mt-1 block text-slate-800">{mxn(row.q3)}</strong></div>
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-[10px] uppercase tracking-wide text-slate-400">Mínimo</span><strong className="mt-1 block text-slate-800">{mxn(row.min)}</strong></div>
              <div className="rounded-xl bg-slate-50 p-3"><span className="block text-[10px] uppercase tracking-wide text-slate-400">Máximo</span><strong className="mt-1 block text-slate-800">{mxn(row.max)}</strong></div>
            </div>
          </article>
        ))}
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Salary architecture</div>
          <h2 className="mt-4 text-2xl font-black">La progresión importa tanto como el salario de entrada.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">La mediana pasa de {mxn(entry.median)} al ingreso a {mxn(maximum.median)} en la banda máxima. El salto más grande está entre intermedio alto y máximo: {compensationData.highToMaxPct}%.</p>
          <div className="mt-6 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between rounded-xl bg-white/5 p-3"><span>Ingreso → intermedio bajo</span><strong>{compensationData.entryToLowPct}%</strong></div>
            <div className="flex justify-between rounded-xl bg-white/5 p-3"><span>Intermedio bajo → alto</span><strong>{compensationData.lowToHighPct}%</strong></div>
            <div className="flex justify-between rounded-xl bg-white/5 p-3"><span>Intermedio alto → máximo</span><strong>{compensationData.highToMaxPct}%</strong></div>
          </div>
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Siguiente capa privada</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Overlay de la empresa contra el mercado</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Cuando el usuario autenticado seleccione su compañía, esta misma distribución mostrará su salario como marcador sobre Q1–mediana–Q3, calculará percentil aproximado y brecha contra mercado. Esa fila empresa-periodo no se publica en este repositorio.</p>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {["Percentil salarial", "Brecha vs. mediana", "Compresión interna"].map((item) => (
              <div key={item} className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs font-bold text-slate-400">{item}<br/><span className="mt-1 inline-block text-[10px] font-medium">requiere sesión empresa</span></div>
            ))}
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
