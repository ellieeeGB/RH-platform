# Rediseño visual y narrativo

## Qué cambió

La entrega inicial organizaba gran parte del estudio como pregunta y tabla. La revisión convierte esa información en una experiencia de consultoría: titular calculado, contexto temporal, conversaciones concretas y evidencia conectada.

| Antes | Ahora |
|---|---|
| Encabezado genérico | Conclusión descriptiva del balance del bimestre |
| Cuatro tarjetas como punto de partida | Historia principal, balance gráfico y cuatro indicadores conservados |
| Una curva con coberturas variables | Evolución con las mismas empresas en todos los periodos elegidos |
| Navegación plana | Lectura del estudio, personas y trabajo, fuente y control |
| Selector y tabla para casi todo | Pestañas, barras por dimensión, categorías y detalle completo desplegable |
| Consulta empresa por empresa en tabla | Mapa temporal con trayectoria al seleccionar una celda |
| Atípico descrito en texto | Historia gráfica y análisis de sensibilidad sin modificar datos |
| Escenario con resultado al final | Supuestos y consecuencias juntos, actualización inmediata |

## Probar sin instalar

Abre [vista_previa.html](vista_previa.html) en tu navegador. Es un archivo autónomo de diseño con **ocho empresas ficticias y siete bimestres**. La interfaz se empaqueta desde los mismos archivos que sirve la aplicación.

Puedes probar panorama, navegación, filtros, comparación, exploradores, agenda y decisiones. Los reportes, la importación, el benchmark protegido y los cambios auditados completos requieren ejecutar la aplicación; la vista previa no se conecta al estudio real ni almacena cambios en él.

Regenerar después de editar la interfaz:

```bash
.venv/bin/python scripts/generar_vista.py
```

El generador solo lee `datos_demo/` y el diccionario. No consulta `.env`, SQLite, el Excel privado ni `privado/`.

## Comprobar las interacciones

Con Node 24 y el entorno Python instalado:

```bash
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
