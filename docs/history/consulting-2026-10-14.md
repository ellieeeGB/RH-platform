> Documento histórico. Describe la revisión en esa fecha, no el estado actual. Consulta [la documentación vigente](../README.md).

# Revisión de consultoría · 14 de octubre de 2026

Base: `7cb57ca`, integración del PR #15. Se revisó el historial de los PR #4–15, la grabación `Screencast From 2026-10-14 09-01-30.webm` (5 min 33 s) y el Excel de la edición. Esta grabación ya muestra el estudio de decisiones; el problema pendiente era facilitar su lectura, no agregar otra copia del módulo.

## Alineación con Catch

Se consultaron los sitios oficiales:

- https://www.catchconsulting.com.mx/ — enfoque de medición, análisis y mejora.
- https://www.catchconsulting.com.mx/servicios/encuesta-monitor — indicadores, salarios, beneficios, atracción, rotación y ausentismo.
- https://www.catchconsulting.com.mx/servicios/mercado-laboral — comparación de compensación y prácticas entre compañías.
- https://www.catch-consulting.com/ — monitor bimestral y analítica aplicada a decisiones de RH.

La agenda conecta esos servicios con preguntas de una sesión de consultoría. No incorpora cifras comerciales del sitio como si pertenecieran a la muestra del Excel ni ofrece diagnósticos legales automatizados.

## Hallazgos corregidos

| Hallazgo | Corrección |
| --- | --- |
| Salarios y reporte usaban una referencia distinta al comparador. | Cuatro bandas completas, positivas y ordenadas; mismo grupo por banda, mínimo cinco respuestas, exclusión de la empresa elegida. Percentil y brecha usan ese mismo grupo. |
| La alerta de plantilla de un corte antiguo utilizaba bimestres posteriores. | Baseline con al menos tres cortes completos anteriores. Nunca se consulta el futuro para evaluar el corte elegido. |
| El verificador comprobaba integridad y totales, pero no el contrato completo de columnas y tipos. | Esquema compartido con extracción, campos y orden exactos, conteos enteros, tipos booleanos/texto y rangos explícitos. |
| Doce porcentajes inválidos atravesaban el pipeline. | COMPAÑIA 7: KS9, KU9 y KW9 = 1056; KV9 = 1010 en Jul–Ago, Sep–Oct y Nov–Dic 2024. Se verificaron en el Excel. Los valores analíticos pasan a null; cada panel conserva empresa, celda, valor original y motivo en `issues`. Calidad los muestra como revisión, incluso si también faltan otros componentes. No se adivinan decimales. |
| Las explicaciones del estudio requerían vocabulario estadístico. | Guía de tres pasos, lectura de ejes y explicación del cambio de tasas y tamaño en lenguaje de consulta. El método completo permanece desplegable. |
| Dos implementaciones se mantenían por separado. | Exportación estática de esta aplicación Next.js para el Site privado. CI construye la misma variante que se publica. |

La regeneración conserva el SHA-256 del Excel y nueve de las doce salidas. Cambian únicamente los tres paneles históricos con las respuestas excluidas y el manifiesto. Los 280 registros, 40 códigos y siete bimestres permanecen. La fuente cruda y la salida privada no se incorporan a Git.

## Agenda de consultoría

Ruta `/agenda`, disponible desde Inicio y el menú.

1. **Lectura del bimestre.** Resume las señales repetidas y la primera solicitud de información. Se adapta a compañía y periodo.
2. **Persistencia.** Ventana de tres cortes terminada en la selección. Para cada indicador se intersectan una sola vez los códigos con numerador válido y plantilla completa positiva en todos los cortes. La tasa es suma de eventos / suma de plantilla × 100. Mercado exige cinco empresas; una empresa seleccionada requiere su propia respuesta. Dos incrementos o descensos consecutivos se describen como repetición, no como pronóstico o efecto causal. La opción de excluir saltos usa las alertas disponibles en la ventana y nunca modifica la fuente.
3. **Recuperación de cobertura.** Ordena compañías por número de análisis que podrían completarse y después por menor cantidad de campos pendientes. Usa bajas, vacantes y ausencias. Cero explícito no es ausencia. Plantilla cero o valores existentes inválidos requieren revisión y no se prometen como recuperables. El aumento potencial depende de respuestas válidas y afecta al corte actual, no automáticamente a toda la ventana. Exporta la solicitud a CSV; no envía mensajes.
4. **Reunión y seguimiento.** Agenda imprimible y enlaces a la bitácora y reporte. Se conserva la evidencia original de las acciones guardadas por la edición estática anterior (`catch.actions.v1`), con edición, exportación y requisito de resultado antes de completarlas. Se recuperan filtros anteriores y enlaces por hash conocidos.

## Validación y límites

- 65 pruebas automatizadas: contrato, cuarentena, porcentajes, cohortes, falta de datos frente a cero, descomposición, persistencia, exclusión propia, recuperación de cobertura, integridad y conservación de edición ante fallo.
- Prueba DOM con React y jsdom: cambios de empresa y periodo, ventana insuficiente, expansión de solicitudes, invocación de impresión y persistencia/completado de acciones anteriores. No equivale a un navegador real.
- TypeScript y exportación de producción. No se realizó QA visual interactiva de escritorio/móvil: el entorno no ofrece el controlador de navegador requerido por Sites. Se inspeccionó la grabación del usuario; no se atribuye esa imagen a los cambios nuevos. La impresión tiene estilos, pero su paginado no se verificó visualmente.
- La plataforma mantiene acceso privado del Site. Los códigos analíticos se distribuyen al navegador autorizado; no hay aislamiento por empresa en servidor ni sincronización multiusuario de la bitácora.
- El asistente sigue siendo guiado por reglas. Las nuevas lecturas se calculan de forma determinista; no se presentan como un modelo generativo ni como predicciones.

## Reproducción

```sh
npm ci
npm run data:verify
npm test
npm run typecheck
npm run build:static
```

Para regenerar: `npm run data:extract -- "/ruta/BASE HISTORICA.xlsx"`. El orquestador conserva la generación previa si falla; no se ejecutan extractores individuales sobre la edición publicada. La exportación usa `out/`; los API GET son estáticos. Los permisos y la identidad del Site se mantienen en su checkout de despliegue.
