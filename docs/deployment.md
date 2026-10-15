# Compilación y publicación

## Dos modalidades

| Modalidad | Construcción | Ejecución |
| --- | --- | --- |
| Servidor Next.js | `npm run build` | `npm start` |
| Exportación estática | `npm run build:static` | Servir el directorio `out/` en un alojamiento estático. |

`build:static` establece `CATCH_STATIC_EXPORT=1` desde un script Node portable. `next.config.mjs` activa `output: "export"` y `trailingSlash`. Las rutas de lectura JSON usan `force-static`; no requieren servidor de datos.

No ejecutes `npm start` para servir la exportación estática. No subas `out/` ni `.next/` a Git.

## Flujo de entrega

1. Fusionar el trabajo verificado en `develop`.
2. Promover la versión acordada de `develop` a `main` mediante PR.
3. Construir exactamente el código que se publicará, con su lockfile y su edición de datos.
4. Publicar el artefacto en el alojamiento privado conservando la audiencia autorizada.
5. Confirmar estado de despliegue y revisar navegación, filtros, tabla, CSV y páginas principales.

La CI actual cubre verificación y compilación; no contiene credenciales ni un trabajo de despliegue. Un merge no actualiza por sí solo el sitio.

## Alojamiento actual en Sites

La URL privada es `https://catch-people-intelligence.boldbun6.chatgpt.site`. El servicio mantiene un repositorio de fuente de despliegue separado de GitHub. En ese checkout, `.openai/hosting.json` define el proyecto y `out/` como directorio estático; `.openai/source.json` identifica el commit y árbol de GitHub usados.

El flujo autorizado de Sites abre esa fuente, copia el código acordado, construye, guarda el commit y publica una versión privada. Esas operaciones requieren acceso al proyecto alojado. Las credenciales temporales no se guardan en este repositorio. No se deduce el estado del sitio a partir del estado de una rama: se verifica la publicación específica.

## Comprobación manual

- Recorrer Inicio, Agenda, Comparar y Reporte en escritorio y móvil.
- Confirmar menú activo y nombre de sección, incluso en URLs con barra final.
- Seleccionar una y varias compañías; probar historial y meses confirmados.
- Abrir el detalle de una celda y verificar fecha y compañía.
- Probar teclado, diálogos, tablas desplazables, CSV e impresión.
- Verificar que faltantes, ceros, unidades y cobertura se distingan.

La compilación estática y las pruebas automáticas no certifican el aspecto visual de todos los tamaños de pantalla.
