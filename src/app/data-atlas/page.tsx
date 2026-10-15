import Link from "next/link";
import { ArrowRight, Building2, CalendarDays, Layers3, ShieldCheck } from "lucide-react";
import { DashboardFrame, PageHeader } from "@/components/dashboard-frame";

const domains = [
  { title: "Empresa y ubicación", detail: "Ubicación, industria, capital, antigüedad, procesos y contexto automotriz.", route: "/contexto" },
  { title: "Plantilla", detail: "Headcount operativo y administrativo, género, edad y evolución histórica.", route: "/contexto" },
  { title: "Compensación", detail: "Bandas salariales, progresión y comparación frente al mercado.", route: "/salarios" },
  { title: "Posiciones técnicas", detail: "Mercado salarial y número de empleados para posiciones técnicas relevantes.", route: "/salarios" },
  { title: "Contratación", detail: "Altas, escolaridad, tiempos de cobertura, candidatos adecuados y rechazo.", route: "/talent-acquisition" },
  { title: "Fuentes de reclutamiento", detail: "Canales utilizados para perfiles operativos, técnicos, administrativos y gerenciales.", route: "/talent-acquisition" },
  { title: "Rotación y retención", detail: "Bajas, motivos, antigüedad, edad y rotación acumulada.", route: "/retencion" },
  { title: "Ausentismo e incapacidades", detail: "Faltas, incapacidades, causas y exposición operativa.", route: "/labor-risk" },
  { title: "Capacitación", detail: "Horas de formación y esfuerzo de desarrollo por población.", route: "/indicadores" },
  { title: "Planeación de plantilla", detail: "Vacantes futuras por nivel, rol, escolaridad y cambios previstos en el número de empleados.", route: "/workforce-planning" },
  { title: "Relaciones laborales", detail: "Sindicato, relación laboral, revisiones e incrementos de negociación colectiva.", route: "/relaciones-laborales" },
  { title: "Beneficios", detail: "Vales, ahorro, vacaciones, aguinaldo, seguros, auto y gasolina.", route: "/beneficios" },
  { title: "Movilidad y transporte", detail: "Origen del talento, transporte, rutas, uso, costo y relocalización.", route: "/beneficios" },
  { title: "Comedor y servicios", detail: "Uso, costos y proveedores de servicios para colaboradores.", route: "/beneficios" },
  { title: "Practicantes", detail: "Participación, apoyo económico, áreas y beneficios para talento temprano.", route: "/indicadores" },
  { title: "Turnos y flexibilidad", detail: "Esquemas de turnos, rotación, jornadas y flexibilidad administrativa.", route: "/indicadores" },
  { title: "Experiencia del colaborador", detail: "Convenios, eventos, ideas, reconocimientos e incentivos de permanencia.", route: "/signals" },
  { title: "Prácticas sociales", detail: "Salud, igualdad, medio ambiente, anticorrupción y participación comunitaria.", route: "/signals" },
  { title: "Seguridad y continuidad", detail: "Contingencias, incidentes y medidas relacionadas con continuidad laboral.", route: "/labor-risk" },
  { title: "Benchmark", detail: "Comparación de mercado, percentiles y posición relativa por indicador.", route: "/benchmark" },
];

export default function DataAtlasPage() {
  return (
    <DashboardFrame>
      <PageHeader
        eyebrow="Cobertura del estudio"
        title="Cobertura del estudio"
        description="Temas disponibles y acceso a los análisis del estudio de Catch Consulting."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ["40", "empresas", "panel participante", Building2],
          ["7", "bimestres", "historia disponible", CalendarDays],
          [String(domains.length), "temas de RH", "organizados por decisión", Layers3],
          ["100%", "anonimizado", "códigos de empresa", ShieldCheck],
        ].map(([value, label, note, Icon]) => (
          <article key={String(label)} className="panel p-5">
            <Icon size={18} className="text-cyan-700" />
            <div className="mt-4 text-4xl font-black tracking-[-.055em] text-[#07182d]">{String(value)}</div>
            <div className="mt-2 text-sm font-extrabold text-slate-800">{String(label)}</div>
            <div className="mt-1 text-xs leading-5 text-slate-400">{String(note)}</div>
          </article>
        ))}
      </section>

      <section className="mt-5">
        <div className="mb-5"><div className="eyebrow">Áreas disponibles</div><h2 className="mt-1 text-2xl font-black text-[#07182d]">Catálogo de análisis</h2><p className="mt-2 text-sm leading-6 text-slate-500">Abre un tema para seleccionar la empresa y el periodo de consulta.</p></div>
        <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {domains.map((domain) => (
            <Link key={domain.title} href={domain.route} className="group rounded-[24px] border border-slate-200/80 bg-white p-5 transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_16px_40px_rgba(7,24,45,.07)]">
              <div className="text-sm font-black text-[#07182d]">{domain.title}</div>
              <p className="mb-0 mt-2 text-xs leading-5 text-slate-500">{domain.detail}</p>
              <div className="mt-5 flex items-center gap-1 text-[11px] font-black text-slate-400 transition group-hover:text-cyan-700">Abrir análisis <ArrowRight size={13} /></div>
            </Link>
          ))}
        </div>
      </section>
    </DashboardFrame>
  );
}
