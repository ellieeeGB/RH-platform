# Arquitectura inicial

## Capas

1. **Experience Layer** — Next.js, dashboards, filtros, reportes y AI Copilot.
2. **Metrics Layer** — definiciones únicas de KPIs y reglas de cálculo.
3. **Analytics Layer** — tendencias, anomalías, modelos explicables y escenarios What-If.
4. **Data Layer** — PostgreSQL multi-tenant + importadores desde las bases bimestrales.
5. **Governance Layer** — permisos, auditoría, privacidad de benchmark y calidad de datos.

## Dashboards que deben preservarse

- Contexto y Muestra
- Personal y Salarios
- Beneficios
- Indicadores / KPI
- Tabulador

Los módulos anteriores no desaparecen: se rediseñan y comparten filtros, definiciones y benchmarking con la nueva capa de People Intelligence.

## Próxima estructura de datos

- organizations
- companies
- periods
- workforce_metrics
- compensation_metrics
- hiring_metrics
- turnover_metrics
- absence_metrics
- training_metrics
- vacancy_metrics
- benefits
- labor_relations
- recruiting_sources
- data_quality_events

## Reglas de seguridad

- Nunca commitear archivos crudos de clientes.
- Separación por organización/tenant.
- RBAC en aplicación y Row Level Security en base de datos.
- Benchmarks agregados con umbral mínimo de cohort.
- Toda respuesta de IA debe respetar el mismo scope de autorización que el dashboard.
