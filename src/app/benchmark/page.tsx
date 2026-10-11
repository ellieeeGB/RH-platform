import { Building2, LockKeyhole, Scale, ShieldCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { BenchmarkSalaryRangeChart } from "@/components/risk-benchmark-charts";
import { benchmarkPrivacy, benchmarkReference, marketPulse } from "@/lib/risk-benchmark-data";

function formatValue(value: number, format: string) {
  if (format === "currency") return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 2 }).format(value);
  if (format === "percent") return `${value.toFixed(1)}%`;
  if (format === "days") return `${value} días`;
  if (format === "score6") return `${value.toFixed(2)} / 6`;
  if (format === "hours") return `${value.toFixed(2)} h`;
  return value.toLocaleString("es-MX");
}

export default function BenchmarkStudioPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="People Intelligence · Benchmark Studio"
        title="Benchmark Studio"
        description="Compara métricas contra referencias agregadas del mercado sin revelar a las compañías participantes. Los filtros futuros respetarán un mínimo de cinco empresas por cohorte."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Empresas en muestra" value={String(marketPulse.companyCount)} change={0} changeLabel="cohorte completa" icon={Building2} />
        <KpiCard label="Privacidad mínima" value={`k ≥ ${benchmarkPrivacy.minimumCohortSize}`} change={0} changeLabel="empresas por benchmark" icon={LockKeyhole} />
        <KpiCard label="Salario ingreso mediano" value={formatValue(marketPulse.salaryEntryMedian, "currency")} change={0} changeLabel={`Q1 ${formatValue(marketPulse.salaryEntryQ1, "currency")}`} icon={Scale} />
        <KpiCard label="Headcount mercado" value={marketPulse.headcount.toLocaleString("es-MX")} change={marketPulse.headcountChangePct} changeLabel="vs. bimestre anterior" icon={ShieldCheck} />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[.8fr_1.2fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Cohort Builder</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Define contra quién comparar</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">La UI ya define la política que usará el backend privado: cualquier combinación que deje menos de cinco compañías se bloquea.</p>
          <div className="mt-5 space-y-4">
            {[
              ["Tamaño", ["Todas", "Pequeña", "Mediana", "Grande"]],
              ["Relación laboral", ["Todas", "Sindicalizada", "No sindicalizada"]],
              ["Personal", ["Todos", "Operativo", "Administrativo"]],
              ["Periodo", [marketPulse.currentPeriod, "Últimos 3", "Histórico"]],
            ].map(([label, options]) => (
              <div key={String(label)}>
                <div className="mb-2 text-[11px] font-black uppercase tracking-wide text-slate-400">{String(label)}</div>
                <div className="flex flex-wrap gap-2">
                  {(options as string[]).map((option, index) => <button key={option} className={`rounded-xl border px-3 py-2 text-xs font-bold ${index === 0 ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-white text-slate-500"}`}>{option}</button>)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-2xl border border-cyan-100 bg-cyan-50 p-4 text-xs leading-5 text-cyan-900"><strong>Privacy Guard activo.</strong> {benchmarkPrivacy.policy}</div>
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Compensation reference</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Q1 · Mediana · Q3 salarial</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">En una sesión autenticada, la posición de la empresa aparecerá como marcador sobre esta distribución agregada.</p>
          <BenchmarkSalaryRangeChart />
        </article>
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="eyebrow">Market reference</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Métricas comparables de la cohorte completa</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-6 py-3">Dominio</th><th className="px-6 py-3">Métrica</th><th className="px-6 py-3">Referencia</th><th className="px-6 py-3">Contexto</th><th className="px-6 py-3">Comparación privada</th></tr>
            </thead>
            <tbody>
              {benchmarkReference.map((row) => (
                <tr key={row.metric} className="border-t border-slate-100">
                  <td className="px-6 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{row.category}</span></td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{row.metric}</td>
                  <td className="px-6 py-3 font-black text-slate-950">{formatValue(row.current, row.format)}</td>
                  <td className="px-6 py-3 text-xs text-slate-500">{row.context}</td>
                  <td className="px-6 py-3 text-xs font-bold text-cyan-700">Disponible con sesión empresa →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_.8fr]">
        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Benchmark principle</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">Un benchmark útil compara pares; un benchmark seguro no revela quiénes son.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">La siguiente capa del producto calculará percentiles y brechas por empresa usando datos privados, pero solo devolverá estadísticas agregadas cuando el grupo de comparación cumpla el umbral de confidencialidad.</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">{marketPulse.companyCount}</div><div className="mt-1 text-[10px] uppercase text-slate-400">mercado completo</div></div>
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">k≥{benchmarkPrivacy.minimumCohortSize}</div><div className="mt-1 text-[10px] uppercase text-slate-400">mínimo cohorte</div></div>
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">Q1–Q3</div><div className="mt-1 text-[10px] uppercase text-slate-400">contexto, no ranking crudo</div></div>
          </div>
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Market pulse</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Lectura rápida del corte</h2>
          <div className="mt-5 space-y-3">
            <div className="flex justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Rotación</span><strong>{marketPulse.turnover.toFixed(1)}%</strong></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">TTF técnico</span><strong>{marketPulse.technicalTimeToFill} días</strong></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Hiring pressure</span><strong>{marketPulse.hiringPressure.toFixed(2)}%</strong></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Amplitud rewards</span><strong>{marketPulse.benefitBreadth.toFixed(2)} / 6</strong></div>
            <div className="flex justify-between rounded-2xl bg-slate-50 p-4 text-sm"><span className="text-slate-500">Contrataciones vs. previo</span><strong className={marketPulse.hiresChangePct < 0 ? "text-amber-700" : "text-emerald-700"}>{marketPulse.hiresChangePct}%</strong></div>
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
