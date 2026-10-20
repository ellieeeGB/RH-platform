# Catch · People Intelligence

Plataforma de consultoría RH en español. Convierte la encuesta bimestral de empresas en datos trazables, un panel interactivo y un reporte imprimible. Este es el repositorio **rh**; no modifica el proyecto anterior RH-platform.

## Ver el rediseño

Abre [la vista previa interactiva](documentacion/catch_rh_panorama_v3.html) para explorar el diseño sin instalar. Usa **datos ficticios** y guarda los planes de prueba en ese navegador; la aplicación utiliza la misma interfaz con el estudio que importes. [Qué cambió](documentacion/REDISENO_VISUAL.md).

## Empezar en tres pasos

Necesitas Python 3.12, acceso a Internet para instalar dependencias la primera vez y una terminal.

```bash
git clone https://github.com/ellieeeGB/rh.git
cd rh
bash iniciar.sh
```

En el primer inicio se generan secretos locales y se pide crear una contraseña para `administrador`. Abre **http://127.0.0.1:8000** y entra con ese usuario. No hay contraseñas predeterminadas. El script escucha solo en tu computadora.

Si ya tienes `.venv` pero faltan dependencias: `.venv/bin/pip install -r requirements.txt`.

1. Pulsa **Cargar estudio** en la barra superior; selecciona el Excel con las siete hojas. La aplicación revisa encabezados, empresa, periodos y calidad antes de guardar.
2. Lee la vista previa y confirma **activar este estudio**. La importación sustituye el estudio activo completo; conserva importaciones anteriores y la bitácora. No es una carga incremental.
3. Abre **Calidad de datos**. Revisa los atípicos antes de interpretar las tasas. Para una corrección, indica valor, motivo y evidencia; para excluir, no se borra la fuente normalizada.

Para probar sin información real:

```bash
.venv/bin/python -m aplicacion.cli demo
```

Eso activa un estudio **ficticio** con 8 empresas y 7 bimestres, generado con semilla 2026. Si ya cargaste datos reales, no ejecutes demo salvo que quieras cambiar el estudio activo. Los CSV demo tienen el mismo esquema ancho de dos encabezados.

## Qué funciona

- Acceso con Argon2, JWT en cookie httpOnly, renovación rotatoria, cierre revocable, CSRF, bloqueo y límites de peticiones.
- Administrador, analista y cliente. El cliente consulta y planifica únicamente para su empresa; el filtro se aplica en el servidor. Sus pares se consultan únicamente como benchmark agregado con al menos 5 empresas válidas.
- XLSX o CSV de dos encabezados. Mapeo por texto de pregunta + subopción, diccionario JSON editable, columnas nuevas conservadas, columnas sin encabezado reportadas sin asignaciones inventadas.
- Modelo largo con valor, estado de limpieza, unidad y coordenada de origen. Contactos descartados antes de crear registros.
- Rotación y plantilla, altas/bajas, antigüedad y edad de las bajas, fuentes, vacantes, tiempos, capacitación, ausentismo, negociación, salarios y prestaciones. Todas las preguntas importadas son explorables, con títulos cortos y acceso a cada pregunta original.
- Vacantes y acciones: puestos pendientes, plazas cubiertas, prioridad, fecha objetivo, notas y tareas con área a cargo. Guardado en base, historial por versión y protección ante ediciones simultáneas.
- Todo el estudio: catálogo buscable de las 183 métricas del diccionario, 11 temas y cobertura de respuestas según los filtros. Títulos cortos editables sin alterar la pregunta original.
- Movimiento breve en gráficas, tarjetas y diálogos, con control manual y respeto de la preferencia de accesibilidad del sistema.
- Panorama visual compacto: indicadores, evolución junto al balance, motivos de salida, vacantes declaradas y cobertura. Accesos directos al seguimiento y al detalle, sin una tarjeta de portada. Agenda de consultoría, mapa empresa–bimestre y exploradores con barras y categorías.
- Filtros de empresa múltiple y bimestres; todos los periodos; variación anterior/interanual con empresas pareadas; vista guardada localmente, tema oscuro, historia, consultas por intención y escenario aritmético.
- Calidad visible, historial gráfico de atípicos, sensibilidad con/sin una empresa, exclusión/corrección auditada y control de cambios concurrentes.
- Exportación CSV neutralizada y reporte HTML con portada, índice, secciones y metodología. Abre Reporte y usa Imprimir → Guardar como PDF.

## Qué no se afirma

La base contiene empresas y bimestres, **no expedientes de empleados**. No permite calcular supervivencia individual, riesgo por persona, embudo de reclutamiento completo, brecha salarial ajustada o causalidad. Tampoco permite confirmar estacionalidad con siete bimestres. Los campos no disponibles se documentan; no se rellenan con datos inventados.

El escenario de seis meses es persistencia del último dato, con error retrospectivo de un paso. No tiene un intervalo predictivo calibrado. El IC de benchmark es un bootstrap descriptivo de empresas, no una garantía de representatividad de toda la industria.

Esta entrega **no está desplegada en Internet**. Se probó mediante API, cálculos, comprobación de sintaxis e interacciones en DOM; la revisión visual de 375/768/1024/1440 px queda pendiente porque no hubo navegador de QA disponible. No se incluyen capturas fabricadas. Antes de exponerla a clientes, sigue los pendientes de [SEGURIDAD.md](SEGURIDAD.md).

## Organización

| Ruta | Para qué sirve |
|---|---|
| `aplicacion/importador.py` | Encabezados, limpieza, PII y lectura de Excel/CSV |
| `aplicacion/metricas.py` | Cálculos, reconciliación, comparación y atípicos |
| `aplicacion/modelos.py` | Tablas, índices y conexión SQLAlchemy |
| `aplicacion/migraciones.py` | Esquema v2 y migración aditiva desde v1 |
| `aplicacion/planes.py` | Seguimiento manual de vacantes, permisos e historial |
| `aplicacion/catalogo.py` | Cobertura de todo el cuestionario y metadatos visuales |
| `configuracion/presentacion_metricas.json` | Títulos cortos y temas editables |
| `aplicacion/servicio.py` | Transacciones y aislamiento de consultas |
| `aplicacion/seguridad.py` | Contraseñas, sesiones, CSRF y límites |
| `aplicacion/main.py` | API y entrega de interfaz |
| `web/` | Interfaz, reglas descriptivas y adaptador de vista ficticia; sin CDN ni compilador |
| `configuracion/diccionario_columnas.json` | Diccionario editable de preguntas y subopciones |
| `datos_demo/` | Datos ficticios, separados de los reales |
| `pruebas/` | Pruebas matemáticas, importación, permisos y auditoría |
| `documentacion/` | Arquitectura, calidad, uso, pitch y siguientes fases |
| `privado/` | Base, reportes reales y exportaciones; excluido de Git |

El stack conserva FastAPI + Pydantic + SQLAlchemy + SQLite y usa JavaScript modular sencillo con SVG accesible. Se evita añadir React/Tailwind/CDN a una interfaz que no necesita ese empaquetado. PostgreSQL requiere un driver adicional y su propia prueba de integración; no se ha validado aquí.

## Comandos útiles

```bash
npm ci  # Solo para pruebas: requiere Node 24
make test
.venv/bin/python -m aplicacion.cli usuario analista --rol analista
.venv/bin/python -m aplicacion.cli usuario cliente01 --rol cliente --empresa 'COMPAÑIA 1'
.venv/bin/python -m aplicacion.cli perfilar '/ruta/BASE HISTORICA.xlsx'
.venv/bin/python -m aplicacion.cli importar '/ruta/BASE HISTORICA.xlsx'
```

`perfilar` genera `privado/perfil/REPORTE_CALIDAD.md`, incidencias JSON, modelo largo JSONL, perfil y diccionario. No subas esos archivos a un repositorio público. El comando `importar` es para el operador local y activa el archivo directamente; la interfaz ofrece la revisión previa.

## Documentos

- [Guía paso a paso](documentacion/GUIA_DE_USO.md)
- [Fórmulas y límites](METRICAS.md)
- [Limpieza y diccionario](documentacion/PIPELINE.md)
- [Arquitectura y modelo ER](documentacion/ARQUITECTURA.md)
- [Descubrimiento del archivo real](documentacion/DESCUBRIMIENTO.md)
- [Diseño](DESIGN.md) y [amenazas](SEGURIDAD.md)
- [Guion y cinco diapositivas](documentacion/PITCH.md)
- [Pruebas realizadas y límites](documentacion/VERIFICACION.md)
- [Siguiente fase](documentacion/SIGUIENTE_FASE.md)

## Privacidad del repositorio

El repositorio es público. Solo incluye código, preguntas del diccionario, documentación metodológica y demo ficticia. El Excel real, identidades, registros normalizados, contraseñas y bases no se versionan. No se cambió la visibilidad del repositorio ni se publicó un sitio.

El seguimiento y el catálogo se documentan en [Vacantes y cobertura](documentacion/VACANTES_Y_COBERTURA.md).
