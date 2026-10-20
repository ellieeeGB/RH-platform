# Arquitectura y modelo de datos

FastAPI sirve API y HTML/JS/CSS del mismo origen. SQLAlchemy gestiona tablas, transacciones, parámetros e índices. SQLite es el almacenamiento local probado. Las tablas usan tipos portables; PostgreSQL requerirá driver, configuración y validación propias.

```mermaid
flowchart TD
  A["XLSX / CSV"] --> B["Encabezados y descarte de contactos"]
  B --> C["Diccionario y normalización"]
  C --> D["Vista previa de calidad"]
  D --> E["Confirmación transaccional"]
  E --> F["Hechos por empresa y bimestre"]
  F --> G["Consulta con permisos"]
  G --> H["Panel y reporte"]
  F --> I["Validación y atípicos"]
  I --> J["Revisión y bitácora"]
  J --> F
```

## Modelo implementado

```mermaid
erDiagram
  EMPRESAS ||--o{ HECHOS : tiene
  PERIODOS ||--o{ HECHOS : organiza
  IMPORTACIONES ||--o{ HECHOS : contiene
  USUARIOS ||--o{ SESIONES : abre
  USUARIOS ||--o{ AUDITORIA : registra
  IMPORTACIONES {
    int id PK
    string huella UK
    bool activa
    int revision
    json diccionario
    json perfil
  }
  HECHOS {
    int id PK
    int importacion_id FK
    string empresa FK
    string bimestre FK
    string metrica
    string dimension
    float valor
    string texto
    string estado
    string unidad
    string hoja
    int fila
    int columna
    bool excluido
  }
  USUARIOS {
    int id PK
    string nombre UK
    string hash
    string rol
    string empresa
  }
  AUDITORIA {
    int id PK
    string fecha
    string actor
    string accion
    json detalle
  }
```

La relación usuario–auditoría es lógica por nombre de actor, no una FK; también existen actores locales del CLI. La empresa del usuario determina el aislamiento del cliente. El HMAC se aplica en la representación, no sustituye la autorización.

Granularidad de HECHOS: empresa, bimestre, métrica, dimensión y celda de origen. Importación+hoja+fila+columna es único. Encabezados ambiguos se registran sin un valor utilizable para no colapsar dos respuestas bajo una misma métrica. Índice por empresa/bimestre/métrica y por importación.

No se crean tablas ficticias de empleados, cohortes o movimientos individuales: la encuesta no permite poblarlas. Las respuestas sobre puestos, vacantes, fuentes, beneficios y contratos son dimensiones de los hechos de encuesta. Los planes manuales se registran por separado como trabajo de seguimiento, nunca como respuestas inferidas del Excel. Si se obtiene un historial individual, se agregan tablas relacionadas con identidades privadas y hechos de entrada/salida.

## Versiones, operaciones y límites

- `migraciones.py` registra `version_esquema = 2`. Al abrir una base v1 crea las tablas de planes e historial y actualiza la versión; no reescribe hechos. Es idempotente. Las versiones desconocidas se rechazan. Respaldar antes de migrar.
- Se conserva cada importación. Confirmar una nueva desactiva la anterior dentro de la transacción.
- Vistas previas en memoria, no en navegador. No hay upload de archivos a terceros ni dependencias CDN.
- `/api/panel` consulta solo campos del núcleo; `/api/explorar` filtra métrica en SQL. Calidad y exportación necesitan más columnas; son operaciones apropiadas para el tamaño actual, no para millones de empleados.
- El despliegue soportado en esta versión es un proceso local. Escalado distribuido, trabajos en cola y almacenamiento compartido requieren implementación adicional.

## Seguimiento y presentación del cuestionario

`planes_vacantes` contiene importación, empresa, bimestre de origen, puesto, nivel, plazas, cubiertas, prioridad, estado, fecha objetivo, notas y acciones. `eventos_planes` conserva una instantánea de cada versión, con actor y fecha UTC; la combinación plan+revisión es única. La creación/edición y su auditoría se confirman juntas. Un `UPDATE` condicionado por revisión evita sobrescribir una edición concurrente. No hay borrado por API.

`catalogo.py` une el diccionario del estudio activo con títulos/temas de `presentacion_metricas.json`. La cobertura se agrega en SQL con el mismo alcance autorizado de empresa y periodo. Los metadatos no alteran valores, unidades, reglas de importación ni claves normalizadas. La interfaz usa `trabajo.js` para el tablero y el catálogo, junto con `app.js`.

La vista autónoma añade `demo.js`, que simula consultas con los CSV ficticios y guarda planes de prueba en almacenamiento local. Este adaptador nunca se carga en la aplicación servida por FastAPI.
