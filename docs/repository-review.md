# Revisión del repositorio RH-platform

Este repositorio sigue siendo la base de trabajo de la plataforma Next.js. La versión estática alojada en Sites tiene una fuente de despliegue separada; no implica que este repositorio esté abandonado. No se modificaron permisos ni visibilidad.

Cambios incorporados en esta revisión:

- Navegación móvil con diálogo modal, cierre por Escape, enlaces a todos los módulos, foco visible y salto al contenido.
- Selector de mes persistente y sincronizado con el bimestre. Retención consulta el mes validado y marca como ausente el desglose con encabezados ambiguos. El resto de los indicadores conserva su alcance bimestral.
- Encabezados de beneficios, reclutamiento, relaciones laborales, ausentismo y tabulador muestran el contexto de sus métricas filtradas.
- Corrección de los 38 valores de 1 punto porcentual que habían pasado a 100 en rechazos, incluida la regla del extractor para impedir que reaparezcan.
- Tasas calculadas con respuestas emparejadas y plantilla completa. Balance de altas y bajas con las mismas compañías. Horas por persona sobre plantilla operativa y administrativa con respuestas completas.
- Ceros de tiempo de contratación tratados como posición no existente. Intervalos mayores de 60 días conservados y contados por separado.
- Tabulador real por compañía y bimestre, con búsqueda, orden y CSV. Percentiles calculados con bandas consistentes, muestra visible y unidades mensuales.
- Eliminados tres módulos sin referencias: mock-data.ts, types.ts y what-if-simulator.tsx. El simulador utilizado, what-if-lab.tsx, se conserva.
- Dependencias fijadas en package-lock.json y pruebas ejecutadas con el cargador de tsx, sin el proceso IPC del CLI.

## Reproducir los datos modificados

```sh
npm run data:extract -- /ruta/BASE.xlsx
npm run data:verify
npm test
npm run typecheck
npm run build
```

La fuente Excel permanece fuera del repositorio. company-detail.json contiene los datos complementarios de los puestos técnicos, intervalos y bajas mensuales para los siete cortes conocidos. El orquestador valida las seis extracciones antes de sustituir la edición.

## Estado de la comprobación visual

Se abrió la URL privada con el navegador disponible. El 12 de octubre de 2026 se inició el flujo seguro de acceso y el usuario eligió Google. El proveedor de acceso devolvió «502 Bad Gateway / Connection refused» antes de completar la sesión. Se detuvo ese intento; no se ha comprobado visualmente el dashboard después del muro de acceso. Las verificaciones de TypeScript y del motor de datos no sustituyen esa comprobación.

Las modificaciones de esta rama no cambian por sí solas el Site desplegado. La integración completa entre la fuente Next.js y la fuente alojada requiere conservar sus funciones y revisar la versión resultante antes de sustituir el despliegue. No se declara equivalencia entre ambas aplicaciones.


## Revisión a partir de la grabación del 12 de octubre de 2026

Fuente visual: `Screencast From 2026-10-12 10-44-44.webm`, recorrido de 2 min 47 s por la versión local en localhost:3000. Se inspeccionaron fotogramas distribuidos por el recorrido, incluidos inicio, reporte, señales, contexto, salarios, reclutamiento, planeación, relaciones laborales, retención, benchmark, asistente, cobertura y calidad. La grabación permite revisar el escritorio; no confirma la presentación móvil ni el resultado renderizado después de estos cambios.

| Evidencia del recorrido | Problema | Cambio aplicado |
| --- | --- | --- |
| 00:30 · Señales | El título ocupa casi toda la altura visible y relega los datos. | Encabezado compacto, texto centrado en la decisión, menos espacio vertical; se conserva la paleta. |
| 00:06 · Inicio | Tarjetas muy altas y cifras alejadas de sus etiquetas. | Menor altura en portada y tarjetas, títulos de sección más breves y datos más cercanos. |
| 00:54–01:18 · Recorrido con desplazamiento | La barra de filtros sale de la pantalla. | Se elimina el contenedor de desplazamiento accidental que impedía el comportamiento sticky. Pendiente confirmar en navegador. |
| 02:06 · Benchmark | Botones sin acción, notas de UI/backend y comparación prometida para una sesión futura. | Comparación funcional por empresa y bimestre, grupo por tamaño y sindicalización, distribución Q1–mediana–Q3, posición propia y brecha. |
| 02:06 · Indicadores | Flechas verdes y 0% en tarjetas sin cambio calculado. | Se omiten variaciones inexistentes y se muestran los cambios nulos reales con un signo neutro. |
| 02:42 · Calidad | Tabla recortada al lado de una columna alta; gran vacío debajo. | Paneles apilados, controles en cuadrícula y tabla con más ancho disponible. |
| Todo el recorrido | Muchas secciones requieren buscar al final del menú. | Búsqueda por nombre con soporte de acentos; todos los enlaces se mantienen. |

### Alcance de los filtros

Empresa y bimestre se mantienen en las vistas que los utilizan. Las vistas de resumen fijo del mercado indican su alcance y no presentan selectores que aparenten cambiar esos datos. Mes aparece en retención, donde existe el cálculo de bajas mensuales; las demás métricas conservan su alcance bimestral. El benchmark nuevo excluye a la empresa seleccionada de su grupo de referencia; los tamaños son intervalos explícitos de personas, no clasificaciones empresariales legales.

### Criterios de comparación

Cada estadística requiere al menos cinco respuestas válidas. Las bandas salariales usan empresas con cuatro valores positivos y ordenados, para mantener la misma muestra en las cuatro bandas. Los cuartiles se interpolan linealmente. Los tiempos técnicos usan plazos exactos; intervalos mayores de 60 días no se convierten en una cifra. Estos criterios de presentación no constituyen control de acceso a los datos del cliente.

Validación: 35 pruebas aprobadas, incluidos filtros de pares, exclusión de la propia empresa, tamaño mínimo e interpolación de cuartiles; TypeScript sin errores y compilación de producción completada. No se declara comprobación visual posterior al cambio ni actualización del Site desplegado. Esta revisión corresponde a RH-platform y al PR #15.

## Auditoría del 13 de octubre: pipeline, evidencia y diseño

Se inspeccionaron el Excel y los fotogramas de `Screencast From 2026-10-13 09-00-17.webm` (3 min 29 s). La grabación todavía muestra el tabulador de demostración y el benchmark anteriores al PR #15: no valida el nuevo renderizado. El trabajo continúa en `codex/audit-and-responsive-review`, sin sustituir el Site privado.

### Correcciones

| Problema | Cambio |
| --- | --- |
| La extracción omitía el detalle y no propagaba la ruta a todos los comandos. | Un orquestador ejecuta los seis extractores con una sola fuente, en aislamiento. Valida 280 claves empresa-periodo antes de sustituir los archivos. |
| Posibles ediciones mezcladas. | Manifiesto SHA-256 del Excel, implementación y 12 salidas. `predev` y `prebuild` verifican integridad. Un fallo de extracción conserva la edición previa. Se intenta restaurarla si falla la sustitución; no se promete resistencia a un apagado entre los dos renombrados. |
| Porcentajes inferidos por magnitud. | Rechazos y uso de beneficios: puntos porcentuales. Incrementos y aportaciones: fracciones. Uso de fuentes de reclutamiento: escala 0–10; un 1 ya no se transforma en 100%. |
| Antigüedad y edad aceptaban categorías ausentes como cero. | Composiciones completas, no negativas, con tolerancia de cinco puntos y normalización del grupo. Antigüedad: seis empresas, 735 bajas; 54.5% antes de tres meses y 76.7% antes del año. Edad: cinco empresas, 928 bajas. Cobertura visible junto a las gráficas. |
| Denominadores distintos entre pantallas. | Tasas con las mismas empresas en numerador y denominador. Panel, serie, riesgo, copiloto y simulador comparten la definición. Último corte: 2,791 / 26,977 × 100 = 10.34585%, n=29. Es bajas por plantilla al cierre, no rotación sobre plantilla promedio. |
| Simulación aplicada a una población distinta. | Usa las mismas 26,977 personas y la tasa sin redondear. Es aritmética de escenarios, no un modelo causal. |
| Conciliación con partes ausentes. | «Sin evaluar» se separa de consistente y de discrepante. La página nueva revisa ocho reglas por empresa y muestra columnas fuente. |
| Celdas finales sin encabezado contadas como preguntas. | No se hereda la última pregunta a esas celdas; permanecen 1,142 columnas efectivas. |
| Medianas antiguas incorporaban ceros de tiempo de cobertura. | Regeneración con plazos positivos: Nov–Dic 24 operativo 11.5 días y gerencial 45; Mar–Abr 25 técnico 20. «Más de 60» no se convierte en un plazo exacto. |

### Funciones entregadas

- Laboratorio de señales con cinco indicadores, empresa y bimestre activos. Separa el cambio de las mismas empresas de la aportación de respuestas que aparecen o faltan. Es una identidad aritmética, no una explicación causal.
- Sensibilidad al retirar cada empresa una vez: rango y estabilidad de dirección. Se necesitan seis empresas para que queden al menos cinco. No es un intervalo de confianza.
- Tabla de aportaciones y cobertura histórica: distingue desempeño de composición de respuestas; un cero explícito sí cuenta.
- Descarga de evidencia en JSON: selección, método, resultados, comprobaciones, columnas y huella del Excel.
- Radar de inicio: sustituye fotografías externas por cuatro comparaciones útiles y acceso al laboratorio. Conserva azul marino, turquesa e índigo.
- Calidad por empresa y periodo, con filtros de resultado y saltos históricos sin imputación automática. Ocho reglas no certifican todo el cuestionario.

Se eliminaron `signature-metric-strip`, `signature-signal-field`, `signature-metrics` y `metrics`, sin consumidores de producción después de la sustitución. Sus pruebas de anclajes obsoletos se reemplazan por pruebas del cálculo usado. Se retiraron exports sin consumidores del benchmark anterior y el comando obsoleto `next lint`; `typecheck` sigue disponible.

### Validación y límites

40 pruebas aprobadas, TypeScript sin errores y compilación de producción con 23 rutas. Se prueban unidades, composiciones, ausentes versus cero, identidades, igualdad de cohortes entre vistas, descomposición, sensibilidad, fallo de extracción e integridad. Una segunda extracción independiente produjo los mismos 12 hashes y las mismas firmas de fuente e implementación. La prueba de fallo imprime intencionalmente un error de hoja ausente y comprueba que la edición anterior permanezca intacta.

Pendiente comprobar visualmente el renderizado final en escritorio y móvil. La compilación no sustituye esa comprobación. También sigue pendiente confirmar el dato atípico de COMPAÑIA 28 y aclarar campos ambiguos de la fuente. No se afirma que seis empresas representen a las 40. El Site privado no se ha actualizado.

### Próximas funciones propuestas

1. Bitácora de hipótesis con evidencia de un corte, responsable, acción y resultado posterior. Requiere definir persistencia y acceso.
2. Priorizar datos faltantes según cuánto reducirían la incertidumbre de una comparación. Requiere límites plausibles acordados; no inventar salarios ni bajas.
3. Alertas de cambios sostenidos en varios cortes, con estabilidad de composición. Siete bimestres no sustentan pronósticos individuales fiables.
4. Extender el copiloto a la selección activa y a las exclusiones de cada cálculo. El asistente actual es de reglas; este PR no presume una conexión a un modelo generativo.

## Continuación del 14 de octubre: asistente con contexto

Se encontró un flujo todavía inconsistente con el resto de la plataforma: el asistente ignoraba la empresa y el periodo y respondía siempre con agregados del último mercado. También mostraba notas de implementación y aseguraba no acceder a filas de compañías, cuando la aplicación ya contiene el panel de compañías codificadas.

- Los filtros de empresa y bimestre ahora funcionan en el asistente. Cada respuesta conserva su contexto y las consultas se reinician al cambiar de selección para no mezclar cortes.
- Salarios excluye la empresa seleccionada de la referencia, usa bandas completas y exige cinco respuestas para cuartiles. Bajas, ausencias, vacantes y calidad usan los mismos cálculos del panel.
- Antigüedad del último mercado no se atribuye a empresas individuales ni a otros periodos. Prestaciones distingue respuesta negativa de dato ausente.
- Las preguntas sobre cambios abren la descomposición de mismas empresas, cobertura y sensibilidad, con la mayor aportación identificada. No se afirma causalidad.
- Preguntas fuera de alcance, pronósticos, meses o selecciones explícitas diferentes no reciben un resumen genérico como si fuera una respuesta. El asistente explica qué dato o selección falta.
- Se sustituyeron textos de prototipo y etiquetas de IA por lenguaje de consulta guiada, evidencia legible y navegación interna. Mejoras de accesibilidad: campo y botón nombrados, estado vacío, registro de conversación y límites de ancho para texto largo.

Validación: 45 pruebas, TypeScript y compilación de producción correctos. Hay casos específicos de empresa, bimestre anterior, muestras pequeñas, primer corte y desconocido versus no. La revisión en navegador permanece pendiente: esta sesión no dispone del controlador de navegador exigido por la guía de Sites para la vista local. No se inició un servidor alternativo ni se modificó el Site privado. La evidencia disponible sigue siendo la grabación de la versión anterior.
