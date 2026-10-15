# Comparación flexible de compañías y periodos

Los filtros anteriores solo permitían una compañía o el mercado y un corte. Ahora el selector superior permite elegir cualquier subconjunto de las 40 compañías. Incluye búsqueda, selección de todas, limpieza, acceso rápido a una sola compañía y confirmación explícita; cancelar no modifica la vista.

## Consulta

- **Un bimestre:** un corte para una compañía, varias o todas.
- **Todo el historial:** los siete bimestres en orden cronológico, cada uno con su valor.
- **Comparar bimestres:** dos o más cortes elegidos, incluso no consecutivos.
- **Comparar meses:** bajas mensuales confirmadas. Julio/agosto de 2024 y julio/agosto de 2025 están disponibles; los otros meses aparecen deshabilitados, sin estimar su valor.

La selección múltiple abre `/comparar`. La selección de una compañía o del mercado en un único bimestre sigue aplicándose a las vistas de detalle existentes. Dentro de `/comparar`, cualquier combinación válida permanece en la comparación. El filtro de comparación se guarda por separado en `catch.comparison.v1`; abrir un detalle mantiene la comparación disponible para regresar. No se cambia silenciosamente un subconjunto por todo el mercado.

La tabla cruza compañías con periodos. La gráfica temporal muestra hasta seis compañías individualmente; con más compañías muestra el conjunto comparable y conserva todas las filas en la tabla. El eje horizontal respeta la distancia real entre fechas. Un corte único utiliza barras por compañía. Los datos faltantes interrumpen las líneas y aparecen como guiones. El color indica magnitud, no desempeño.

## Cálculos

Se incluyen plantilla al cierre, bajas, contrataciones, vacantes, salario de ingreso, cobertura de vacantes operativas y tasas de bajas, vacantes y ausencias. Las tasas dividen las sumas del numerador y denominador de las mismas compañías, con denominador completo y positivo. No promedian porcentajes individuales.

El **conjunto disponible** usa observaciones válidas en cada corte y muestra cuántas compañías aportan. El **conjunto comparable** usa la intersección de compañías con datos válidos en todos los cortes elegidos. El cambio entre extremos usa esa base fija; si no existe, no se calcula. Los valores salariales requieren las cuatro bandas positivas y ordenadas; su resumen es una mediana del grupo seleccionado, no un benchmark externo. Las plantillas requieren las tres categorías y las vacantes ambas categorías. El cero explícito se conserva.

Los periodos no se acumulan: evita duplicar plantillas, vacantes persistentes o promediar salarios y tasas sin una definición temporal. Las bajas mensuales son conteos de la fuente; no se divide un bimestre ni se estima un denominador mensual. No se interpreta ningún cambio como una relación causal.

El CSV contiene exclusivamente compañías y fechas seleccionadas, indicador, unidad, valor, estado del dato y cobertura. Incluye el conjunto disponible y el comparable como filas identificadas. Se reutiliza el exportador existente, que escapa celdas y protege textos que podrían interpretarse como fórmulas.

## Validación

73 pruebas de lógica y regresión; TypeScript; comprobación DOM de selección de dos compañías, selección vacía, cancelación, siete periodos, dos periodos precisos, meses no disponibles, exportación, apertura del detalle y persistencia. La exportación estática se verifica antes de publicar. La comprobación DOM no sustituye una revisión visual en navegador real; esta última no está disponible en el entorno de edición.

Los datos procesados y el pipeline no se modifican en esta entrega.
