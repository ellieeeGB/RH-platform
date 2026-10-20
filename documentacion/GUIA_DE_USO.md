# Guía rápida, sin dar por hecho que ya sabes

## Entrar

Ejecuta `bash iniciar.sh` desde la carpeta del proyecto. La terminal pedirá una contraseña la primera vez; al escribir no se ven caracteres, es normal. Abre http://127.0.0.1:8000, escribe `administrador` y tu contraseña.

## Cargar tu Excel

Pulsa el botón destacado **Cargar estudio** de la barra superior. Está disponible para administrador y analista; permanece accesible al desplazarte por el contenido. Arrastra el archivo o usa el selector. Pulsa **Revisar archivo** y espera: se leerán todas las hojas. Una alerta de calidad no significa que todo el archivo sea inutilizable; indica exactamente qué requiere revisión. Confirma para activar el estudio. Esta acción reemplaza la selección de datos activa completa, no agrega solo un mes.

Si tu archivo tiene columnas nuevas con pregunta y subopción, se conservan. Si faltan encabezados, corrígelos en el Excel con quien hizo la encuesta: no se puede saber qué significa una columna por sus números. Para modificar el diccionario, descárgalo, edita los campos documentados en PIPELINE.md, adjúntalo y vuelve a revisar el archivo.

## Seleccionar empresas y tiempo

Abre la lista de empresas y marca una o varias. Abre Bimestres y elige uno o pulsa **Seleccionar todos**. Pulsa **Aplicar filtros**. La tarjeta de plantilla corresponde al último bimestre seleccionado; la gráfica muestra toda la selección. Un cliente solo tendrá su propia empresa.

**Guardar vista** recuerda selección y sección en ese navegador. No comparte datos con otras personas ni crea un enlace público.

## Leer el nuevo panorama

Los cuatro indicadores de arriba resumen el último bimestre seleccionado. La evolución permite alternar rotación, balance y plantilla; conserva las mismas empresas en todos los periodos de la gráfica. A su lado, el balance muestra contrataciones y bajas de las empresas que reportaron ambos datos.

Debajo encontrarás motivos de salida, vacantes próximas y cobertura de rotación. Los dos primeros corresponden también al último bimestre seleccionado. Pulsa **Organizar puestos y acciones** para abrir tu seguimiento. **Todos los motivos** abre el desglose completo.

El anillo muestra cuántas empresas tienen una tasa calculable; no es una calificación del desempeño. Para ver el benchmark, abre **Rotación frente al grupo de referencia**. La tabla de todas las cifras continúa en el siguiente desplegable.

## Entender una cifra

Mira el `n`: es la cantidad de empresas con datos suficientes para ese cálculo. La población total de la encuesta no siempre es el denominador. Debajo de la gráfica hay una tabla equivalente. En cada sección puedes abrir una pregunta y bajar hasta la celda de origen: hoja, fila y columna.

## Registrar puestos y organizar el plan de acción

Abre **Vacantes y acciones** desde el menú o el acceso del panorama. Pulsa **Añadir puesto**, elige empresa y bimestre de origen y escribe el puesto, el total de plazas, cuántas ya cubriste, prioridad y fecha objetivo. Agrega anotaciones y acciones concretas; cada acción admite área a cargo, fecha y marca de completada. Pulsa **Guardar seguimiento**.

El tablero tiene cuatro etapas: Por iniciar, En curso, Bloqueada y Cubierta. Abre una tarjeta para editarla. Cuando todas las plazas están cubiertas, el estado pasa a Cubierta. Para retirar un seguimiento sin borrar su historial, cambia su estado a Archivada; **Ver archivadas** permite recuperarlo. **Ver historial** muestra cada versión guardada.

Los planes siguen los filtros de empresa y bimestre. El bimestre indica el origen del seguimiento, no la fecha de cada acción. La demanda próxima declarada en el Excel se muestra como referencia del último bimestre seleccionado. Los planes no cambian las cifras del estudio.

En la aplicación se guardan en la base y pueden consultarse al volver a entrar. Los usuarios cliente solo ven y editan planes de su empresa; el equipo de consultoría autorizado puede acompañar ese seguimiento. Si otra persona editó antes, se rechaza la versión desactualizada: conserva tus anotaciones antes de recargar.

Si activas otro estudio, los planes anteriores se conservan asociados a su importación, pero dejan de aparecer en el tablero activo. No se trasladan automáticamente. La vista HTML de demostración guarda únicamente planes ficticios en el navegador; borrarlos de ese almacenamiento elimina la demo, no datos de la aplicación.

## Encontrar información de todo el estudio

Abre **Todo el estudio**. Busca palabras de las preguntas y subopciones, como «comedor», «turnos», «contingencias» o «practicantes». Puedes filtrar por tema o por disponibilidad de respuestas. **Abrir análisis** lleva a la pregunta, con gráficos, categorías y tablas completas.

La cobertura cambia con empresa y bimestre. «Sin respuesta utilizable» incluye faltantes y exclusiones; no significa cero. Los textos e intervalos se cuentan por separado y no se convierten en números. La versión actual del diccionario contiene 183 métricas: las preguntas nuevas también aparecen, aunque todavía no tengan un título corto específico.

## Ajustar el movimiento

Las barras, curvas, tarjetas y diálogos usan animaciones breves. Pulsa **Movimiento** en la barra para reducirlas durante la sesión. También se respeta la preferencia de movimiento reducido del sistema operativo.

## Resolver un atípico

En **Calidad de datos**, elige Atípicos de plantilla. Compara el historial de la misma empresa. Pulsa Revisar valor y elige excluir, corregir o incluir de nuevo. Para corregir necesitas verificar el dato con la fuente: un número grande no es por sí solo un error.

Escribe un motivo de al menos 10 caracteres. La bitácora conserva el valor anterior y el nuevo. Si aparece «Los datos cambiaron», recarga y revisa lo que hizo otro usuario. No se sobrescriben cambios concurrentes a escondidas.

## Exportar y presentar

**Reporte** abre un documento para los filtros actuales. Usa el menú Imprimir de tu navegador y selecciona Guardar como PDF. **Exportar CSV** descarga hechos normalizados autorizados. **Modo historia** presenta los hallazgos uno por uno para una reunión.

**Pregúntale al estudio** acepta temas disponibles, por ejemplo «motivos de baja» o «vacantes». Es un buscador por intención, no un chat que inventa explicaciones. Ctrl+K lleva a la caja de consulta.

## Accesos

Administrador crea cuentas en **Accesos**. Selecciona cliente y su empresa para restringirlo a esa empresa; analista puede trabajar con el estudio completo y corregir; administrador también puede crear usuarios. Entrega credenciales por un canal apropiado de tu organización. La aplicación no envía contraseñas ni correos.

## Problemas comunes

| Mensaje | Qué hacer |
|---|---|
| No hay datos | Cargar estudio o revisar filtros. |
| Sin dato | La respuesta falta o no es válida para ese cálculo; no significa cero. |
| Benchmark reservado | No hay al menos 5 empresas válidas comparables; no se puede ampliar el grupo para revelar identidades. |
| Vista previa vencida | Volver a revisar el archivo; vence tras 15 minutos o al reiniciar. |
| Archivo ya importado | Mismo archivo y mismo mapeo: no se duplicó. Para un dato puntual usa la revisión auditada; para cambiar el mapeo adjunta el diccionario corregido y confirma una nueva importación. |
| Nombre de hoja inválido | Usar por ejemplo JUL-AGO_2025; el CSV debe llevar ese nombre. |
| Acceso bloqueado | Esperar 15 minutos después de cinco fallos. |
