# RH Platform — People Intelligence

Plataforma moderna de People Analytics para transformar reportes bimestrales de RH en decisiones accionables.

## Visión

Mantener los dashboards operativos y de benchmarking que ya utiliza el negocio —contexto y muestra, personal y salarios, beneficios, indicadores, tabulador y KPIs— y añadir una capa de inteligencia con tendencias históricas, alertas, calidad de datos, escenarios What‑If y un copiloto de IA con trazabilidad.

## Principios

- **Decisiones antes que gráficas:** cada dashboard debe responder qué pasó, por qué importa y qué acción conviene evaluar.
- **KPIs verificables:** las fórmulas viven en una capa de métricas reusable, no embebidas en componentes visuales.
- **Privacidad por diseño:** datos crudos fuera del repositorio; benchmarks agregados con controles de confidencialidad.
- **IA con evidencia:** cualquier explicación futura deberá citar métricas calculadas y respetar permisos por organización.
- **Diseño modular:** dashboards clásicos + módulos de People Intelligence.

## Stack inicial

- Next.js + React + TypeScript
- Tailwind CSS
- Recharts
- Lucide Icons
- Python/FastAPI + PostgreSQL planeados para la capa de datos y analítica

## Módulos del producto

1. Executive Pulse
2. Contexto y Muestra
3. Personal y Salarios
4. Beneficios
5. Indicadores / KPIs
6. Tabulador
7. Talent Acquisition
8. Retención y Rotación
9. Compensation Intelligence
10. Workforce Planning
11. Labor Relations & Risk
12. Benchmark Studio
13. Data Quality Center
14. What‑If / Workforce Digital Twin
15. AI HR Copilot

## Datos

La base histórica original **no debe subirse a este repositorio público**. Los archivos `.xlsx/.xls/.csv` dentro de `data/raw/` están excluidos por `.gitignore`.

## Estado

Proyecto en construcción para la competencia de dashboard dinámico de RH.

## Ejecutar la revisión auditada

Rama `codex/audit-and-responsive-review`, PR #15. Si aparece el tabulador de cinco puestos de demostración, se está ejecutando una versión anterior.

```sh
git clone --branch codex/audit-and-responsive-review https://github.com/ellieeeGB/RH-platform.git RH-platform-audit
cd RH-platform-audit
npm ci
npm run dev
```

Abre la dirección local que imprime Next.js, normalmente `http://localhost:3000`. Para detenerla, `Ctrl+C`. Los datos procesados ya están incluidos: no necesitas el Excel para explorar. `predev` verifica que todos los archivos correspondan a la misma edición.

## Actualizar datos y verificar

```sh
npm run data:extract -- "/ruta/BASE HISTORICA.xlsx"
npm run data:verify
npm test
npm run typecheck
npm run build
```

No ejecutes extractores individuales sobre `data/processed`: producirían archivos sin renovar el manifiesto. La extracción completa incluye el tabulador y espera las siete hojas y 40 compañías del estudio. Una nueva estructura requiere actualizar el contrato. Si se interrumpe una extracción, confirma que ya no siga ejecutándose antes de retirar su bloqueo `data/.data-pipeline.lock`.

Consulta [la auditoría](docs/repository-review.md) para ver correcciones, funciones y límites. Esta rama no actualiza automáticamente el Site privado. El copiloto actual responde mediante reglas y datos calculados.
