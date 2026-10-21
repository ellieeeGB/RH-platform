# Lecturas visuales y correcciones · versión 4

Revisión final del 21 de octubre de 2026, a partir de las seis capturas y las observaciones de uso. El trabajo corresponde a `ellieeeGB/rh`; no modifica otro repositorio ni publica el estudio en un sitio.

## Cambios por problema observado

| Problema | Solución |
|---|---|
| Falta de identidad | Logo oficial de Catch Consulting en acceso, menú y reporte, servido localmente. |
| Controles innecesarios | Retirados Presentar, Movimiento y Mis vistas. Se conserva la preferencia de accesibilidad del sistema, sin botón. |
| CSV muestra «Inicie sesión» | Descarga mediante petición autenticada; renueva sesión con CSRF, reintenta una vez y descarga un archivo. Si la sesión terminó, vuelve al acceso con explicación. |
| Reporte poco visual | Índice numerado y enlazado, indicadores, evolución, gráficos por tema e interpretación; logo y estilos embebidos. Funciona como HTML autónomo. |
| `n`, unidad y mediana confusos | Etiquetas explícitas «empresas» y «respuestas», símbolos junto a las cifras; sumas compatibles y promedios identificados. Valor exacto cuando hay una sola respuesta. |
| Negociaciones aparentemente vacías | Las categorías se grafican por número de empresas, sin columna numérica vacía. |
| Textos amontonados | Respuestas en barras con etiquetas que permiten salto de línea; detalles extensos desplegables. |
| Códigos en fuentes | Etiquetas del diccionario, con fuente y nivel de personal; sin hash visible. |
| Beneficios sin contexto | «Prestaciones al personal y sus costos»: transporte, comedor y seguro de gastos médicos mayores, con base de cobro explícita. |
| Benchmark confuso | Diferencia entre rotación ponderada del panorama y punto medio de tasas; cuando selección y referencia coinciden se muestra una sola cifra. |
| Vacantes sin instrucciones | Guía de tres pasos: definir puesto, organizar acciones, actualizar avance. Notas e historial permanecen. |
| Comparación sin indicador visible | Selector destacado, título y encabezado de tabla con indicador y magnitud; porcentaje dentro de cada celda de rotación. |
| Todo el estudio saturado | Índice de temas, búsqueda global, ocho preguntas por página y retorno a temas. Todas las preguntas siguen accesibles. |
| Contexto vacío y Personas y trabajo difíciles de leer | Pregunta y bimestre visibles; gráfico apropiado al tipo, cobertura y explicación al lado. Los bimestres con respuestas se indican cuando falta el actual. |
| «40 porcentaje» | Formato `40 %`; costos, días, horas y escalas con símbolos adecuados. |
| Explorar todo duplicado | Retirado del menú. Las preguntas nuevas o sin clasificación siguen en Todo el estudio. |
| Calidad sin interpretación | Comparación histórica, relación con la rotación y siguiente paso junto a la trayectoria; criterio técnico desplegable. |

## Reglas analíticas

- La lectura temática comienza en el último bimestre seleccionado. El selector local cambia la fecha; el detalle exacto conserva todas las fechas del filtro superior.
- Cantidades de personas, eventos y horas se suman **por opción dentro del bimestre**. No se suman plantillas o vacantes de fechas diferentes.
- Porcentajes, costos por persona, días y escalas se muestran como **promedio por respuesta**, nunca como total. Con una observación se muestra su valor exacto. El original por empresa se conserva en el detalle y en el CSV. Un promedio de porcentajes no representa una proporción ponderada de trabajadores.
- Cada categoría cuenta empresas distintas por opción y bimestre. Una selección múltiple puede superar el total de empresas. Las horas del día son categorías de horario, no promedios entre horas.
- Los porcentajes inferiores al 1% conservan su valor y muestran un aviso para confirmar la escala del estudio. No se multiplican automáticamente por 100.
- Faltantes, errores y exclusiones no se convierten en ceros. Los intervalos se conservan como declaraciones; no se asigna un valor puntual.
- En la escala 0–10 de fuentes, se reconocen exclusivamente las etiquetas completas `0 - No Utilizada` y `10 - Todas mis contrataciones son por este medio`, incluyendo separador guion o raya y punto final opcional. Se interpretan como 0 y 10 solo para la lectura visual, con aviso visible. El estado y texto originales no cambian ni se reimporta la base. Otros textos siguen separados.
- El benchmark conserva mediana, intervalo descriptivo y protección mínima de cinco empresas. La explicación aclara la diferencia con la tasa ponderada, sin ocultar el método ni convertir la referencia en meta.

## Reporte y detalle

La descarga incluye empresas autorizadas y filtros actuales. El resumen temático usa el último bimestre seleccionado; la evolución conserva los demás. Los ocho mayores valores de desgloses extensos se muestran en el gráfico, claramente indicados; todas las opciones y cifras exactas pueden abrirse. Los desplegables cerrados no se imprimen; abrirlos permite incluirlos en el PDF.

El CSV conserva **todos** los hechos autorizados de la selección, sus estados y origen, neutralizando fórmulas. El reporte es una síntesis de los capítulos del índice; el catálogo mantiene el cuestionario completo. Ninguno incorpora datos de otras empresas para un usuario cliente.

## Organización

- `aplicacion/presentacion.py`: reglas de lectura visual sin modificar los hechos.
- `aplicacion/reporte.py`: HTML autónomo, gráficos SVG, etiquetas y metodología.
- `web/visuales.js`: vistas temáticas, interpretación y descargas autenticadas.
- `web/trabajo.js`: planes y catálogo por temas.
- `web/recursos/`: logo y procedencia.
- [catch_rh_visual_v4.html](catch_rh_visual_v4.html): única vista autónoma vigente; 6 328 registros **ficticios**, con ejemplos de categorías, negociaciones y fuentes.

## Criterios de diseño consultados

Se usaron títulos concretos, etiquetas visibles y explicaciones breves, de acuerdo con la guía de [texto de gráficos de ONS](https://service-manual.ons.gov.uk/data-visualisation/guidance/chart-text). La navegación por temas y detalles bajo demanda aplica el principio de [divulgación progresiva de Nielsen Norman Group](https://www.nngroup.com/articles/progressive-disclosure/). Las fuentes orientan el diseño; no validan las conclusiones del estudio.

## Verificación

Las regresiones cubren tipos numéricos y textuales, porcentajes, horas, filtros, etiquetas de escala, privacidad, reporte autónomo, renovación de sesión y las interacciones rediseñadas. Véase [VERIFICACION.md](VERIFICACION.md) para el resultado final.

El reporte real se renderizó localmente para revisar impresión con WeasyPrint. Los archivos de revisión permanecen privados y no forman parte de Git. Esto no sustituye una prueba en Firefox/Chrome. El entorno no ofrece controlador de navegador: la interfaz se verifica con DOM y las pruebas de API; sigue pendiente la inspección visual interactiva en navegador y móvil. WeasyPrint se utilizó solo para revisión local y no es una dependencia de ejecución de la plataforma.
