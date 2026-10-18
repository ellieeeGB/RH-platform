# Sistema visual: una lectura del estudio

La pantalla de inicio cuenta una historia basada en los datos elegidos: **qué ocurrió, cómo se compara y qué conviene revisar**. El titular se calcula con empresas que reportan tanto contrataciones como bajas. No hay una conclusión editorial fija ni una calificación de riesgo inventada.

## Recorrido

1. **Lectura del bimestre:** titular breve, balance visual de movimientos y su cobertura. El balance no se confunde con cambio observado de plantilla.
2. **Contexto:** cuatro indicadores conservados y una gráfica con cohorte constante. Alternar rotación, balance y plantilla cambia la pregunta analítica.
3. **Conversaciones:** contratación, permanencia y calidad. Cada tarjeta abre la evidencia que corresponde.
4. **Perspectiva:** mediana de tasas frente a referencia protegida, claramente distinta de la tasa ponderada del inicio.

El detalle completo está en desplegables, con sus exportaciones y coordenadas. No se eliminan preguntas para simplificar la pantalla.

## Lenguaje visual

- Interfaz sans serif con Trebuchet MS y Arial de respaldo. Títulos moderados, cifras tabulares grandes, párrafos cortos y jerarquía consistente.
- Navegación azul profundo `#112d38`; acción verde petróleo `#126d64`; fondo claro `#f3f5f3`; tarjetas de conversación en menta, azul y arena. Coral identifica balances negativos, sin afirmar automáticamente que sean malos.
- Un bloque oscuro para la noticia principal, una franja compacta para los indicadores y superficies claras para explorar. La composición cambia según la tarea.
- Tipografía y estilos locales; no hay fuentes externas, imágenes decorativas, CDN ni compilación de producción.

## Vistas específicas

- **Comparar:** matriz empresa × bimestre, cifras siempre visibles y trayectoria al seleccionar una celda. Color relativo a la magnitud; faltantes tramados, ceros numéricos.
- **Agenda:** tres conversaciones con evidencia y accesos a negociación, tiempos de contratación y prestaciones.
- **Exploradores:** pestañas temáticas, barras por dimensión y tarjetas de categorías. Las unidades diferentes permanecen separadas. Pregunta original, tabla completa y origen desplegables.
- **Calidad:** historia del atípico y simulación de rotación con/sin una empresa. La simulación no modifica la base. Una corrección real sigue requiriendo bitácora.
- **Decisiones:** campos de supuestos junto al resultado inmediato, fórmula visible y costo supuesto. Persistencia temporal separada de la aritmética.
- **Presentar:** tres mensajes con cifras y botón para abrir su evidencia.

## Accesibilidad y móvil

Foco visible, enlace para saltar navegación, estados activos accesibles, datos de gráfica disponibles en tabla y movimiento reducido. En pantallas pequeñas se apilan las tarjetas y se mantiene la navegación horizontal; tablas y gráficas tienen desplazamiento dentro de su contenedor. No se reduce la letra hasta ocultar el contenido.

La revisión visual en navegador sigue pendiente. Las pruebas de DOM comprueban interacciones y contenido, no diseño renderizado ni accesibilidad completa. Ver [verificación](documentacion/VERIFICACION.md).

## Referencia y diferencia

La grabación aportada muestra un producto con comparación, agenda, decisiones y reporte, pero también grandes encabezados y resúmenes repetidos. Se recupera esa amplitud funcional y se reemplaza la presentación repetitiva por un recorrido conectado. La versión nueva no copia sus cifras: cada lectura responde a los filtros y datos importados.
