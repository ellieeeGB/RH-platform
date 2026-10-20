# Auditoría del pipeline y del repositorio

Revisión del 20 de octubre de 2026. Alcance: ejecución local con SQLite, datos ficticios y Excel real aportado, sin modificar la base privada de trabajo ni desplegar un sitio público.

## Problemas corregidos

| Hallazgo | Cambio |
|---|---|
| El mismo Excel se rechazaba incluso con un diccionario corregido. | Huella de archivo + mapeo efectivo, con compatibilidad para huellas antiguas. Reimportación versionada y duplicados reales bloqueados. |
| Cabeceras CSV vacías podían heredar la pregunta anterior. | Misma regla de corte de herencia para cadenas vacías, espacios y celdas XLSX vacías. |
| Una hoja sin empresas o un archivo sin métricas podía llegar a activación. | Rechazo antes de sustituir el estudio activo; control adicional en persistencia. |
| Algunos errores del diccionario se ignoraban al leer JSON. | Validación explícita de campos editables, tipos, longitudes, unidades y acciones. |
| Las filas sin empresa desaparecían del detalle de calidad. | Incidencias visibles para consultoría, filtradas por bimestre; nunca atribuidas a un cliente. |
| El filtro de una empresa impedía evaluar atípicos temporales; el filtro de bimestre cortaba su historial. | Comparación temporal independiente del mínimo del IQR; historial completo autorizado en la vista de calidad. |
| Un mismo alias/dimensión con unidades distintas podía agregarse conjuntamente. | Desgloses separados por dimensión y unidad. |
| Las duraciones Excel tipadas omitían controles de rango. | Rechazo de duraciones negativas y horas del día fuera de 0–24; duraciones totales mayores a 24 h permitidas. |
| No había comprobación automática de entrega HTML desactualizada. | `make verificar` falla si el HTML no coincide con el generador; actualizar con `make vista`. |
| Dependencias y documentación de desarrollo mezcladas con ejecución. | Dependencias de pruebas separadas; NumPy eliminado por no utilizarse; índice de documentación y comandos consistentes. |

También se cerró explícitamente el libro XLSX al terminar la lectura y se aislaron las vistas previas en cada instancia de la aplicación.

## Recorrido comprobado

1. Importación XLSX de dos encabezados, esquema reordenado entre hojas y preguntas nuevas; CSV equivalente.
2. Descarte de columnas privadas, limpieza explícita, ceros/faltantes y validación de desgloses.
3. Vista previa sin escrituras; confirmación transaccional en base temporal.
4. Panel, filtros, catálogo completo, exploradores, calidad, exportación y reporte desde la API real.
5. Exclusión y restauración auditadas; conservación del historial de atípicos al filtrar.
6. Reimportación con diccionario corregido, bloqueo de duplicados y compatibilidad con registros anteriores.
7. CLI de perfilado/importación, permisos de cliente, CSRF, planes de vacantes e historial.
8. Interfaz, enlaces del repositorio, sintaxis, dependencias instaladas y sincronización del HTML ficticio.

Las pruebas reales requieren `RH_TEST_EXCEL`; se ejecutan en una base temporal y no se guardan resultados privados en el repositorio. Los tests sintéticos permiten reproducir el resto sin disponer del archivo real.

## Reproducir

### Resultado de esta ejecución

| Comprobación | Resultado |
|---|---|
| Suite Python con Excel privado | 87 pruebas correctas; 36,54 s |
| Suite JavaScript | 22 pruebas correctas; ninguna omitida |
| Estructura, enlaces, diccionarios y HTML reproducible | Correcto |
| Sintaxis Python, JavaScript y script de inicio | Correcto |
| Compatibilidad de dependencias instaladas (`pip check`) | Sin incompatibilidades |

Las 87 pruebas incluyen dos integraciones opcionales con el Excel privado. Sin ese archivo, se omiten esas dos pruebas. Se mantiene una advertencia de deprecación de TestClient/httpx y el aviso de Happy DOM por evaluación del JavaScript local; no hubo fallos. Esta ejecución utilizó SQLite temporal y no alteró la base privada de trabajo.

```bash
.venv/bin/pip install -r requirements-dev.txt
npm ci
make test
RH_TEST_EXCEL='/ruta/BASE HISTORICA.xlsx' make test
```

`make test` ejecuta primero la verificación de estructura, configuración, enlaces, HTML y sintaxis; después Python y JavaScript. GitHub Actions usa ese mismo comando con `PYTHON=python`. Los datos privados no están disponibles en CI: allí se omiten sus pruebas opcionales.

## Organización conservada

`aplicacion/` contiene backend y reglas; `web/` contiene interfaz; `configuracion/` contiene diccionarios editables; `datos_demo/` solo datos ficticios; `pruebas/` validaciones; `scripts/` tareas reproducibles; `documentacion/` guías y una sola vista HTML. Las exportaciones y bases locales permanecen ignoradas por Git. No se borraron documentos funcionales ni entregables útiles por motivos estéticos.

## Límites

La verificación de archivos versionados comprueba rutas y extensiones; no equivale a un escaneo de secretos de todo el historial. `pip check` comprueba compatibilidad instalada, no ausencia de vulnerabilidades. Sigue pendiente la inspección visual en navegador real, PostgreSQL, una auditoría externa de seguridad y un despliegue de producción. Las pruebas DOM no comprueban píxeles ni certifican accesibilidad.
