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

Se abrió la URL privada con el navegador disponible. La página pide iniciar sesión con ChatGPT y el navegador de revisión no tiene esa sesión. No se ha comprobado visualmente el dashboard después de ese muro de acceso. Las verificaciones de TypeScript y del motor de datos no sustituyen esa comprobación.

Las modificaciones de esta rama no cambian por sí solas el Site desplegado. La integración completa entre la fuente Next.js y la fuente alojada requiere conservar sus funciones y revisar la versión resultante antes de sustituir el despliegue. No se declara equivalencia entre ambas aplicaciones.
