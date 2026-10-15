# Registro de métricas implementadas

Este documento describe el código vigente. No es una lista de fórmulas propuestas. Las funciones base están en [`metric-math.ts`](../src/lib/metric-math.ts), [`company-panel.ts`](../src/lib/company-panel.ts) y [`selection-comparison.ts`](../src/lib/selection-comparison.ts).

## Reglas comunes

- `null` significa información insuficiente; un cero explícito sigue siendo un dato.
- `completeSum` requiere todos los componentes finitos y no negativos.
- `matchedRate` acepta solo parejas con numerador válido y denominador positivo de la misma compañía. Agrega cantidades antes de dividir; no promedia tasas individuales.
- Las comparaciones temporales fijan las compañías válidas en todos los cortes elegidos. La cobertura disponible de cada corte se muestra aparte.
- Las cifras de plantilla y vacantes son fotografías de un corte: no se suman entre fechas. Tampoco se suman salarios ni porcentajes.

## Indicadores

| Indicador | Cálculo o agregación | Unidad y precaución |
| --- | --- | --- |
| Plantilla completa | Operativos + administrativos + otros, con las tres categorías. | Personas al cierre. Algunos totales de presentación conservan sumas reportadas parciales y muestran su cobertura; las tasas exigen plantilla completa. |
| Contrataciones / bajas | Suma de conteos válidos. | Eventos del periodo, no personas únicas a lo largo del historial. |
| Bajas por cada 100 empleados | `sum(bajas) / sum(plantilla completa al cierre) × 100`, mismas compañías en ambos sumandos. | No usa plantilla promedio de inicio y fin; tampoco es una tasa anual. |
| Balance de movimientos | `sum(contrataciones − bajas)` en compañías con ambas respuestas. | Diferencia de eventos; no prueba por sí sola crecimiento de plantilla. |
| Carga de movimientos | `sum(contrataciones + bajas) / sum(plantilla completa) × 100`. | Requiere las tres cantidades de cada compañía. |
| Vacantes por cada 100 | `sum(vacantes operativas + administrativas) / sum(plantilla completa) × 100`. | Ambas categorías de vacantes completas. No mide urgencia por puesto. |
| Ausencias por cada 100 | `sum(eventos de ausencia) / sum(plantilla completa) × 100`. | Eventos por 100; una persona puede registrar varios. |
| Incapacidades por cada 100 | `sum(casos) / sum(plantilla completa) × 100`. | Casos reportados, no duración en días. |
| Horas de capacitación por persona | `sum(horas operativas + administrativas) / sum(personal operativo + administrativo)`. | Ambas poblaciones y horas completas, denominador positivo. |
| Salario diario de ingreso | Mediana de empresas con cuatro bandas positivas, completas y ordenadas. | MXN/día; no es gasto de nómina. |
| Tabulador técnico | Q1, mediana y Q3 de sueldos válidos por puesto. | MXN/mes; no mezclar con salarios diarios. |
| Tiempo de cobertura | Mediana de plazos exactos positivos reportados. | Días; cero sin plazo confirmado y “más de 60” no se convierten en un plazo exacto. |
| Bajas mensuales en `/comparar` | Suma de bajas confirmadas para cada mes seleccionado. | Conteos; no divide un bimestre ni estima plantilla mensual. |

## Cambio y referencia

Para una cantidad comparable, la variación relativa es `(actual − anterior) / anterior × 100`, solo con base anterior positiva. Si la base es cero, no se inventa un porcentaje.

La diferencia entre tasas se expresa en **puntos porcentuales**: 8% − 5% = 3 pp. El cambio relativo de ese ejemplo sería 60%; no son la misma medida.

El benchmark de pares excluye la compañía seleccionada. Requiere cinco respuestas válidas para la referencia. Los cuartiles usan interpolación lineal; las bandas salariales mantienen el mismo conjunto válido para sus cuatro niveles. La comparación libre de compañías resume la selección explícita y no pretende ser un benchmark externo. Los umbrales no son controles de acceso.

## Análisis complementarios

| Módulo | Método | Límite |
| --- | --- | --- |
| Señales | Separa cambio de compañías comunes y cambio de composición de respuestas. | Identidad aritmética, no causa. |
| Sensibilidad | Retira una compañía cada vez y recalcula el cambio. | Requiere seis para conservar al menos cinco; el rango no es un intervalo de confianza. |
| Decisiones | Descompone cambio de tasa en cambio interno y cambio de peso de la plantilla. | Ver [método completo](decision-study.md). |
| Agenda | Dos cambios consecutivos sobre las mismas empresas en tres bimestres. | Persistencia descriptiva, no predicción. |
| Bajas tempranas | Participación de categorías de antigüedad completas, normalizadas y ponderadas por las bajas de esas compañías. | Cobertura restringida; no extrapolar a empresas sin desglose. |
| Calidad | Ocho comprobaciones por compañía: `pass`, `missing` o `review`; saltos históricos por separado. | No hay un score global ponderado 0–100 implementado. |

`qualityReport` compara plantilla con la mediana de al menos tres cortes anteriores y señala ratios mayores de 3 o menores de 0.33. No utiliza datos futuros ni sustituye automáticamente valores atípicos.

## Simulador

[`scenario.ts`](../src/lib/scenario.ts) aplica aritmética al último mercado: una tasa objetivo produce una carga hipotética de bajas; una diferencia diaria de sueldo se multiplica por la población indicada y 365; la reducción de días de cobertura se multiplica por la demanda técnica estructurada. Son escenarios bajo supuestos explícitos, no ahorros garantizados ni modelos causales.

## Cambiar una fórmula

Actualizar su función, añadir un caso sintético que muestre el problema, revisar los anclajes reales y este documento. Si se modifica un archivo incluido en la firma del pipeline, regenerar la edición completa. Nunca cambiar los resultados esperados de una prueba solo para ocultar una discrepancia.
