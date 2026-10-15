# RH Platform · People Intelligence

Dashboard de consultoría de Recursos Humanos para el proyecto de Catch Consulting. Convierte una encuesta histórica en comparaciones entre empresas, indicadores con cobertura visible y seguimiento de decisiones.

**Datos incluidos:** 40 compañías codificadas, 7 bimestres entre julio–agosto de 2024 y julio–agosto de 2025, y 280 registros empresa-periodo. Es un estudio histórico: no contiene información en tiempo real.

## Qué puedes hacer

- Consultar personal, salarios, contratación, bajas, beneficios, vacantes y relaciones laborales.
- Comparar una, varias o todas las compañías y seleccionar bimestres, historial o meses con datos confirmados.
- Explorar cambios con las mismas empresas, aportaciones individuales y sensibilidad de los resultados.
- Revisar datos faltantes, valores por confirmar y solicitudes de información prioritarias.
- Registrar hipótesis con evidencia y consultar escenarios aritméticos de contratación y compensación.
- Descargar comparaciones, evidencia y seguimientos; imprimir reportes y agendas.

## Ejecutarlo en tu computadora

Necesitas **Node.js 24** y npm. La versión está declarada en [.nvmrc](.nvmrc); si utilizas nvm, ejecuta `nvm install` y `nvm use` dentro del proyecto.

```bash
git clone --branch develop https://github.com/ellieeeGB/RH-platform.git
cd RH-platform
npm ci
npm run dev
```

Abre `http://localhost:3000` o el puerto que indique la terminal. Detén el servidor con `Ctrl+C`. No necesitas el Excel ni credenciales de API: la edición procesada está incluida. `predev` verifica su integridad antes de arrancar.

Para actualizar una copia existente, guarda primero tus cambios y ejecuta:

```bash
git switch develop
git pull --ff-only origin develop
npm ci
```

## Estructura

| Carpeta | Responsabilidad |
| --- | --- |
| [`src/app`](src/app) | Páginas, rutas HTTP, layout raíz y estilos globales de Next.js. |
| [`src/components/layout`](src/components/layout) | Marco de navegación, menú lateral, barra superior y encabezados. |
| [`src/components/filters`](src/components/filters) | Selección de compañías y periodos; persistencia de filtros. |
| [`src/components/charts`](src/components/charts) | Gráficas de los módulos operativos. |
| [`src/components/analysis`](src/components/analysis) | Comparaciones, lecturas, agenda, asistente, simulador y seguimientos. |
| [`src/components/ui`](src/components/ui) | Tarjetas de indicadores y guía de lectura. |
| [`src/lib`](src/lib) | Acceso al panel, reglas estadísticas, comparaciones y lógica del producto. |
| [`scripts`](scripts) | Extracción, contratos, verificación y compilación estática. |
| [`data/processed`](data/processed) | Edición analítica validada y manifiesto de integridad. |
| [`tests`](tests) | Pruebas de cálculos, cohortes, calidad, navegación y pipeline. |
| [`docs`](docs) | Guías vigentes, métodos y auditorías históricas identificadas. |

No hay backend Python, PostgreSQL ni modelo generativo conectado. La aplicación usa Next.js, React, TypeScript, Tailwind, Recharts y ExcelJS. Las dependencias reproducibles están en `package-lock.json`.

## Comandos principales

| Comando | Resultado |
| --- | --- |
| `npm run dev` | Desarrollo local, con verificación previa de datos. |
| `npm run check` | Imports y documentación, integridad de datos, tipos y pruebas. |
| `npm run verify` | Todo lo anterior y compilación estática de producción. |
| `npm run build:static` | Verifica datos y genera `out/`. |
| `npm run build` | Compila para ejecución con servidor Next.js. |
| `npm start` | Ejecuta el resultado de `npm run build`; no sirve `out/`. |
| `npm run data:extract -- "/ruta/BASE.xlsx"` | Regenera la edición completa desde el Excel autorizado. |
| `npm run data:verify` | Comprueba firma del código, archivos y coherencia de la edición. |

## Entender y estudiar el proyecto

Empieza por la [guía de estudio](docs/study-guide.md). Después consulta:

1. [Arquitectura real](docs/architecture.md): cómo se conectan interfaz, datos y cálculos.
2. [Pipeline de datos](docs/pipeline.md): entrada, seis extractores, validación y recuperación ante fallos.
3. [Registro de métricas](docs/metric-registry.md): fórmulas implementadas, unidades y límites.
4. [Desarrollo, ramas y CI](CONTRIBUTING.md): cómo proponer y verificar cambios.
5. [Índice completo de documentación](docs/README.md).

## Ramas y publicación

`develop` integra el trabajo en desarrollo; `main` conserva las versiones promovidas. Los cambios se proponen mediante PR a `develop` y se validan antes de promoverlos a `main`. La limpieza de esta entrega se integra en `develop`.

La CI verifica el código; **no publica el sitio automáticamente**. La publicación privada usa una exportación de esta misma aplicación y una fuente de despliegue separada. Consulta el [procedimiento de publicación](docs/deployment.md).

## Alcance y límites

- Los códigos de empresa reducen identificación directa, pero los JSON por compañía se entregan al navegador. No hay aislamiento de datos por cliente u organización dentro de la aplicación.
- El Excel crudo queda fuera de Git. No se deben subir contactos, credenciales ni respuestas identificables adicionales.
- La bitácora y los filtros se guardan en el navegador; no se sincronizan entre personas. Descarga los seguimientos que quieras conservar.
- El asistente usa reglas y cálculos verificables. Los escenarios no son pronósticos ni estimaciones causales.
- Los faltantes no se convierten en cero. Las comparaciones longitudinales mantienen un grupo fijo; cada gráfica declara su alcance.
- El desglose mensual de bajas está confirmado solo para julio y agosto de 2024 y de 2025.

La revisión visual en navegador es una comprobación adicional: la compilación y las pruebas de datos no la sustituyen.
