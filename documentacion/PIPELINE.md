# Del archivo a la decisión

## Importar sin depender de posiciones

1. Validar extensión, contenido XLSX, tamaño comprimido (15 MB), expandido (100 MB), hojas (24), filas (1,000), columnas (2,000) y celdas (1,000,000). Rechazar macros y vínculos externos.
2. Interpretar el nombre de hoja como bimestre; aceptar ENE-FEB, MAR-ABR, MAY-JUN, JUL-AGO, SEP-OCT y NOV-DIC con año. CSV usa el nombre del archivo como bimestre y también dos filas de encabezado.
3. Leer pregunta en la primera fila y subopción en la segunda. Los `Unnamed:` heredan únicamente la pregunta activa. Una columna con ambas cabeceras vacías rompe la herencia: no se asigna por adivinación.
4. Canonicalizar HTML, espacios, mayúsculas y acentos; retirar prefijos de progreso y normalizar `[Pnn]`. **No eliminar años, unidades ni palabras de negocio.** Clave = SHA-256(pregunta normalizada + subopción), primeros 20 caracteres. La posición solo sirve para trazabilidad.
5. Aplicar `configuracion/diccionario_columnas.json`. Preguntas nuevas reciben clave y alias estables, conservan pregunta/unidad y aparecen en Explorar todo. Preguntas semánticamente equivalentes con redacción distinta necesitan edición explícita de su mapeo.
6. Descartar PII antes de crear hechos. Si una misma clave aparece dos veces en una hoja, ambas respuestas quedan `encabezado_ambiguo`; no sumar, elegir la primera ni indexarlas por posición como si fueran métricas distintas. Corregir la fuente con subopciones inequívocas y volver a importar.
7. Validar la llave empresa–bimestre, conservar faltantes con estado, calcular controles y presentar vista previa. Rechazar hojas sin empresas y archivos sin métricas; una carga vacía no puede sustituir el estudio activo.
8. Confirmar: transacción que crea empresa/periodo, importa hechos, desactiva el estudio anterior y registra auditoría. La huella incluye archivo y mapeo efectivo. Mismo archivo y mismo mapeo se rechazan; un diccionario corregido permite una nueva importación. Para CSV se incluye también el bimestre/nombre. Las huellas antiguas basadas solo en archivo siguen reconociéndose para evitar duplicados. No se reescriben importaciones anteriores.

## Diccionario editable

Cada entrada contiene `pregunta`, `subopcion`, `metrica`, `dimension`, `unidad`, `grupo_100`, `categoria` y `accion`. Puedes editar con un editor de texto; también descargar y volver a adjuntar JSON en Cargar estudio. No cambies la clave para una pregunta existente. El diccionario se aplica al **reimportar**, no altera datos guardados en silencio. Un campo editable vacío, de tipo incorrecto, una acción desconocida o una unidad no soportada producen un error explícito. Los campos de encabezado del JSON descargado se conservan como metadatos; no son instrucciones ejecutables.

- `metrica`: nombre estable del indicador, por ejemplo `bajas_motivo`.
- `dimension`: tipo de respuesta, por ejemplo `renuncia voluntaria`. Preguntas distintas de fuentes o incrementos conservan su contexto para evitar mezclas.
- `unidad`: personas, eventos, porcentaje, horas, hora_del_dia, dias, escala_0_10, seleccion, texto, numero o unidades monetarias específicas.
- `grupo_100`: solo una composición que deba sumar 100. No aplicarlo a selección múltiple ni a uso de fuentes 0–10.
- `accion`: incluir o descartar. Los campos privados siempre se descartan y no se puede desactivar esa protección desde el archivo.

La detección de encabezados sin texto no admite inventar nombres desde la posición. La solución es corregir el encabezado del Excel con el responsable del estudio. Las incidencias registran coordenadas y conteo, **no conservan sus valores desconocidos**, que podrían contener PII.

## Reglas de limpieza

| Entrada | Resultado |
|---|---|
| Vacío / guion | Null con estado `vacio` / `sin_respuesta` |
| N/A, No aplica | Null `no_aplica` |
| Desconocido | Null `desconocido` |
| Por definir | Null `por_definir` |
| Cero numérico o texto "0" | Cero real; no faltante |
| Más del 15%, menor que X | Texto/intervalo `intervalo_no_puntual`; fuera de promedios puntuales |
| 0.15 con formato Excel 0% | 15 puntos porcentuales y estado de conversión |
| 0.15 sin formato porcentual | 0.15; no multiplicar por magnitud |
| Composición con valores 0–1 sin formato porcentual | Si hay fracciones y ningún formato confirma su escala, `escala_porcentaje_ambigua`; se conserva la representación, fuera de cálculos. Declarar `unidad: proporcion` en el diccionario permite convertir ×100 explícitamente al reimportar. |
| Hora Excel o fracción en campo horario de entrada/salida | Horas decimales con regla registrada; 0.5 día → 12 h |
| Horas de capacitación 0.5 sin formato horario | 0.5 horas; no asumir medio día |
| Duraciones Excel negativas o una hora del día ≥24 | Null con estado de rango; las duraciones totales de más de 24 h sí son válidas |
| Conteos negativos o fraccionarios | Null `conteo_invalido` |
| Porcentaje fuera de 0–100 / uso fuera de 0–10 | Null, estado específico; conserva texto no privado para revisión |
| Fórmula Excel/CSV | No evaluar; null `formula_bloqueada` |
| Correo o teléfono en texto libre | Descartar valor y registrar estado, sin ponerlo en logs |
| Fila sin empresa | Omitir y reportar como vacía si solo contiene faltantes; si contiene datos sustantivos, incidencia de fila sin identificador |

No se rellenan faltantes, no se recortan atípicos y no se corrigen sumas con ajustes proporcionales.

## Controles

Reconciliar total de bajas con motivo, tipo y meses por separado; total de altas con nueva creación/reemplazo; incapacidades con tipos. Si falta una parte, el control es **no comprobable**, distinto de una discrepancia. Composiciones completas: 100±1 punto; «no medimos» impide dar por comprobada una composición.

Atípicos de plantilla operativa: más de Q3 + 3×IQR entre empresas del bimestre, o más de 3×/menos de 1/3 de su mediana en otros bimestres. Un valor marcado sigue incluido hasta revisión; una gran empresa puede ser un atípico legítimo. No hay corrección automática del valor atípico destacado.

La corrección guarda antes/después, actor, motivo, fecha e incremento de revisión. Una revisión obsoleta devuelve conflicto y obliga a recargar. Restaurar inclusión no deshace una corrección numérica: para volver al original, aplicar otra corrección documentada con el valor de la bitácora.

## Coherencia entre consulta y fuente

El resumen de una métrica agrupa por **dimensión y unidad**: nunca suma días con horas bajo una sola etiqueta. Las incidencias de filas sin empresa se conservan para el equipo de consultoría, acotadas al bimestre seleccionado; no se atribuyen a una empresa ni se entregan a clientes.

El umbral transversal IQR requiere al menos cinco empresas. La comparación temporal puede señalar un cambio aunque se filtre una sola compañía. En Calidad, elegir un bimestre acota las incidencias mostradas, pero el historial de sus atípicos conserva los otros bimestres autorizados de esa empresa para poder revisar la señal.

Las pruebas de `pruebas/test_pipeline.py` recorren dos hojas XLSX con distinto orden y una pregunta nueva, además de CSV, reimportación corregida y CLI. `pruebas/test_excel_real.py` añade el recorrido privado por API cuando se establece `RH_TEST_EXCEL`.
