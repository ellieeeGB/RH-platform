# Desarrollo y contribuciones

## Preparación

Usa Node 24, declarado en `.nvmrc`, y `npm ci`. Trabaja desde la raíz del repositorio. El [README](README.md) explica cómo iniciar la aplicación y la [guía de estudio](docs/study-guide.md) cómo recorrer el código.

## Flujo de ramas

- `develop`: integración de cambios en desarrollo.
- `main`: versiones promovidas para publicación.
- `feat/…`, `fix/…`, `chore/…` o `docs/…`: trabajo acotado desde `develop`.

```bash
git switch develop
git pull --ff-only origin develop
git switch -c fix/descripcion-breve
# Realizar el cambio.
npm run verify
git add ruta/del/archivo
# Revisar qué se va a incluir.
git diff --cached
git commit -m "fix: describir el problema resuelto"
git push -u origin fix/descripcion-breve
```

Abre un PR con destino **develop**. Su descripción debe explicar problema, resultado, validación y límites. Revisa que la CI pase antes de fusionar. Para liberar una versión, abre un PR de `develop` a `main`; después publica el artefacto de ese código. No mezcles ramas antiguas solo porque su nombre parezca pendiente: algunas se integraron mediante squash o fueron sustituidas por otros PR.

No se reescribe el historial compartido. Si hay cambios locales, consérvalos en un commit o stash antes de cambiar de rama. No uses `reset --hard` como procedimiento normal de actualización.

## Pipeline de integración continua

El workflow [ci.yml](.github/workflows/ci.yml) se ejecuta en pushes a `main`/`develop`, PR a esas ramas y ejecución manual. Usa la misma versión de Node que desarrollo y dependencias del lockfile.

1. Instalar con `npm ci`.
2. Comprobar imports, enlaces de documentación y componentes alcanzables desde la aplicación.
3. Verificar la edición procesada y su firma.
4. Comprobar TypeScript, incluidos locales y parámetros sin uso.
5. Ejecutar pruebas de regresión.
6. Compilar todas las rutas para `out/`.

`npm run verify` ejecuta la secuencia equivalente localmente. La verificación de datos se repite automáticamente antes de compilar para proteger también a quien usa `build:static` por separado. CI no recibe el Excel, no extrae datos privados y no despliega producción.

## Dónde hacer cada cambio

| Cambio | Ubicación |
| --- | --- |
| Página o ruta | `src/app/<ruta>` |
| Navegación y encabezados | `src/components/layout` |
| Selección y persistencia de filtros | `src/components/filters` y `src/lib/comparison-selection.ts` |
| Gráfica operativa | `src/components/charts` |
| Interacción analítica | `src/components/analysis` |
| Cálculo o criterio estadístico | `src/lib`, con prueba en `tests` |
| Fuente, tipos o unidades | `scripts/lib` y extractor correspondiente |
| Método o decisión de diseño | Documento vigente en `docs` |

Usa imports `@/components/...` entre grupos. Las dependencias puras de `src/lib` permanecen independientes de React. Antes de eliminar un archivo revisa imports, pruebas, rutas HTTP, comandos, estilos dinámicos y referencias documentales. El chequeo automático encuentra módulos huérfanos, pero no demuestra por sí solo que cada export esté usado.

## Pruebas que aportan valor

- Cálculos: cero, faltante, denominador inválido, cambios de cohortes y unidades.
- Datos: no sustituir anclajes sin explicar la diferencia con la fuente.
- Navegación: selección de compañía y periodo, detalle de una celda, menú activo.
- Cambios visuales: revisar escritorio y móvil; teclado, tablas desplazables y contraste.
- Exportaciones: confirmar que incluyen la misma selección de la pantalla.

La prueba de extracción fallida imprime intencionalmente un error de hoja ausente y luego debe pasar. Ese mensaje aislado no indica que la suite completa haya fallado; revisa el resumen y el código de salida.

## Antes de compartir

Revisar el diff y evitar archivos de `.next`, `out`, `node_modules`, cachés, Excel crudo, credenciales y notas privadas. Los datos procesados sí forman parte del repositorio: permiten reproducir la aplicación sin acceso a la fuente privada. El historial de auditorías se conserva en `docs/history` con su fecha y alcance.
