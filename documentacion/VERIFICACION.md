# Verificación de la entrega

Fecha: 18 de octubre de 2026. Entorno: Python 3.12, SQLite y Node para comprobar sintaxis JavaScript.

## Resultado

Se ejecutó la suite completa con el Excel privado: **57 pruebas correctas**. Incluye importación real de siete bimestres y 280 combinaciones empresa–bimestre, detección de atípicos, reglas de limpieza, cálculos, permisos, sesiones, aislamiento de clientes y ajustes auditados.

```bash
RH_TEST_EXCEL='/ruta/BASE HISTORICA.xlsx' .venv/bin/python -m pytest pruebas -q
node --check web/app.js
```

La ejecución produjo una advertencia de deprecación del adaptador httpx de TestClient; no hubo errores. En CI, la prueba que requiere el Excel privado se omite porque ese archivo no se distribuye. Las otras 56 pruebas usan datos ficticios.

También se verificaron mediante TestClient los filtros, el panel, la calidad, el explorador y el reporte contra la base importada. La presentación de cinco diapositivas se renderizó y revisó visualmente.

## Límites de esta comprobación

- No se realizó revisión visual del sitio en un navegador ni pruebas de accesibilidad con lector de pantalla. Siguen pendientes las resoluciones 375, 768, 1024 y 1440 px.
- No se comprobó PostgreSQL ni un despliegue en producción. No hay un sitio público desplegado como parte de esta entrega.
- Las pruebas de seguridad cubren controles concretos; no sustituyen una auditoría independiente ni demuestran anonimato formal del benchmark.
- Aprobar una prueba no resuelve las ambigüedades del cuestionario: deben revisarse con su propietario.

Los siguientes pasos están en [SIGUIENTE_FASE.md](SIGUIENTE_FASE.md).

## Rediseño narrativo

La regresión de Python después del rediseño pasó: **56 pruebas correctas y una omitida** porque el archivo privado es opcional. La integración del Excel ya se había comprobado en la entrega inicial (57 correctas); este cambio no modifica el importador ni el backend.

Se añadieron **15 pruebas JavaScript**, todas correctas: ocho de cálculos descriptivos y siete de interacciones en DOM. Comprueban las mismas empresas en la evolución, ceros/faltantes, sensibilidad sin mutación, navegación, filtros, matriz temporal, trayectorias, explorador, paginación, presentación, agenda y escenario.

```bash
npm ci
.venv/bin/python scripts/generar_vista.py
npm test
```

Happy DOM evalúa únicamente el código local de la interfaz y la vista ficticia. Su advertencia sobre evaluación JavaScript no implica que se hayan abierto páginas externas. No se utiliza para renderizar capturas ni se reporta como revisión visual de navegador.

La vista autónoma es un artefacto reproducible con datos ficticios. La revisión visual real en las cuatro resoluciones sigue pendiente.
