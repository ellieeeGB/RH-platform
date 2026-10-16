"use client";
import { usePathname } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useFilters } from "@/components/filters/filter-context";
import { getScopeSnapshot, deriveScopeMetrics } from "@/lib/company-panel";
import { buildComparison } from "@/lib/selection-comparison";
import { executiveReading } from "@/lib/executive-reading";
import { singleSelection } from "@/lib/comparison-selection";
import { getPreviousPeriod, PERIODS, MARKET_SCOPE } from "@/lib/company-panel";
import { normalizePathname } from "@/lib/route-path";

export function PageSummary() {
  const pathname=normalizePathname(usePathname());
  const { company,period,companyLabel,isMarket,comparison,monthLabel,month }=useFilters();
  const fixed=pathname==="/what-if";
  const cut=fixed?PERIODS.at(-1)!:period, selected=fixed?MARKET_SCOPE:company;
  const scope=getScopeSnapshot(selected,cut), metrics=deriveScopeMetrics(scope);
  const n=(value:number|null|undefined)=>value==null?"sin dato":value.toLocaleString("es-MX",{maximumFractionDigits:1});
  const defaultSelection=singleSelection(selected,cut), previous=getPreviousPeriod(cut);
  if(previous){defaultSelection.timeMode="periods";defaultSelection.periods=[previous,cut];}
  const reading=executiveReading(buildComparison(pathname==="/comparar"?comparison:defaultSelection,"turnover"),isMarket?5:1);
  const summaries:Record<string,[string,string]>={
    "/":[`${n(scope?.exits)} salidas y ${n(scope?.vacancies.total)} puestos pendientes en ${cut}.`,reading.question],
    "/indicadores":[`Cubrir un puesto operativo toma ${n(scope?.timeToFill.operational)} días; ${n(scope?.acceptedPer10)} de cada 10 candidatos cumplen lo requerido.`,"Prioriza los puestos con más demora y revisa las etapas de selección."],
    "/talent-acquisition":[`${n(scope?.hires)} contrataciones reportadas; cobertura operativa en ${n(scope?.timeToFill.operational)} días.`,"Distingue crecimiento de reemplazos antes de reforzar canales de reclutamiento."],
    "/workforce-planning":[`${n(scope?.vacancies.total)} puestos por cubrir; equivalen a ${n(metrics.hiringPressurePct)} por cada 100 empleados con datos emparejados.`,"Ordena las vacantes por impacto operativo y fecha requerida."],
    "/retencion":[month!=="all"?`El detalle mensual corresponde a ${monthLabel}; los indicadores generales usan ${cut}.`:reading.title,reading.question],
    "/contexto":[`${n(scope?.headcount.total)} empleados reportados en ${cut}.`,"Contrasta el tamaño del equipo con la carga de trabajo y la cobertura del estudio."],
    "/salarios":[`El sueldo diario de entrada es ${n(scope?.salaryDaily.entry)} MXN en ${cut}.`,"Revisa salario, prestaciones y composición del equipo en conjunto."],
    "/beneficios":["Las prestaciones complementan el salario y pueden diferenciar la oferta laboral.","Compara presencia y condiciones de cada beneficio antes de ajustar el paquete."],
    "/benchmark":["La posición salarial depende del tamaño y perfil del grupo de referencia.","Ajusta los filtros del grupo y compara la oferta completa, no solo el sueldo."],
    "/tabulador":["Las bandas muestran la mitad central de los salarios reportados por puesto.","Busca un puesto y compara el sueldo mensual con su rango de mercado."],
    "/labor-risk":[`Se registran ${n(metrics.absenceEventsPer100)} ausencias por cada 100 empleados con datos emparejados.`,"Revisa los motivos recurrentes y la cobertura de turnos antes de concluir causas."],
    "/relaciones-laborales":["Los acuerdos colectivos y los incrementos deben leerse con su fecha y alcance.","Contrasta las condiciones reportadas para preparar la próxima negociación."],
    "/agenda":[reading.title,"Prioriza el seguimiento y completa la información que limita la comparación."],
    "/reportes":[reading.title,"Revisa hallazgos, contexto y cobertura antes de compartir el reporte bimestral."],
    "/decisiones":["Una asociación entre salario y permanencia es una hipótesis, no una causa demostrada.","Explora las empresas comparables y registra evidencia, responsable y próxima revisión."],
    "/signals":["El cambio observado combina evolución de las empresas y cambios de respuesta.","Revisa contribuciones y sensibilidad para decidir qué merece seguimiento."],
    "/what-if":["Los escenarios muestran consecuencias aritméticas sobre la referencia de mercado.","Ajusta los supuestos para dimensionar decisiones; el resultado no es un pronóstico."],
    "/copilot":["El asistente organiza respuestas verificables del estudio según el contexto seleccionado.","Consulta un tema y revisa su evidencia antes de convertirlo en una acción."],
    "/data-quality":["Los faltantes y las cifras por confirmar delimitan qué conclusiones son defendibles.","Prioriza las solicitudes de información que recuperen más comparaciones."],
    "/data-atlas":["El estudio reúne 40 empresas y siete bimestres, con cobertura distinta por indicador.","Localiza el dominio que necesitas y comprueba qué información está disponible."],
    "/comparar":["Una misma base. Una lectura clara del cambio.","Compara compañías y periodos con las mismas empresas; abre una cifra para ver su detalle."],
  };
  const text=summaries[pathname]??[reading.title,reading.question];
  return <section className="page-summary" aria-label="Resumen ejecutivo"><div><span className="summary-label">Resumen ejecutivo</span><p>{text[0]}</p></div><p className="summary-action"><ArrowRight size={17} aria-hidden="true"/>{text[1]}</p><span className="sr-only">{fixed?"Mercado completo":companyLabel} · {cut}</span></section>;
}
