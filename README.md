# RH Platform — People Intelligence

Plataforma moderna de People Analytics para transformar reportes bimestrales de RH en decisiones accionables.

## Visión

Mantener los dashboards operativos y de benchmarking que ya utiliza el negocio —contexto y muestra, personal y salarios, beneficios, indicadores, tabulador y KPIs— y añadir una capa de inteligencia con tendencias históricas, alertas, calidad de datos, escenarios What‑If y un copiloto de IA con trazabilidad.

## Principios

- **Decisiones antes que gráficas:** cada dashboard debe responder qué pasó, por qué importa y qué acción conviene evaluar.
- **KPIs verificables:** las fórmulas viven en una capa de métricas reusable, no embebidas en componentes visuales.
- **Alcance explícito:** Excel crudo fuera del repositorio; panel analítico por códigos incluido en el cliente. Los permisos por organización requieren una capa de servidor.
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
15. Asistente de análisis guiado
16. Estudio de decisiones y bitácora
17. Agenda de consultoría: persistencia, recuperación de cobertura y sesión imprimible

## Datos

La base histórica original **no debe subirse a este repositorio público**. Los archivos `.xlsx/.xls/.csv` dentro de `data/raw/` están excluidos por `.gitignore`.

## Estado

Proyecto en construcción para la competencia de dashboard dinámico de RH.

## Ejecutar la revisión auditada

La base auditada se integró en el PR #15. El menú incluye **Agenda de consultoría** y **Estudio de decisiones**: mapa entre pares, descomposición de tasas y bitácora de hipótesis. Si no aparece, actualiza tu copia local.

```sh
git clone https://github.com/ellieeeGB/RH-platform.git RH-platform-audit
cd RH-platform-audit
npm ci
npm run dev
```

Abre la dirección local que imprime Next.js, normalmente `http://localhost:3000`. Para detenerla, `Ctrl+C`. Los datos procesados ya están incluidos: no necesitas el Excel para explorar. `predev` verifica los archivos y el código de extracción contra el manifiesto de la edición.

## Actualizar datos y verificar

```sh
npm run data:extract -- "/ruta/BASE HISTORICA.xlsx"
npm run data:verify
npm test
npm run typecheck
npm run build
```

No ejecutes extractores individuales sobre `data/processed`: producirían archivos sin renovar el manifiesto. La extracción completa incluye el tabulador y espera las siete hojas y 40 compañías del estudio. Una nueva estructura requiere actualizar el contrato. Si se interrumpe una extracción, confirma que ya no siga ejecutándose antes de retirar su bloqueo `data/.data-pipeline.lock`.

Consulta [la auditoría](docs/repository-review.md) y [el estudio de decisiones](docs/decision-study.md) para ver métodos y límites. El Site privado usa la exportación de esta aplicación; actualizar GitHub requiere publicar también esa exportación. El asistente actual responde mediante reglas y datos calculados; no está conectado a un modelo generativo.

La bitácora se guarda en localStorage de este navegador; su descarga JSON incluye evidencia y seguimiento. No se comparte entre usuarios ni sincroniza con una base de datos. Los JSON analíticos por compañía se distribuyen con el cliente web: los umbrales de muestra son criterios estadísticos de presentación, no un sistema de autorización.

## Agenda y publicación estática

Consulta [la revisión de consultoría](docs/consulting-review-2026-10-14.md). `npm run build:static` verifica la edición y genera `out/` con todas las rutas de la plataforma. CI valida esta variante. `npm run build` conserva la compilación habitual de Next.js.

Los porcentajes de rechazo fuera de rango se conservan como evidencia de revisión y se excluyen de las cifras analíticas, sin corregirlos por suposición. Los filtros y acciones de la edición alojada anterior se recuperan desde el navegador del propietario.
