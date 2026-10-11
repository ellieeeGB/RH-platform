import { BarChart3, BriefcaseBusiness, GraduationCap, TriangleAlert } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import { TalentHotspotsChart, VacancyTrendChart, VacancyTotalTrendLine } from "@/components/workforce-rewards-charts";
import { latestMarket } from "@/lib/benchmark-data";
import { workforcePlanningData } from "@/lib/workforce-rewards-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function WorkforcePlanningPage() {
  const latest = workforcePlanningData.latest;
  const structured = workforcePlanningData.structuredDemand;

  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="People Intelligence · Workforce Planning"
        title="Workforce Planning"
        description="Anticipa demanda futura de talento y separa volumen de contratación de escasez potencial por puesto y escolaridad."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Vacantes próximas" value={formatInt(latest.total)} change={latest.changeVsPreviousPct} changeLabel="vs. May–Jun" icon={BriefcaseBusiness} />
        <KpiCard label="Demanda operativa" value={formatInt(latest.operational)} change={latest.operationalSharePct} changeLabel="% del total" icon={BarChart3} inverse />
        <KpiCard label="Demanda administrativa" value={formatInt(latest.administrative)} change={latest.administrativeSharePct} changeLabel="% del total" icon={GraduationCap} inverse />
        <KpiCard label="Hiring pressure" value={`${latestMarket.hiringPressurePct}%`} change={0} changeLabel="vacantes / headcount" icon={TriangleAlert} inverse />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Capacity outlook</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Vacantes previstas por bimestre</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">La demanda sigue elevada después del pico May–Jun 2025, aunque disminuyó {Math.abs(latest.changeVsPreviousPct).toFixed(1)}% en el último corte.</p>
          <VacancyTrendChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Planning signal</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">El volumen está concentrado, pero el riesgo no debe medirse solo por cantidad.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">Operador de producción con secundaria domina el detalle estructurado con 1,450 posiciones. En perfiles profesionales destacan Ingenieros con formación en Ingeniería (216), mientras Técnico de mantenimiento / TSU lidera la demanda técnica (32).</p>
          <div className="mt-6 grid grid-cols-3 gap-2">
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">1,450</div><div className="mt-1 text-[10px] uppercase text-slate-400">Operador + secundaria</div></div>
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">216</div><div className="mt-1 text-[10px] uppercase text-slate-400">Ingenieros</div></div>
            <div className="rounded-2xl bg-white/5 p-3"><div className="text-xl font-black">32</div><div className="mt-1 text-[10px] uppercase text-slate-400">Técnico mant. TSU</div></div>
          </div>
          <div className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-xs leading-5 text-amber-100">La prioridad futura será combinar este volumen con time-to-fill, rotación temprana y disponibilidad salarial. Un puesto de menor volumen puede representar mayor riesgo si tarda mucho más en cubrirse.</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Talent demand radar</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Hotspots de puesto × escolaridad</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Se usa el detalle estructurado para detectar patrones de demanda, no para reemplazar el total oficial de vacantes.</p>
          <TalentHotspotsChart />
        </article>

        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Demand momentum</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Demanda total en el tiempo</h2>
          <VacancyTotalTrendLine />
          <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-xs leading-5 text-slate-500">El mínimo histórico de esta ventana fue Sep–Oct 2024 con 1,461 posiciones; el máximo fue May–Jun 2025 con 2,494. El corte actual permanece 58.8% por encima del mínimo.</div>
        </article>
      </section>

      <section className="mt-4 panel overflow-hidden">
        <div className="border-b border-slate-100 p-5 md:p-6">
          <div className="eyebrow">Skills map</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Demanda estructurada prioritaria</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
              <tr><th className="px-6 py-3">Familia</th><th className="px-6 py-3">Puesto</th><th className="px-6 py-3">Escolaridad</th><th className="px-6 py-3">Demanda</th><th className="px-6 py-3">Acción</th></tr>
            </thead>
            <tbody>
              {workforcePlanningData.hotspots.map((row) => (
                <tr key={`${row.family}-${row.role}-${row.education}`} className="border-t border-slate-100">
                  <td className="px-6 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">{row.family}</span></td>
                  <td className="px-6 py-3 font-semibold text-slate-800">{row.role}</td>
                  <td className="px-6 py-3 text-slate-500">{row.education}</td>
                  <td className="px-6 py-3 font-black text-slate-950">{formatInt(row.demand)}</td>
                  <td className="px-6 py-3 text-xs font-bold text-cyan-700">Cruzar con time-to-fill →</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-4 rounded-3xl border border-amber-200 bg-amber-50 p-5 md:p-6">
        <div className="flex gap-3">
          <TriangleAlert className="mt-0.5 shrink-0 text-amber-700" size={20} />
          <div>
            <div className="font-extrabold text-amber-950">Advertencia de conciliación</div>
            <p className="mb-0 mt-1 text-sm leading-6 text-amber-900/80">El detalle estructurado suma {formatInt(structured.combinedTotal)} posiciones, mientras el total general reportado es {formatInt(structured.headlineTotal)}. La diferencia es {formatInt(structured.difference)}. Por eso la plataforma usa {formatInt(structured.headlineTotal)} como KPI oficial y el detalle únicamente como señal de composición hasta validar la fuente.</p>
          </div>
        </div>
      </section>
    </DashboardFrame>
  );
}
