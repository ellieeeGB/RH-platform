import type { ComparisonMetric, buildComparison } from "./selection-comparison";

type Reading = { label: string; unit: string; up: string; down: string; meaning: string; question: string };
export const EXECUTIVE_METRICS: Record<ComparisonMetric, Reading> = {
  turnover: { label: "Salidas por cada 100 empleados", unit: "salidas por cada 100 empleados", up: "Aumentaron las salidas en relación con el personal.", down: "Disminuyeron las salidas en relación con el personal.", meaning: "Ayuda a revisar la permanencia del personal y la necesidad de reemplazos. Incluye las bajas reportadas; no todas son renuncias.", question: "¿En qué puestos se concentran las salidas y qué motivos confirmó RH?" },
  exits: { label: "Salidas de personal", unit: "salidas", up: "Se registraron más salidas de personal.", down: "Se registraron menos salidas de personal.", meaning: "Permite dimensionar el trabajo de reemplazo. El tamaño de la empresa y sus planes también influyen en la lectura.", question: "¿Cuáles de estas salidas requieren reemplazo y cuáles estaban previstas?" },
  monthlyExits: { label: "Salidas de personal del mes", unit: "salidas", up: "Se registraron más salidas en el mes comparado.", down: "Se registraron menos salidas en el mes comparado.", meaning: "Ayuda a ubicar cuándo se concentra la salida de personal. El dato cuenta bajas registradas, no personas únicas a lo largo del historial.", question: "¿Qué motivos y áreas explican las salidas de estos meses?" },
  headcount: { label: "Número de empleados al cierre", unit: "empleados", up: "El número de empleados al cierre aumentó.", down: "El número de empleados al cierre disminuyó.", meaning: "Muestra el tamaño del equipo en esa fecha. Para saber si alcanza, hay que contrastarlo con la carga de trabajo y el plan de operación.", question: "¿El personal disponible coincide con lo que necesita la operación?" },
  hires: { label: "Contrataciones", unit: "contrataciones", up: "Se registraron más contrataciones.", down: "Se registraron menos contrataciones.", meaning: "Ayuda a revisar el esfuerzo de contratación e incorporación. Más contrataciones pueden responder a crecimiento o a reemplazos.", question: "¿Cuántas contrataciones son para crecer y cuántas reemplazan salidas?" },
  vacancies: { label: "Puestos por cubrir", unit: "puestos por cubrir", up: "Aumentó el número de puestos por cubrir.", down: "Disminuyó el número de puestos por cubrir.", meaning: "Sirve para priorizar contrataciones. La importancia depende del puesto, de cuánto lleva pendiente y de si afecta la operación.", question: "¿Qué puestos pendientes afectan la operación y para cuándo se necesitan?" },
  vacancyRate: { label: "Puestos por cubrir por cada 100 empleados", unit: "puestos por cubrir por cada 100 empleados", up: "Aumentaron los puestos pendientes en relación con el personal.", down: "Disminuyeron los puestos pendientes en relación con el personal.", meaning: "Pone las necesidades de contratación en relación con el tamaño de la empresa. No mide por sí solo la urgencia de cada puesto.", question: "¿La necesidad viene de expansión, reemplazos o puestos difíciles de cubrir?" },
  salary: { label: "Sueldo diario de entrada", unit: "MXN al día", up: "Subió el sueldo de entrada del grupo comparable.", down: "Bajó el sueldo de entrada del grupo comparable.", meaning: "Ayuda a revisar la oferta salarial. La cifra del grupo es el valor central de los sueldos reportados, no el gasto total de nómina.", question: "¿El sueldo, las prestaciones y las condiciones del puesto forman una oferta competitiva?" },
  absenceRate: { label: "Ausencias por cada 100 empleados", unit: "ausencias por cada 100 empleados", up: "Aumentaron las ausencias en relación con el personal.", down: "Disminuyeron las ausencias en relación con el personal.", meaning: "Ayuda a revisar la continuidad de los turnos. Una persona puede registrar varias ausencias; no es un porcentaje de personas ausentes.", question: "¿En qué turnos y motivos se repiten las ausencias y cómo se está cubriendo el trabajo?" },
  timeToFill: { label: "Días para cubrir un puesto operativo", unit: "días", up: "Aumentó el tiempo reportado para cubrir puestos operativos.", down: "Disminuyó el tiempo reportado para cubrir puestos operativos.", meaning: "Ayuda a planear con cuánta anticipación iniciar la búsqueda. La cifra del grupo es el valor central de los plazos reportados.", question: "¿En qué parte del proceso se acumula la espera: búsqueda, entrevistas u oferta?" },
};

const number = (value: number) => value.toLocaleString("es-MX", { maximumFractionDigits: 2 });
export function executiveReading(result: ReturnType<typeof buildComparison>, minimum = 1) {
  const info = EXECUTIVE_METRICS[result.metric];
  const first = result.points[0], last = result.points.at(-1);
  const firstCut = result.cuts[0], lastCut = result.cuts.at(-1);
  const hasTime = result.cuts.length > 1;
  const canCompare = hasTime && result.common.length >= minimum && result.delta !== null;
  const observed = last?.available.value ?? null;
  let title = observed === null ? "Falta información para leer este indicador." : info.label;
  const coverage = result.rows.length === 1 ? "con los datos de la compañía seleccionada" : `con información de ${last?.available.n ?? 0} de las ${result.rows.length} compañías seleccionadas`;
  let observation = observed === null ? "No hay suficientes datos válidos en el periodo seleccionado." : `En ${lastCut!.label} se reportan ${number(observed)} ${info.unit}, ${coverage}.`;
  if (canCompare) {
    title = Math.abs(result.delta!) < 1e-9 ? "El indicador se mantuvo igual entre los extremos." : result.delta! > 0 ? info.up : info.down;
    observation = `Pasó de ${number(first.fixed.value!)} a ${number(last!.fixed.value!)} ${info.unit}, de ${firstCut.label} a ${lastCut!.label}, en ${result.common.length === 1 ? "la misma compañía" : `las mismas ${result.common.length} compañías`}.`;
    if (Math.abs(result.delta!) > 1e-9 && Math.abs(result.delta!) < .01) observation += " El cambio es menor a 0.01 en esta unidad.";
  } else if (hasTime) title = "Aún falta información para comparar el cambio.";
  const question = observed === null || (hasTime && !canCompare) ? "¿Qué compañías pueden completar los datos faltantes antes de concluir si hubo un cambio?" : info.question;
  const scope = result.rows.length === 1
    ? hasTime ? `La compañía ${canCompare ? "tiene" : "no tiene"} datos válidos en todos los periodos elegidos.` : observed === null ? "Falta información de la compañía para este dato." : "La lectura corresponde a la compañía seleccionada."
    : hasTime ? `${result.common.length} de ${result.rows.length} compañías tienen datos válidos en todos los periodos elegidos.${canCompare ? " La comparación usa solo ese grupo." : ` Se requieren al menos ${minimum} para esta lectura.`}` : `${last?.available.n ?? 0} de ${result.rows.length} compañías aportan este dato.`;
  return { title, observation, meaning: info.meaning, question, scope, canCompare };
}

export const READING_TERMS = [
  { term: "Bimestre y corte", meaning: "Un bimestre abarca dos meses. El corte es el periodo al que corresponde una cifra; revisa siempre la fecha que aparece junto a ella." },
  { term: "Plantilla o headcount", meaning: "Número de empleados registrados. La plantilla al cierre es una foto del equipo al final del periodo; sumar varios cierres contaría personas más de una vez." },
  { term: "Bajas y rotación", meaning: "Las bajas son salidas registradas, por ejemplo renuncias o despidos. Aquí se relacionan con el personal al cierre: 8 bajas por cada 100 empleados equivalen a una tasa de 8%. No es una tasa anual ni indica el motivo de salida." },
  { term: "Vacante", meaning: "Puesto que se necesita cubrir. Puede deberse a crecimiento, a un reemplazo o a una búsqueda pendiente. El número de vacantes no dice por sí solo qué tan urgentes son." },
  { term: "TTF o tiempo de cobertura", meaning: "Días reportados para cubrir un puesto. Es distinto de la cobertura de datos, que indica cuántas empresas respondieron." },
  { term: "Mercado o benchmark", meaning: "Referencia construida con las empresas participantes que tienen datos válidos. No representa automáticamente a todas las empresas del sector o del país." },
  { term: "Mediana", meaning: "Valor central al ordenar las respuestas de menor a mayor. Si hay dos valores centrales, se promedian esos dos. Ayuda a que una cifra extrema no domine la referencia." },
  { term: "Q1 y Q3", meaning: "Marcan el inicio y el final de la mitad central de las respuestas ordenadas. Sirven para ver un rango habitual del grupo, no un mínimo y máximo permitidos." },
  { term: "Puntos porcentuales", meaning: "Son la diferencia directa entre dos porcentajes. Ejemplo ilustrativo: pasar de 5% a 8% son 3 puntos porcentuales más, equivalentes a 3 casos más por cada 100; el aumento relativo sería 60%." },
  { term: "Cobertura de datos", meaning: "Cuántas empresas entregaron los datos necesarios para ese indicador. Una cifra calculada con 12 de 40 empresas describe esas 12, no automáticamente a las 40." },
  { term: "Grupo comparable", meaning: "Las mismas empresas con datos suficientes en todos los periodos comparados. Así, el cambio no se debe simplemente a que unas empresas dejaron de responder y otras empezaron." },
  { term: "Guion, cero y cambio", meaning: "Un guion significa que falta información suficiente. Un cero sí es un valor reportado. Que una cifra suba o baje no demuestra por sí solo una mejora, un problema ni su causa." },
];
