# Verificación de la entrega

**Revisión vigente: 20 de octubre de 2026.** Pasaron **87 pruebas Python y 22 JavaScript** con el Excel privado mediante `make test`, además de los controles de estructura, enlaces, configuración y HTML reproducible. La revisión anterior se conserva debajo como historial. Véase [AUDITORIA_PIPELINE.md](AUDITORIA_PIPELINE.md) para las correcciones, el alcance y la reproducción.

Fecha: 18 de octubre de 2026. Entorno: Python 3.12, SQLite y Node para comprobar sintaxis JavaScript.

## Resultado

Se ejecutó la suite completa con el Excel privado: **57 pruebas correctas**. Incluye importación real de siete bimestres y 280 combinaciones empresa–bimestre, detección de atípicos, reglas de limpieza, cálculos, permisos, sesiones, aislamiento de clientes y ajustes auditados.

```bash
RH_TEST_EXCEL='/ruta/BASE HISTORICA.xlsx' .venv/bin/python -m pytest pruebas -q
node --check web/app.js
```

La ejecución produjo una advertencia de deprecación del adaptador httpx de TestClient; no hubo errores. En CI, la prueba que requiere el Excel privado se omite porque ese archivo no se distribuye. Las otras 56 pruebas usan datos ficticios.

También se verificaron mediante TestClient los filtros, el panel, la calidad, el explorador y el reporte contra la base importada. La presentación de cinco diapositivas se renderizó y revisó visualmente.

## Límites de esta comprobación

- No se realizó revisión visual del sitio en un navegador ni pruebas de accesibilidad con lector de pantalla. Siguen pendientes las resoluciones 375, 768, 1024 y 1440 px.
- No se comprobó PostgreSQL ni un despliegue en producción. No hay un sitio público desplegado como parte de esta entrega.
- Las pruebas de seguridad cubren controles concretos; no sustituyen una auditoría independiente ni demuestran anonimato formal del benchmark.
- Aprobar una prueba no resuelve las ambigüedades del cuestionario: deben revisarse con su propietario.

Los siguientes pasos están en [SIGUIENTE_FASE.md](SIGUIENTE_FASE.md).

## Rediseño narrativo

La regresión de Python después del rediseño pasó: **56 pruebas correctas y una omitida** porque el archivo privado es opcional. La integración del Excel ya se había comprobado en la entrega inicial (57 correctas); este cambio no modifica el importador ni el backend.

Se añadieron **15 pruebas JavaScript**, todas correctas: ocho de cálculos descriptivos y siete de interacciones en DOM. Comprueban las mismas empresas en la evolución, ceros/faltantes, sensibilidad sin mutación, navegación, filtros, matriz temporal, trayectorias, explorador, paginación, presentación, agenda y escenario.

```bash
npm ci
.venv/bin/python scripts/generar_vista.py
npm test
```

Happy DOM evalúa únicamente el código local de la interfaz y la vista ficticia. Su advertencia sobre evaluación JavaScript no implica que se hayan abierto páginas externas. No se utiliza para renderizar capturas ni se reporta como revisión visual de navegador.

La vista autónoma es un artefacto reproducible con datos ficticios. La revisión visual real en las cuatro resoluciones sigue pendiente.

## Vacantes, acciones y catálogo · 20 de octubre de 2026

La suite completa pasó **73 pruebas Python**, incluida la integración con el Excel privado. La ejecución sin el archivo privado pasa 72 y omite una. Se comprobaron creación/edición de planes, notas y tareas persistentes, historial, archivo, filtros, aislamiento por empresa, CSRF, rechazo de datos incoherentes, revisión concurrente, cambio de estudio y migración v1 → v2 sin eliminar datos anteriores. También se comprobó que el catálogo cubre las 183 métricas, clasifica plantilla/contrataciones correctamente y aplica el alcance autorizado.

Las **19 pruebas JavaScript** pasaron: las 15 anteriores y cuatro recorridos para acceso destacado a importación, movimiento reducido, búsqueda del catálogo y creación/edición de vacantes con acciones, notas, historial y validación. El generador empaquetó otra vez 1 456 registros ficticios; ningún registro real se incorpora a la vista HTML.

Se verificó la cobertura del catálogo contra la base real: ninguna métrica presente quedó fuera del catálogo. Antes de aplicar la migración aditiva se creó un respaldo local privado. `node --check` pasó para `app.js`, `trabajo.js` y `demo.js`.

Continúa pendiente la inspección visual en navegador real y en las cuatro resoluciones indicadas. Los tests DOM no verifican píxeles ni animaciones renderizadas. La advertencia de deprecación de TestClient/httpx continúa sin errores de prueba.

## Panorama visual · versión 3

Pasaron las **22 pruebas JavaScript** (8 de cálculo y 14 de DOM). Además de la regresión anterior, se comprobó que motivos y vacantes usan el último bimestre seleccionado y las empresas filtradas; que la cobertura y el acceso al plan se actualizan; que los ceros siguen visibles y los faltantes no se inventan; y que un error en la consulta de motivos no bloquea el resto del panorama. La prueba de inicio verifica que no existe la tarjeta de portada anterior.

`node --check web/app.js` pasó y el HTML autónomo se regeneró desde el código actual y los mismos 1 456 registros ficticios. No hubo cambios de backend, importación o cálculos estadísticos. Las 73 pruebas Python corresponden a la revisión previa y no se presentan como una nueva ejecución en esta iteración.

Sigue pendiente la inspección visual en un navegador real: no había un controlador de navegador disponible. Happy DOM comprueba estructura y eventos, no píxeles, dimensiones renderizadas ni animaciones. No se publicó un sitio; la entrega queda en Git y en el HTML autónomo con nombre de versión nuevo.
