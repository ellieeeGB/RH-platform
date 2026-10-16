# Mantenimiento del repositorio · 15 de octubre de 2026

## Ramas revisadas

Al iniciar esta revisión, `main` y `develop` apuntaban al mismo commit: `87f2be81ac55e9d304f5b37f6f17d4a78595cec0` (PR #20). No había PR abiertos ni cambios recientes pendientes de llevar de `main` a `develop`.

Los PR #1–5 y #7–20 figuran integrados en `main`. Varias ramas antiguas divergen por la forma en que se integraron; un contador de commits exclusivos no implica una funcionalidad pendiente.

- PR #6 (`feat/data-pipeline-kpis`) se cerró porque quedó superado; su descripción indica que What-If y las API se reaplicarían sobre la base vigente. Esas funciones están presentes y los PR #7–8 están integrados.
- `feat/report-center` contenía un commit pendiente con `ReportActions`, aún sin conectar al reporte vigente. Se integra su acción en `src/components/analysis/report-actions.tsx` y se monta en `/reportes`. Permite imprimir o guardar PDF desde el diálogo del navegador; no genera un PDF en servidor. Su commit se conserva como padre de la integración.
- No se fusionan prototipos antiguos encima de las correcciones posteriores ni se eliminan ramas remotas en esta tarea. Esta limpieza se propone mediante un nuevo PR a `develop`.

## Cambios de organización

Los componentes se agrupan por responsabilidad en `layout`, `filters`, `charts`, `analysis` y `ui`. Los nombres genéricos `classic-charts` y `charts` se sustituyen por `recruitment-charts` y `hiring-pressure-chart`. Se actualizan todos sus consumidores.

`src/lib` conserva sus rutas porque sus módulos son pequeños y algunas rutas forman parte de la firma del pipeline. La [arquitectura](architecture.md) ofrece un mapa por responsabilidades. Mover archivos firmados sin el Excel rompería la verificación de una edición válida.

## Eliminaciones verificadas

- `src/lib/classic-data.ts`: conjuntos de ejemplo del prototipo, sin consumidores después de retirar tres gráficas no utilizadas.
- Gráficas sin consumidores: `SalaryBandsChart`, `SalaryTrendChart`, `CompanyTenureChart`, `WorkforceTrendChart` y `SalaryDistributionChart`.
- Exports antiguos sin consumidores en adaptadores de datos y variables/imports locales sin uso.
- 24 clases CSS sin referencias en el código actual y animaciones que dejaron de usarse.

Las rutas públicas de lectura, los seis extractores, los 12 archivos procesados, el manifiesto, el lockfile y las pruebas se conservan. `PreviousActions` se conserva porque permite recuperar seguimientos locales de una edición anterior. Las auditorías se trasladan a `docs/history` y se identifican como históricas, en lugar de perder su evidencia.

## Documentación corregida

La arquitectura ya no presenta PostgreSQL, un backend Python, RBAC o IA generativa como funciones implementadas. El registro de métricas documenta la tasa de bajas sobre plantilla al cierre y elimina la afirmación de un score de calidad ponderado inexistente. Se añaden guías de estudio, pipeline, contribución y despliegue.

## Controles de mantenimiento

- Node 24 común a desarrollo y CI, declarado en `.nvmrc` y `engines`.
- PR y pushes de integración cubiertos para `develop` y `main`.
- Imports locales, enlaces de documentación y módulos de componentes alcanzables comprobados por `check:structure`.
- TypeScript rechaza locales y parámetros sin uso.
- `npm run verify` reúne verificación de estructura, datos, tipos, pruebas y exportación estática.

La comprobación estructural no detecta cada export sin consumidor ni evalúa la apariencia visual; esas revisiones siguen requiriendo criterio humano. Esta tarea no modifica las cifras, el contrato de extracción ni la audiencia del sitio alojado.

## Nombres de ramas · actualización visual

Las ramas de funcionalidad conservan trabajo y trazabilidad de PR anteriores; tener varias no duplica la aplicación desplegada. Las referencias permanentes son `develop` y `main`. Tras integrar y verificar una rama temporal puede retirarse su referencia conservando el historial del merge.

El renombrado de las seis ramas remotas con el prefijo anterior está preparado en [rename-legacy-branches.mjs](../scripts/rename-legacy-branches.mjs). La herramienta conectada no expone renombrados y el navegador no tiene una sesión autenticada: **el renombrado remoto está pendiente**. No se crean ramas duplicadas para simularlo. Los nombres locales de trabajo sí se actualizaron a `feat/…` y `chore/…`.

Para revisar y ejecutar desde una computadora con GitHub CLI:

```bash
node scripts/rename-legacy-branches.mjs
gh auth login
node scripts/rename-legacy-branches.mjs --apply
git fetch origin --prune
```

El primer comando solo muestra el plan. La ejecución usa el renombrado nativo de GitHub, comprueba que el commit se conserve y se detiene ante nombres ocupados o ramas modificadas. No elimina historial ni cambia permisos. GitHub CLI se instala y autentica aparte; no es una dependencia de la plataforma.
