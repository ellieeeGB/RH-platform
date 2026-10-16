# Sistema visual · Catch Consulting HR Toolkit

## Decisión de diseño

La interfaz se organiza como un reporte de consultoría: contexto visible, resumen ejecutivo, hallazgo, indicadores y evidencia. La primera lectura responde qué sucede y qué revisar; la metodología permanece accesible mediante «Calidad del dato» y «Qué mide y cómo se calcula».

La información y las rutas existentes se conservan. Los cambios afectan presentación, navegación y textos de interpretación, sin alterar el pipeline ni los JSON procesados.

## Lenguaje visual

| Elemento | Uso |
| --- | --- |
| Navy `#081d31` | Marca y tarjeta protagonista; navegación sobre marfil. |
| Teal `#096773` | Selección, tendencias y acciones principales. |
| Verde `#176144` sobre `#e7f3ec` | Evolución favorable según el indicador. |
| Ámbar `#80500b` sobre `#fcf1d9` | Atención o información que requiere revisión. |
| Coral `#a43832` sobre `#fbe9e5` | Aumento de salidas en una base comparable. |
| Violeta `#654685` | Referencia de mercado; no representa un estado. |
| Newsreader variable | Titulares editoriales y hallazgos; archivo local, `next/font/local`. |
| DM Sans variable | Controles, tablas y datos; cifras tabulares, archivo local. |

El Inicio usa una tarjeta de salidas que ocupa tres filas en escritorio y tres indicadores secundarios a su derecha; en tablet pasa a dos columnas y en móvil a una. El resumen ejecutivo abre la lectura sobre un bloque jade suave. El lienzo marfil `#f7f5ef` y la navegación clara reducen el peso del navy. Los marcadores de mercado llevan etiquetas directas y formas distintas. Candidatos y vacantes usan proporciones con cantidades visibles; el ancho se limita a la escala y avisa si se supera.

## Integridad de la lectura

- Menos salidas se presenta como mejora; más salidas, como atención prioritaria. Es una señal descriptiva, no demuestra causas.
- Más empleados o contrataciones no equivale automáticamente a éxito; se pide contrastar con el plan.
- El total disponible y el cambio del grupo comparable pueden tener bases distintas. Se señala la diferencia y se explica en el detalle.
- Las tendencias de Inicio e Indicadores conservan las mismas empresas durante siete bimestres. Con menos de cinco empresas de mercado no se traza la tendencia; una compañía individual requiere su propia información completa.
- Las referencias de Benchmark vuelven a aplicar los filtros de tamaño y condición laboral en cada corte. Se identifican como cobertura variable, no como una cohorte fija.
- No se inventan puntos, interpolaciones ni ceros para rellenar faltantes.

## Interacción y accesibilidad

El menú agrupa las 22 rutas en secciones colapsables. Al navegar, abre el grupo de la página activa. Buscar revela coincidencias aunque su grupo esté cerrado; `Ctrl+K` y `⌘K` llevan al buscador, abriendo el menú móvil si corresponde.

La barra de contexto distingue el corte individual de una selección de comparación. Los filtros mantienen sus capacidades: una o varias compañías, historial, bimestres y meses confirmados.

El contador solo anima una copia visual después del montaje; el lector de pantalla y el HTML inicial contienen el valor final. Los valores finales se restauran al imprimir. Las animaciones de cifra, tendencia y flecha respetan `prefers-reduced-motion`. Hay foco visible, controles con cursor y estados acompañados de texto e icono.

Los puntos de adaptación previstos son 375, 768, 1024 y 1440 px. Las tablas extensas conservan desplazamiento horizontal propio. La tarjeta principal y los resúmenes pasan a una columna en pantallas estrechas. Una revisión visual real sigue siendo necesaria para certificar cada tamaño.

## Error de hidratación corregido

React 19 no serializa correctamente un `<title>` con varios hijos de texto. El título SVG de Comparar se emitía vacío desde el servidor. Ahora cada título y descripción dinámicos usa una única cadena, también en el mapa de decisiones. No se oculta el error mediante `suppressHydrationWarning` ni se desactiva el render del servidor.

La regresión se cubre en [presentation.test.ts](../tests/presentation.test.ts). Los componentes compartidos están en [data-visuals.tsx](../src/components/ui/data-visuals.tsx), [overview-kpis.tsx](../src/components/analysis/overview-kpis.tsx) e [indicator-kpis.tsx](../src/components/analysis/indicator-kpis.tsx).

## Tipografía y comparación editorial

Newsreader y DM Sans se distribuyen en `public/fonts` con sus licencias SIL OFL. Proceden de [Google Fonts: DM Sans](https://github.com/google/fonts/tree/main/ofl/dmsans) y [Newsreader](https://github.com/google/fonts/tree/main/ofl/newsreader). Se conserva el subconjunto latino, acentos españoles y puntuación; las fuentes no requieren peticiones externas al navegar ni durante la compilación. Los archivos variables se cargan con `font-display: swap`.

Escala: titulares principales 42–70 px, hallazgos 29–42 px, texto de lectura 15–17 px, controles y tablas 14 px, notas 12–13 px. Se usan pesos 400–650 en lugar de negritas extremas, con interlineado 1.55–1.65 para lectura y cifras tabulares. La serif se reserva a titulares y síntesis; los datos permanecen en sans.

La pendiente del hallazgo representa solamente el primer y último periodo del grupo comparable. Mantiene una escala común desde cero: cambios pequeños no se amplifican. Fechas, cifras, unidad y estado textual acompañan al color. Salarios, contrataciones y plantilla conservan un estado neutral porque un aumento no demuestra una mejora. La gráfica temporal completa y la tabla permanecen debajo.

Los indicadores se eligen mediante botones con `aria-pressed`; compañías y periodos usan chips con controles nativos de selección múltiple o única. Se mantienen búsqueda, «Solo esta», selección total, cancelación, validación, persistencia y descarga CSV. Los meses sin desglose siguen deshabilitados.

Efectos: trama diagonal casi imperceptible en la tarjeta principal, superficies cálidas con degradado suave y transiciones cortas en los controles. Evitar textos menores de 12 px, mayúsculas en frases largas, pesos extremos, color sin explicación y escalas que exageren variaciones.
