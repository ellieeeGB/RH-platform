# Guía rápida, sin dar por hecho que ya sabes

## Entrar

Ejecuta `bash iniciar.sh` desde la carpeta del proyecto. La terminal pedirá una contraseña la primera vez; al escribir no se ven caracteres, es normal. Abre http://127.0.0.1:8000, escribe `administrador` y tu contraseña.

## Cargar tu Excel

Ve a **Cargar estudio**. Arrastra el archivo o usa el selector. Pulsa **Revisar archivo** y espera: se leerán todas las hojas. Una alerta de calidad no significa que todo el archivo sea inutilizable; indica exactamente qué requiere revisión. Confirma para activar el estudio. Esta acción reemplaza la selección de datos activa completa, no agrega solo un mes.

Si tu archivo tiene columnas nuevas con pregunta y subopción, se conservan. Si faltan encabezados, corrígelos en el Excel con quien hizo la encuesta: no se puede saber qué significa una columna por sus números. Para modificar el diccionario, descárgalo, edita los campos documentados en PIPELINE.md, adjúntalo y vuelve a revisar el archivo.

## Seleccionar empresas y tiempo

Abre la lista de empresas y marca una o varias. Abre Bimestres y elige uno o pulsa **Seleccionar todos**. Pulsa **Aplicar filtros**. La tarjeta de plantilla corresponde al último bimestre seleccionado; la gráfica muestra toda la selección. Un cliente solo tendrá su propia empresa.

**Guardar vista** recuerda selección y sección en ese navegador. No comparte datos con otras personas ni crea un enlace público.

## Entender una cifra

Mira el `n`: es la cantidad de empresas con datos suficientes para ese cálculo. La población total de la encuesta no siempre es el denominador. Debajo de la gráfica hay una tabla equivalente. En cada sección puedes abrir una pregunta y bajar hasta la celda de origen: hoja, fila y columna.

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
| Archivo ya importado | No se duplicó. Si necesitas corregir un valor, usa la revisión auditada. |
| Nombre de hoja inválido | Usar por ejemplo JUL-AGO_2025; el CSV debe llevar ese nombre. |
| Acceso bloqueado | Esperar 15 minutos después de cinco fallos. |
