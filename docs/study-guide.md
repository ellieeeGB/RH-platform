# Guía para estudiar RH Platform

El objetivo es poder explicar cómo una selección del usuario termina en una cifra verificable. Sigue este recorrido con la aplicación abierta y el código al lado.

## 1. Abrir y ubicarte

Lee el [README](../README.md), ejecuta `npm ci` y `npm run dev`. Abre Inicio, Comparar y Calidad de información. Identifica compañía, fecha, unidad y número de empresas con respuesta.

**Comprueba:** al cambiar de empresa, ¿qué dato cambia y qué referencia permanece como mercado?

## 2. Leer una página

Empieza por [`src/app/page.tsx`](../src/app/page.tsx). Localiza `useFilters`, `getScopeSnapshot`, `deriveScopeMetrics` y las tarjetas. Después abre [`DashboardFrame`](../src/components/layout/dashboard-frame.tsx).

Una página reúne piezas. El marco coloca navegación y filtros. Los cálculos están en funciones que pueden probarse sin abrir el navegador.

**Ejercicio:** encuentra el enlace que lleva de “Salidas de personal” a su detalle. Sigue la ruta y localiza de dónde sale el valor mostrado.

## 3. Entender los filtros

Lee [`filter-context.tsx`](../src/components/filters/filter-context.tsx), [`filter-picker.tsx`](../src/components/filters/filter-picker.tsx) y [`comparison-selection.ts`](../src/lib/comparison-selection.ts).

El contexto comparte estado. El selector permite editarlo. La normalización acepta solo códigos y fechas existentes. `localStorage` conserva preferencias en ese navegador, no en una base de datos común.

**Ejercicio:** selecciona dos compañías, todo el historial y después dos bimestres. Abre una cifra de la tabla y comprueba que el detalle conserva compañía y corte.

## 4. Seguir un dato hasta su origen

Lee el [pipeline](pipeline.md). Abre un archivo de `data/processed/company-periods/`: `columns` define qué significa cada posición de `rows`. [`company-panel.ts`](../src/lib/company-panel.ts) convierte esa estructura en objetos legibles.

El manifiesto no almacena las fórmulas: guarda huellas que vinculan código y salidas de una edición. `data:verify` detecta cambios incompatibles sin necesitar el Excel.

**Ejercicio:** encuentra `exits` en las columnas, ubica un registro y sigue su uso hasta la tasa de bajas.

## 5. Entender una tasa sin memorizarla

Lee [`matchedRate`](../src/lib/metric-math.ts) y [el registro de métricas](metric-registry.md).

Ejemplo didáctico: A reporta 5 bajas y 100 personas; B reporta 40 bajas y 1,000 personas. La tasa conjunta es `45 / 1,100 × 100 = 4.09%`. Promediar 5% y 4% daría 4.5% y respondería otra pregunta. Si B no tiene plantilla válida, tampoco debe aportar sus bajas a esa tasa.

**Ejercicio:** localiza una prueba de denominadores incompletos en `tests/pipeline.test.ts` o `tests/audit-regressions.test.ts` y explica qué error impediría.

## 6. Separar cambio real y cambio de respuestas

Lee [`selection-comparison.ts`](../src/lib/selection-comparison.ts), después [`signal-analysis.ts`](../src/lib/signal-analysis.ts). Distingue el conjunto disponible de cada corte del conjunto fijo con datos en todos ellos.

**Ejercicio:** explica por qué un aumento del total no prueba que cada compañía haya empeorado. Luego revisa [el estudio de decisiones](decision-study.md) para separar tasa interna y peso de plantilla.

## 7. Revisar calidad y límites

Abre [`data-quality.ts`](../src/lib/data-quality.ts). Compara `pass`, `missing` y `review`. Un dato pendiente no es cero; un salto histórico no demuestra que la respuesta sea errónea.

**Ejercicio:** encuentra cómo se evita usar periodos futuros al construir una referencia histórica y cómo se conserva la evidencia de rechazos fuera de rango.

## 8. Hacer tu primer cambio completo

Crea una rama desde `develop`. Cambia un texto pequeño o mejora una explicación, ejecuta `npm run verify`, revisa el diff y abre un PR a `develop`. Sigue [CONTRIBUTING](../CONTRIBUTING.md).

Para practicar lógica, añade primero una prueba con un caso sintético pequeño. Debes poder calcular el resultado a mano y explicar por qué falla antes de cambiar el código. Evita practicar editando los JSON procesados.

## Al terminar deberías poder explicar

- Qué parte corre durante extracción y qué parte corre en el navegador.
- Cómo se relacionan empresa, periodo, respuesta y cobertura.
- Por qué una tasa conjunta usa numeradores y denominadores emparejados.
- Qué información persiste y dónde.
- Qué verifica la CI y qué requiere revisión visual o del Excel.
- Por qué un merge y una publicación son operaciones distintas.
