# Contrato de datos — Base histórica RH

## Perfil de la fuente

La base histórica entregada está organizada como una encuesta bimestral en formato **wide**: cada fila representa una compañía y cientos de columnas corresponden a respuestas, subpreguntas y opciones de selección.

Hojas detectadas:

| Periodo | Hoja |
|---|---|
| Jul–Ago 2024 | `JUL-AGO_2024` |
| Sep–Oct 2024 | `SEP-OCT_2024` |
| Nov–Dic 2024 | `NOV-DIC_2024` |
| Ene–Feb 2025 | `ENE-FEB_2025` |
| Mar–Abr 2025 | `MAR-ABR_2025` |
| May–Jun 2025 | `MAY-JUN_2025` |
| Jul–Ago 2025 | `JUL-AGO_2025` |

Hay **40 compañías presentes en los siete periodos**, por lo que la fuente permite análisis longitudinal por empresa además de benchmarking transversal.

## Principio de ingestión

El frontend nunca debe leer el Excel directamente. El pipeline actual ejecuta seis extractores en aislamiento, valida 280 registros y publica doce salidas junto a un manifiesto. El panel empresa-periodo conserva el formato por columnas; una futura capa de servidor puede normalizarlo como:

`archivo -> staging -> validación -> normalización -> métricas -> API`

## Dominios detectados

- Contexto de empresa y ubicación
- Headcount operativo y administrativo
- Composición por género y edad
- Salarios y bandas salariales
- Contratación y time-to-fill
- Fuentes de reclutamiento
- Motivos de rechazo
- Bajas y rotación
- Ausentismo e incapacidades
- Capacitación
- Vacantes futuras
- Prestaciones y beneficios
- Sindicato / contrato colectivo
- Riesgo laboral
- Outsourcing
- Practicantes y apoyos

## Reglas mínimas de calidad

Antes de publicar KPIs o usar registros para modelos:

1. `mujeres_pct + hombres_pct ≈ 100` cuando ambos sean porcentajes.
2. Las bandas salariales deben respetar `ingreso <= medio_bajo <= medio_alto <= máximo`, salvo justificación explícita.
3. Los componentes de contratación deben reconciliar con el total cuando existan todos los campos.
4. Las composiciones exhaustivas de antigüedad y edad deben estar completas y conciliar a 100% (tolerancia de cinco puntos). Los motivos de rechazo no son una composición exhaustiva y no se obliga a que sumen 100.
5. Headcount debe compararse contra el periodo previo mediante reglas de anomalía y no aceptar saltos extremos silenciosamente.
6. Valores de texto como `Desconocido`, `No aplica`, `-` y vacíos deben convertirse a estados explícitos; no a cero.
7. PII de contacto no debe entrar a tablas analíticas ni a prompts del copiloto.

## Arquitectura de permisos pendiente

La arquitectura propuesta para una futura capa de servidor debe incluir como mínimo:

- `organization_id`
- `company_id`
- `period_id`

Los endpoints futuros deben limitarse por organización. La aplicación actual distribuye JSON analíticos en el cliente; no implementa ese aislamiento. Exigir cinco respuestas para un benchmark mejora la interpretación, pero no restringe el acceso a los registros.

## Verificación vigente

El manifiesto de esquema 3 enumera exactamente las doce salidas esperadas. Desarrollo y compilación verifican sus hashes y la firma del código de extracción. Se reconcilian las tasas de bajas, ausencias e incapacidades y los conteos de altas y bajas en los siete periodos. Cambiar el Excel o la implementación exige una extracción completa; no se actualizan firmas manualmente.
