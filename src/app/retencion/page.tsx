import { CalendarClock, DoorOpen, ShieldAlert, UserRoundCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { KpiCard } from "@/components/kpi-card";
import {
  ExitAgeChart,
  ExitReasonsChart,
  ExitTenureChart,
  TurnoverTrendChart,
} from "@/components/people-intelligence-charts";
import { latestMarket } from "@/lib/benchmark-data";
import { retentionData } from "@/lib/people-intelligence-data";

const formatInt = (value: number) => new Intl.NumberFormat("es-MX", { maximumFractionDigits: 0 }).format(value);

export default function RetentionPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="People Intelligence · Retention"
        title="Retención y Rotación"
        description="Convierte las bajas bimestrales en señales accionables: cuándo se va la gente, en qué edades se concentra la salida y qué motivos predominan."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Rotación bimestral" value={`${latestMarket.turnoverBimonthlyPct.toFixed(1)}%`} change={0.13} changeLabel="pp vs. May–Jun" icon={DoorOpen} inverse />
        <KpiCard label="Early attrition" value={`${retentionData.earlyAttritionUnder3MonthsPct}%`} change={0} changeLabel="bajas antes de 3 meses" icon={CalendarClock} inverse />
        <KpiCard label="Bajas < 1 año" value={`${retentionData.firstYearExitSharePct}%`} change={0} changeLabel="sobre desglose válido" icon={ShieldAlert} inverse />
        <KpiCard label="Bajas del bimestre" value={formatInt(latestMarket.exits)} change={1.3} changeLabel="vs. bimestre anterior" icon={UserRoundCheck} inverse />
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Tendencia</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Rotación bimestral estimada</h2>
          <p className="mt-2 text-xs leading-5 text-slate-400">Bajas divididas entre el headcount promedio de inicio y fin del periodo; utiliza headcount ajustado solo cuando existe una anomalía crítica marcada.</p>
          <TurnoverTrendChart />
        </article>

        <article className="overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-soft">
          <div className="eyebrow !text-cyan-300">Retention signal</div>
          <h2 className="mt-4 text-2xl font-black leading-tight">El problema principal aparece antes de que el empleado termine de integrarse.</h2>
          <p className="mt-4 text-sm leading-6 text-slate-300">En las {retentionData.tenureValidCompanies} empresas con desglose de antigüedad consistente, {retentionData.earlyAttritionUnder3MonthsPct}% de las bajas se concentra en los primeros tres meses y {retentionData.firstYearExitSharePct}% antes de cumplir un año.</p>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-2xl font-black">{retentionData.tenureWeightedExits.toLocaleString("es-MX")}</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">bajas ponderadas con antigüedad válida</div></div>
            <div className="rounded-2xl bg-white/5 p-4"><div className="text-2xl font-black">42.5%</div><div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">bajas entre 23 y 30 años</div></div>
          </div>
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-xs leading-5 text-slate-300">Hipótesis a investigar: onboarding, expectativa salarial, calidad de selección, transporte/turnos y supervisión de primeras semanas. La plataforma debe probar asociaciones antes de atribuir causalidad.</div>
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Early attrition</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Antigüedad al momento de la baja</h2>
          <ExitTenureChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Demografía de salida</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Edad de quienes causaron baja</h2>
          <ExitAgeChart />
        </article>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_.75fr]">
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Motivos reportados</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Principales razones de salida</h2>
          <p className="mt-2 text-xs leading-5 text-amber-700">La suma de causas reportadas excede las bajas totales en algunas compañías. La gráfica normaliza sobre eventos de causa reportados y no debe interpretarse como porcentaje exacto de las {formatInt(latestMarket.exits)} bajas.</p>
          <ExitReasonsChart />
        </article>
        <article className="panel p-5 md:p-6">
          <div className="eyebrow">Prioridades</div>
          <h2 className="mt-1 text-lg font-extrabold text-slate-950">Qué investigaría RH</h2>
          <div className="mt-5 space-y-3">
            {[
              ["0–90 días", "Separar salida por supervisor, turno, transporte y fuente de reclutamiento."],
              ["Renuncia + abandono", "Cruzar salario, horas extra, distancia y tiempo de contratación para detectar presión competitiva."],
              ["23–30 años", "Comparar expectativas de carrera, promociones y capacitación contra cohortes con mayor permanencia."],
              ["Bajas controlables", "Construir alertas tempranas sin perfilar personas individualmente; trabajar a nivel de cohortes."],
            ].map(([title, body]) => (
              <div key={title} className="rounded-2xl border border-slate-100 p-4">
                <div className="text-sm font-extrabold text-slate-900">{title}</div>
                <p className="mb-0 mt-1 text-xs leading-5 text-slate-500">{body}</p>
              </div>
            ))}
          </div>
        </article>
      </section>
    </DashboardFrame>
  );
}
