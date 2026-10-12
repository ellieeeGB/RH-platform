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
node --import tsx scripts/extract-company-periods.ts /ruta/BASE.xlsx
node --import tsx scripts/extract-company-detail.ts /ruta/BASE.xlsx
npm test
npm run typecheck
npm run build
```

La fuente Excel permanece fuera del repositorio. company-detail.json contiene los datos complementarios de los puestos técnicos, intervalos y bajas mensuales para los siete cortes conocidos. Los dos extractores validan encabezados antes de escribir.

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
