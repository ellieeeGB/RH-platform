# Métricas: significado, fórmula y límites

Unidad de observación: **una empresa en un bimestre**. `n_empresas` cuenta empresas válidas; `n_valores` cuenta respuestas empresa–bimestre. El denominador de rotación se muestra en personas reportadas, nunca como muestra estadística de empleados independientes.

## Indicadores del panel

| Indicador | Fórmula y alcance | Casos borde |
|---|---|---|
| Plantilla del reporte | Operativos + administrativos | Ambos componentes necesarios, suma >0. «Otros» se conserva por separado y no entra al denominador solicitado. |
| Bajas | Total de bajas del bimestre | Cero válido; faltante excluido. No sumar motivos al total nuevamente. |
| Contrataciones | Total contratado en el bimestre | Se contrasta con nueva creación + reemplazo. |
| Rotación bimestral | 100 × bajas / plantilla del reporte | No se usa promedio porque el archivo no ofrece explícitamente apertura y cierre confiables. No se infiere apertura usando movimientos incompletos. |
| Rotación de un conjunto de empresas | 100 × suma de bajas / suma de plantillas, **mismas empresas válidas** | No promediar porcentajes ni usar denominadores de empresas que no reportaron bajas. No se limita a 100: pueden existir múltiples reemplazos; la tasa no es una probabilidad individual. |
| Balance de contratación | Altas − bajas, sobre empresas con ambos valores | No es un cambio observado de plantilla; no confirma reconciliación de apertura/cierre. |
| Cambio bimestral | Tasa actual − tasa anterior, en puntos porcentuales | Solo bimestre anterior consecutivo y empresas válidas comunes. La tasa comparada puede diferir de la tasa global de cada periodo si cambia la cohorte. |
| Cambio interanual | Tasa actual − mismo bimestre del año previo | Solo pares disponibles; en esta base solo hay un par anual. |
| Mediana de pares | Mediana de tasas individuales válidas del grupo | Cliente excluido de sus propios pares; mínimo 5 empresas, sin devolver identidades, extremos ni filas. |
| IC descriptivo de mediana | Percentiles 2.5–97.5 de 600 remuestras de empresas con reemplazo; semilla 2026 | Solo n≥5. No resuelve sesgo de selección. Se informa n pequeño si n<10. No es un IC binomial de empleados. |

**Varios bimestres:** las tarjetas muestran el último bimestre seleccionado. La gráfica conserva una tasa por bimestre. Nunca sumar fotos de plantilla para presentarlas como personas únicas. En el explorador, un resumen de varios bimestres combina observaciones empresa–periodo y lo indica; las medianas no implican personas únicas.

## Familias del cuestionario

| Familia | Presentación y tratamiento |
|---|---|
| Bajas por motivo / tipo / mes | Conteos separados. Reconciliación contra total. Renuncia y abandono no se reinterpretan como causalidad ni se mezclan con rescisión. |
| Antigüedad / edad de bajas | Porcentajes declarados, no expedientes individuales. No se convierten a conteos enteros ni a antigüedad promedio usando puntos medios inventados. |
| Género / edad de plantilla | Composición declarada. Se valida suma 100±1 cuando los componentes están disponibles. No hay movilidad individual. |
| Motivos de rotación declarados | Respuestas del cuestionario, no causas verificadas. Texto explorado con su pregunta original. |
| Fuentes de reclutamiento | Uso 0–10 cuando así lo pide la pregunta, y selecciones múltiples por separado. No convertir a porcentajes ni afirmar efectividad/retención por fuente. |
| Tiempo de contratación | Días hábiles declarados por categoría. El operativo se refiere a un grupo de 30 candidatos según la pregunta; no es el tiempo individual exacto de cubrir una vacante. |
| Vacantes próximas | Plazas declaradas para mes en curso y siguiente. No son vacantes abiertas con fecha y SLA. |
| Faltas | Eventos reportados. Sin días/hora de exposición no se calcula tasa de ausentismo. |
| Incapacidades | Casos y desglose. No convertir casos a días perdidos. |
| Capacitación | Horas declaradas por tipo de personal. Se conserva la unidad. Una fracción numérica sin formato horario no se multiplica por 24 automáticamente. |
| Negociación colectiva | Estatus, incrementos otorgados/planeados y meses seleccionados se mantienen separados. Textos con 2023/2024 no se relabelan como 2025. No se afirma plazo legal ni se agrega INPC sin una fuente validada. |
| Conflictos sindicales / seguridad | Preguntas y respuestas disponibles, con contexto original; no se fabrica una probabilidad de conflicto. |
| Transporte | MXN por persona por mes, conforme a la pregunta. No sumar como gasto total mensual. |
| Comedor | MXN por platillo; total, empresa y empleado separados. |
| SGMM | Costo total anual de póliza según pregunta, no costo por persona. |
| Salarios | Rangos/categorías reportados; no son expedientes de remuneración. La unidad y población se leen en la pregunta original. |

Los alias `pregunta_<hash>` conservan las columnas todavía no curadas. Se muestran con su pregunta original. Su unidad puede permanecer «texto» o «número» hasta que se revise el diccionario; no se supone comparabilidad entre preguntas.

## No calculables con fidelidad

Headcount inicial/final/promedio y reconciliación de stock: faltan cortes y fechas confiables. Rotación trimestral: bimestres no reconstruyen meses para todos los movimientos. Anualizada: no se publica una extrapolación mecánica. Rotación <90 días exactos: categorías agregadas no equivalen a fechas exactas.

Kaplan–Meier, reingresos, riesgo por empleado, brecha salarial ajustada, retención por fuente, aceptación de ofertas, costo real por contratación y movimientos por supervisor: requieren historial individual o denominadores/eventos que aquí faltan. Tablas de empleados y movimientos se proponen para la siguiente fase, no se rellenan sintéticamente en el estudio real.

## Escenarios

- Plantilla supuesta de cierre = plantilla de partida + altas supuestas − bajas supuestas.
- Costo supuesto de contratación = altas supuestas × costo unitario supuesto.
- Referencia a seis meses = último valor de rotación repetido durante tres bimestres. Backtest de un paso: MAE en puntos porcentuales; MAPE excluye observados iguales a cero, lo que se declara. Exige cuatro bimestres consecutivos completos. No se presenta un intervalo predictivo calibrado con tan pocos errores.
- No estima efectos de salario o fuentes de reclutamiento sobre rotación. No se entrena IA individual con una encuesta agregada.
