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
