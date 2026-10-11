# Metric Registry

Las fórmulas aquí son el contrato del producto. La interfaz no debe recalcularlas de forma independiente.

## Workforce growth

`(headcount_t - headcount_t-1) / headcount_t-1 * 100`

Uso: tendencia de crecimiento/contracción entre bimestres.

## Rotación bimestral

`bajas / ((headcount_inicio + headcount_fin) / 2) * 100`

El denominador usa headcount promedio para evitar sesgo por crecimiento durante el periodo.

## Hiring pressure

`vacantes_futuras / headcount_actual * 100`

Permite comparar demanda futura entre compañías de tamaños distintos.

## Early attrition share

`bajas_0_90_dias / bajas_totales * 100`

Señala problemas de selección, expectativas, onboarding o adaptación temprana.

## Training intensity

`horas_capacitacion / headcount`

Unidad: horas por colaborador durante el periodo.

## Salary index

`salario_empresa / salario_benchmark * 100`

Interpretación: 100 = mediana/valor de referencia del cohort; <100 por debajo; >100 por encima.

## Salary progression

`salario_maximo / salario_ingreso`

Describe la amplitud relativa de la banda salarial.

## Data Quality Score

Score de 0–100 construido a partir de reglas aprobadas, advertencias y errores críticos. Los errores críticos tienen un peso superior porque pueden invalidar KPIs o modelos posteriores.

## Métricas futuras

- Recruitment Difficulty Score
- Retention Risk Score
- Benefits Competitiveness Index
- Labor Risk Index
- Talent Availability Index
- Workforce Sustainability Score

Las métricas compuestas deberán publicar pesos, transformaciones y versión de fórmula para evitar cajas negras.
