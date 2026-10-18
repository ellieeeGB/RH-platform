# Descubrimiento del archivo real

La revisión se hizo sobre el Excel proporcionado, no sobre datos sintéticos. Contiene siete hojas bimestrales, 40 códigos de empresa por hoja y dos filas de encabezado. Ancho: 1,142 columnas en las primeras cinco hojas, 1,158 en la sexta y 1,169 en la última. Hay cuatro filas finales de relleno sin empresa.

## Hallazgos de estructura

- El cambio de ancho incluye columnas con datos sin texto de encabezado. No basta con heredar la última pregunta.
- Varias subopciones se repiten dentro de la misma pregunta. Deben aclararse, no sumarse.
- Hay ceros numéricos reales, guiones, N/A, desconocidos, pendientes, intervalos y horarios en distintos formatos.
- Algunas composiciones de porcentaje usan fracciones sin formato de celda que confirme su escala. Se reportan ambiguas hasta declarar una regla de conversión.
- Las preguntas conservan referencias a años anteriores. El año de la hoja no cambia automáticamente el año al que se refiere una pregunta.
- Los identificadores de empresa sirven para un panel agregado. No existen filas de empleados ni fechas individuales de alta/baja.

## Resultados privados reproducibles

Los datos reales, tasas, comparaciones y códigos de empresas con incidencias se generan en `privado/` y no forman parte del repositorio público.

```bash
.venv/bin/python -m aplicacion.cli perfilar '/ruta/BASE HISTORICA.xlsx'
.venv/bin/python scripts/reporte_privado.py '/ruta/BASE HISTORICA.xlsx'
RH_TEST_EXCEL='/ruta/BASE HISTORICA.xlsx' .venv/bin/python -m pytest pruebas -q
```

El primer comando produce perfil, incidencias, diccionario y modelo largo. El segundo genera diez hallazgos con evidencia, cobertura, análisis de sensibilidad y límites en `privado/reporte_rh.md`. La prueba opcional confirma lectura de los siete periodos, llaves, exclusión de contactos y detección de atípicos sin distribuir el Excel.

## Referencia visual

Se revisaron las cinco capturas: Contexto y Muestra, Personal y Salarios, Indicadores, Tabulador e Inicio. La nueva interfaz conserva sus preguntas de negocio y añade calidad visible, filtros globales, consulta hasta la celda y comparaciones con n. La descripción de fortalezas/debilidades está en DESIGN.md.

No se reutilizan las capturas en el código o en la presentación: contienen personas y datos de la reunión que no hacen falta para el producto.
