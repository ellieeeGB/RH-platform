# Vacantes, acciones y cobertura del estudio

## Recorrido de trabajo

1. **Cargar estudio**, visible en la barra superior, abre revisión y activación del Excel.
2. **Panorama** muestra la lectura principal y un acceso directo al seguimiento.
3. **Vacantes y acciones** convierte necesidades identificadas por el usuario en puestos, plazas, fechas, notas y tareas.
4. **Todo el estudio** permite buscar la evidencia del cuestionario y abrir el análisis correspondiente.

## Qué se guarda

| Campo | Regla |
|---|---|
| Empresa y bimestre | Deben existir en el estudio activo; quedan fijos después de crear el plan. |
| Puesto y nivel | Texto del puesto; nivel operativo, técnico, administrativo, gerencial u otro. |
| Plazas y cubiertas | Enteros; total entre 1 y 100 000, cubiertas entre 0 y el total. |
| Estado | Por iniciar, En curso, Bloqueada, Cubierta o Archivada. Cubierta requiere todas las plazas cubiertas. |
| Prioridad | Alta, media o baja. Es una decisión manual, no una predicción. |
| Fecha objetivo | Fecha opcional; una fecha pasada marca vencimiento si quedan plazas pendientes. |
| Anotaciones | Hasta 5 000 caracteres; se conservan por versión. |
| Acciones | Hasta 30 tareas, con área a cargo, fecha opcional y marca de completada. |
| Historial | Versión, actor, fecha UTC e instantánea completa del plan. |

Archivar conserva todo el historial y retira el plan de los totales activos. Las plazas de varios planes se suman como seguimiento manual; el usuario debe evitar registrar dos veces la misma necesidad. El sistema no infiere puestos, personas ni fechas desde agregados del Excel.

Los planes pertenecen a la importación donde se crearon. Activar otro estudio oculta los anteriores sin eliminarlos. No hay traslado ni reactivación de estudios anteriores desde esta interfaz. Antes de cambiar de estudio, termina o documenta el seguimiento que necesites conservar visible.

## Cobertura del cuestionario

El diccionario entregado contiene **183 métricas y 1 104 columnas incluidas distintas**, organizadas en 11 temas. Estos conteos describen el esquema por pregunta y subopción; no equivalen al número de columnas de una hoja ni garantizan que todas tengan respuestas válidas.

| Tema | Información accesible |
|---|---|
| Personas y empresas | Plantilla, composición, sector, municipio, Tier/OEM, procesos y referencias históricas declaradas. |
| Salarios y desarrollo | Categorías operativas, puestos técnicos, ascensos, escolaridad y salarios declarados. |
| Rotación y permanencia | Bajas, motivos, edad, antigüedad, afectaciones y escalas declaradas. |
| Reclutamiento y vacantes | Nueva creación/reemplazo, fuentes, tiempos, requisitos, rechazos, demanda por especialidad, outsourcing y practicantes. |
| Negociación y relaciones laborales | Sindicato, costo, relación, estatus, incrementos, meses, prestaciones y conflictos declarados. |
| Ausentismo y salud | Faltas, incapacidades, accidentes, afectaciones y promedios declarados. |
| Capacitación | Horas y perfiles en desarrollo. |
| Prestaciones y costos | Vacaciones, aguinaldo, bonos, utilidades, SGMM, seguro de vida, automóvil, gasolina, transporte, comedor y relocalización. |
| Jornadas y cultura | Turnos, jornadas de 12 horas, flexibilidad, convenios, eventos, ideas de mejora y responsabilidad social. |
| Seguridad y contingencias | Riesgos, ubicación reportada, denuncias y preparación ante contingencias. |
| Otras preguntas | Metadatos del cuestionario y preguntas nuevas pendientes de clasificación. No se presentan como indicadores de desempeño. |

La búsqueda consulta títulos, preguntas completas y subopciones. La cobertura cuenta celdas, respuestas numéricas, textos/intervalos, empresas con respuesta y bimestres presentes. `n` de empresas no equivale al número de celdas. Los ceros válidos cuentan; faltantes y exclusiones no cuentan como respuestas utilizables. La cobertura se recalcula con los filtros y los permisos.

## Editar títulos y temas

`configuracion/presentacion_metricas.json` contiene una entrada por identificador de métrica, con `titulo` y `tema`. Puede editarse sin reimportar el Excel. Usa uno de los temas definidos en `aplicacion/catalogo.py`; reinicia/recarga la vista para ver cambios. Las preguntas desconocidas mantienen su texto original y aparecen en el catálogo.

El diccionario de normalización sigue siendo `configuracion/diccionario_columnas.json`: controla pregunta, subopción, métrica, dimensión, unidad y reglas del importador. Cambiar un título visual no corrige ni transforma los datos ya importados.

## Ambigüedades conservadas

- Las variantes de «uso efectivo de prestación» no nombran la prestación en su propio encabezado. Se mantienen como variantes; no se asignan por cercanía a otra columna.
- Se conserva el contexto de nivel de personal cuando la pregunta identifica uno solo. Preguntas que abarcan varios niveles usan sus subopciones, sin atribuir todo a operativos.
- Las referencias explícitas a 2023, 2024 o 2025 permanecen visibles. Una pregunta con años contradictorios se etiqueta como ambigua.
- «Más del 15%», escalas 0–5/0–10 y respuestas de texto no se convierten en porcentajes puntuales ni probabilidades.
- Las columnas sin encabezado no se pueden interpretar por posición; siguen señaladas por calidad. Ninguna mejora visual recupera información que el origen no identifica.

## Movimiento y demostración

Las transiciones de tarjetas/diálogos, el crecimiento de barras y el trazado de curvas son breves. La preferencia del sistema `prefers-reduced-motion` las desactiva automáticamente; se retiró el control manual. No hay animación continua de cifras ni cambios de valores decorativos.

La vista HTML usa datos ficticios y el mismo catálogo de preguntas. Es normal que muchas preguntas no tengan respuestas demo. Los planes de prueba se guardan en `localStorage`; el navegador puede restringirlo en archivos locales. En ese caso se muestra un error y no se afirma que el plan se guardó. En la aplicación real se guardan en SQLite mediante la API autenticada.
