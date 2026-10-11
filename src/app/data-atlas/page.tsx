import Link from "next/link";
import { ArrowRight, Database, Layers3, ShieldCheck, Sparkles } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";
import { extendedIntelligence } from "@/lib/extended-intelligence";

const domains = [
  { title: "Empresa, geografía y muestra", blocks: "Ubicación, industria, capital, antigüedad, procesos, automotriz", route: "/contexto", status: "Activo" },
  { title: "Relaciones laborales", blocks: "Sindicato, confederación, relación sindical, negociación colectiva, litigios", route: "/relaciones-laborales", status: "Nuevo" },
  { title: "Workforce", blocks: "HC operativo/administrativo, género, edad, crecimiento histórico", route: "/contexto", status: "Activo" },
  { title: "Compensación operativa", blocks: "4 bandas salariales, progresión, tiempo por categoría", route: "/salarios", status: "Activo" },
  { title: "Mercado técnico", blocks: "13 posiciones, mínimo/promedio/máximo mensual y headcount", route: "/salarios", status: "Nuevo" },
  { title: "Talent Acquisition", blocks: "Contrataciones, escolaridad, time-to-fill, candidate fit, rechazo", route: "/talent-acquisition", status: "Activo" },
  { title: "Rotación y retención", blocks: "Bajas, causas, antigüedad, edad, rotación 6 meses", route: "/retencion", status: "Activo" },
  { title: "Ausentismo y salud", blocks: "Faltas, incapacidad, causas, tipo de incapacidad", route: "/labor-risk", status: "Activo" },
  { title: "Learning & Development", blocks: "Horas de capacitación y perfiles en desarrollo", route: "/indicadores", status: "Ampliar" },
  { title: "Workforce Planning", blocks: "Vacantes futuras por nivel, rol y escolaridad; HC a un año", route: "/workforce-planning", status: "Activo" },
  { title: "Fuentes de reclutamiento", blocks: "Mix por operativo, técnico, administrativo y gerencial", route: "/talent-acquisition", status: "Nuevo" },
  { title: "Total Rewards", blocks: "Vales, ahorro, vacaciones, aguinaldo, bonos, seguros, auto, gasolina", route: "/beneficios", status: "Activo" },
  { title: "Movilidad y transporte", blocks: "Origen de talento, rutas, uso, costo, comedor, relocalización", route: "/beneficios", status: "Nuevo" },
  { title: "Vendor ecosystem", blocks: "Servicios tercerizados, proveedor y rating 0–10", route: "/beneficios", status: "Nuevo" },
  { title: "Early Career", blocks: "Practicantes, apoyo mensual, áreas y beneficios", route: "/indicadores", status: "Nuevo" },
  { title: "Work Design", blocks: "Turnos, rotación de turnos, jornadas 12 h y flexibilidad", route: "/indicadores", status: "Nuevo" },
  { title: "Employee Experience", blocks: "Convenios, eventos, ideas, incentivos y bono de permanencia", route: "/signals", status: "Nuevo" },
  { title: "Social / ESG practices", blocks: "Salud, reciclaje, energía, igualdad, anticorrupción y comunidad", route: "/signals", status: "Nuevo" },
  { title: "Seguridad y continuidad", blocks: "Contingencias, incidentes, ubicación y denuncias", route: "/labor-risk", status: "Nuevo" },
  { title: "Benchmark y tabulador", blocks: "Percentiles de mercado, benchmark y posición relativa", route: "/benchmark", status: "Activo" },
];

export default function DataAtlasPage() {
  const meta = extendedIntelligence.metadata;
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Catch Consulting · Data Foundation"
        title="Data Atlas"
        description="Mapa de cobertura del estudio. Sirve para saber qué existe en el dataset, dónde se usa y qué información todavía puede convertirse en una decisión o benchmark."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          [meta.logicalQuestionBlocks, "bloques lógicos", "preguntas agrupadas del estudio"],
          [meta.effectiveColumns, "columnas útiles", "incluyendo matrices y subpreguntas"],
          [meta.companyCount, "empresas", "muestra anonimizada por corte"],
          [meta.periodCount, "bimestres", "serie histórica disponible"],
        ].map(([value, label, note]) => (
          <article key={String(label)} className="panel p-5">
            <div className="text-4xl font-black tracking-[-.055em] text-[#07182d]">{value}</div>
            <div className="mt-2 text-sm font-extrabold text-slate-800">{label}</div>
            <div className="mt-1 text-xs leading-5 text-slate-400">{note}</div>
          </article>
        ))}
      </section>

      <section className="mt-5 overflow-hidden rounded-[30px] bg-[#07182d] p-6 text-white md:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr] lg:items-center">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.22em] text-cyan-300"><Sparkles size={14} /> Diseño del pipeline</div>
            <h2 className="mt-3 max-w-4xl text-3xl font-black tracking-[-.045em] md:text-5xl">El Excel deja de ser la aplicación. Se vuelve una fuente de datos versionada.</h2>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-slate-300">Los extractores encuentran métricas por el texto semántico de pregunta y subpregunta, no solo por coordenadas fijas. Así, un nuevo archivo con el mismo cuestionario puede regenerar los JSON procesados, validarse y alimentar los módulos sin reconstruir la interfaz.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><Database className="text-cyan-300" size={18} /><div className="mt-3 text-sm font-black">Raw → Staging → Metrics</div><p className="mb-0 mt-1 text-xs leading-5 text-slate-400">Preserva origen, normaliza preguntas y deriva indicadores.</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[.06] p-4"><ShieldCheck className="text-emerald-300" size={18} /><div className="mt-3 text-sm font-black">Privacidad por diseño</div><p className="mb-0 mt-1 text-xs leading-5 text-slate-400">La capa pública contiene agregados; contactos y empresa individual quedan fuera.</p></div>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div><div className="eyebrow">Coverage map</div><h2 className="mt-1 text-xl font-black text-[#07182d]">Qué podemos responder con este estudio</h2></div>
          <div className="hidden items-center gap-2 text-xs font-bold text-slate-400 md:flex"><Layers3 size={15} /> {domains.length} dominios de análisis</div>
        </div>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain) => (
            <Link key={domain.title} href={domain.route} className="group rounded-[24px] border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_16px_40px_rgba(7,24,45,.07)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-sm font-black text-[#07182d]">{domain.title}</div>
                  <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">{domain.blocks}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wide ${domain.status === "Activo" ? "bg-emerald-50 text-emerald-700" : domain.status === "Nuevo" ? "bg-cyan-50 text-cyan-700" : "bg-amber-50 text-amber-700"}`}>{domain.status}</span>
              </div>
              <div className="mt-5 flex items-center gap-1 text-[11px] font-black text-slate-400 transition group-hover:text-cyan-700">Abrir módulo <ArrowRight size={13} /></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-[26px] border border-amber-200 bg-amber-50/70 p-5">
        <div className="text-xs font-black uppercase tracking-[.16em] text-amber-800">Quality guardrail</div>
        <p className="mb-0 mt-2 text-sm leading-6 text-amber-950/75">No todo campo se publica automáticamente. Matrices con señales sospechosamente universales, baja muestra o inconsistencias de conciliación se mandan primero a Data Health. La cobertura amplia no debe sacrificar confiabilidad.</p>
      </section>
    </DashboardFrame>
  );
}
