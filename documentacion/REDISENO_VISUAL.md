# Rediseño visual y narrativo

La versión vigente es la **4**, documentada en [MEJORAS_VISUALES_V4.md](MEJORAS_VISUALES_V4.md). Se conserva el panorama compacto y se rediseñaron las lecturas temáticas y el reporte.


## Panorama compacto · base de la versión actual

El inicio abre con un titular breve y cuatro indicadores compactos. La gráfica de evolución queda junto al balance de contrataciones y bajas; ambas usan escalas y cifras visibles. Debajo aparecen tres vistas: motivos de salida, vacantes declaradas y un anillo de cobertura de rotación. El color del anillo indica cobertura, no calificación de calidad ni riesgo.

Las tarjetas grandes de conversación se conservan en Agenda. En Panorama se sustituyen por accesos breves a la evidencia. El benchmark, la metodología y la tabla completa siguen disponibles en desplegables. Cargar estudio permanece en la barra fija y el plan de vacantes se abre desde la demanda próxima.

Motivos y vacantes consultan el **último bimestre seleccionado**, con las empresas autorizadas y seleccionadas. Las barras muestran hasta tres motivos por volumen reportado, con su n; no son porcentajes del total ni sustituyen la reconciliación de bajas. La demanda nunca suma vacantes de varios bimestres. La curva conserva la cohorte constante del diseño anterior.

Se eliminaron el componente de portada y sus estilos sin uso. El diseño distribuye el contenido en columnas en escritorio y lo apila en pantallas pequeñas. La vista HTML se entrega como `catch_rh_visual_v4.html`, con el rótulo visible «VERSIÓN 3 · PANORAMA VISUAL».

## Evolución del diseño

La entrega inicial organizaba gran parte del estudio como pregunta y tabla. La revisión convierte esa información en una experiencia de consultoría: titular calculado, contexto temporal, conversaciones concretas y evidencia conectada.

| Antes | Ahora |
|---|---|
| Encabezado genérico | Conclusión descriptiva del balance del bimestre |
| Tarjeta de portada extensa | Cuatro indicadores compactos y gráficas visibles al inicio |
| Una curva con coberturas variables | Evolución con las mismas empresas en todos los periodos elegidos |
| Navegación plana | Lectura del estudio, personas y trabajo, fuente y control |
| Selector y tabla para casi todo | Pestañas, barras por dimensión, categorías y detalle completo desplegable |
| Consulta empresa por empresa en tabla | Mapa temporal con trayectoria al seleccionar una celda |
| Atípico descrito en texto | Historia gráfica y análisis de sensibilidad sin modificar datos |
| Escenario con resultado al final | Supuestos y consecuencias juntos, actualización inmediata |

## Probar sin instalar

Abre [catch_rh_visual_v4.html](catch_rh_visual_v4.html) en tu navegador. Es un archivo autónomo de diseño con **ocho empresas ficticias y siete bimestres**. La interfaz se empaqueta desde los mismos archivos que sirve la aplicación.

Puedes probar panorama, navegación, filtros, comparación, exploradores, agenda, decisiones y seguimiento de vacantes. Los reportes, la importación, el benchmark protegido y los cambios auditados completos requieren ejecutar la aplicación; la vista previa no se conecta al estudio real ni almacena cambios en él.

Regenerar después de editar la interfaz:

```bash
.venv/bin/python scripts/generar_vista.py
```

El generador solo lee `datos_demo/` y el diccionario. No consulta `.env`, SQLite, el Excel privado ni `privado/`.

## Comprobar las interacciones

Con Node 24 y el entorno Python instalado:

```bash
.venv/bin/pip install -r requirements-dev.txt
npm ci
make test
```

Las pruebas de DOM comprueban navegación, filtros, trayectoria, paginación, presentación, sensibilidad y escenario. No equivalen a una inspección visual en un navegador. No se generaron capturas que pretendan demostrar una revisión inexistente.

## Límites analíticos conservados

- El balance de movimientos usa empresas con ambos datos. No implica crecimiento observado de plantilla.
- La comparación temporal fija la cohorte; un faltante impide incluir esa empresa en la curva completa.
- Las vacantes no se suman entre distintos bimestres desde el explorador visual. Las plantillas se tratan como fotos de cada periodo.
- La sensibilidad cambia la muestra deliberadamente y se identifica como simulación. No confirma que un atípico sea un error.
- El benchmark sigue protegido por el servidor. En administración, la referencia es la muestra completa; no se muestra un selector de segmento que no cambie el resultado.
- Todos los resultados detallados continúan accesibles; las barras limitan la primera vista a 12 dimensiones para facilitar la lectura.

## Seguimiento de vacantes y acceso a todo el estudio

- Cargar estudio pasa a ser un botón destacado en la barra superior fija; también aparece en el estado inicial sin datos.
- Panorama y Reclutamiento enlazan a Vacantes y acciones. El tablero muestra el recorrido desde Por iniciar hasta Cubierta, con próximos pasos y fechas visibles.
- Las notas, tareas y plazas se guardan con versiones en la aplicación. En el HTML autónomo se pueden probar con almacenamiento local de datos ficticios.
- Todo el estudio presenta 11 temas, búsqueda por pregunta/subopción y cobertura; los títulos cortos se editan en un JSON independiente del mapeo de importación.
- Tarjetas, barras, curvas y diálogos incorporan movimiento breve y controles para reducirlo.

Los detalles, reglas y límites están en [Vacantes y cobertura](VACANTES_Y_COBERTURA.md).
