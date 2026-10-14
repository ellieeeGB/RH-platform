# Estudio de decisiones

Ruta: `/decisiones`. Usa empresa y bimestre globales, y filtros locales por tamaño y presencia de sindicato. Los códigos identifican participantes de la encuesta, no un universo representativo del mercado.

## Mapa de tensiones

Cada punto requiere plantilla completa GL+GM+GN positiva, bajas LB no negativas y cuatro bandas salariales GW–GZ positivas y ordenadas. X es salario diario inicial operativo; Y es bajas totales / plantilla al cierre × 100. Los ejes representan poblaciones diferentes y el cruce es exploratorio. No se estima un efecto de salario sobre rotación.

Las líneas son medianas **por empresa**, calculadas sobre los mismos puntos. No son la tasa agregada ponderada por plantilla. El área del círculo es proporcional a la plantilla, con un tamaño mínimo para interacción. Se exige un mínimo de cinco puntos; la tabla ofrece el mismo contenido y selección sin depender del gráfico. Los casos con saltos históricos se señalan, no se corrigen automáticamente.

Seleccionar un punto cambia la empresa global. Los pares de contraste excluyen a esa empresa y requieren el mismo estado sindical conocido, plantilla entre 0.5× y 2× y salario dentro de ±10%. Son criterios descriptivos explícitos, no emparejamiento causal. Se necesitan cinco pares para presentar su mediana. Estos umbrales no son un control de acceso.

## Descomposición simétrica de tasas

Se conserva el conjunto de códigos que cumple los filtros en el corte actual y se buscan esos mismos códigos en el anterior. En cada corte se exigen bajas válidas y plantilla completa positiva. La descomposición no exige salario; su cobertura puede ser mayor que la del mapa.

Para cada empresa i: r es su tasa en puntos porcentuales y w su proporción de la plantilla del panel. Se aplica la identidad:

- Dentro de empresas = suma de `(w_anterior + w_actual) / 2 × (r_actual − r_anterior)`.
- Cambio de peso = suma de `(r_anterior + r_actual) / 2 × (w_actual − w_anterior)`.
- Ambas aportaciones suman exactamente la variación de la tasa del panel emparejado, antes de redondear.

La diferencia entre el cambio de todas las respuestas disponibles y el cambio emparejado se informa aparte, como efecto de disponibilidad de respuestas. No se mezcla con el efecto de pesos del panel. Una empresa seleccionada tiene efecto de peso cero. Un primer corte o una muestra insuficiente no produce una comparación inventada. Mercado requiere cinco empresas; la consulta propia puede mostrar una.

El control de sensibilidad excluye códigos con salto histórico de plantilla en cualquiera de los dos cortes. Es una elección visible del usuario, aplicada simétricamente. Se conserva la fuente, se muestra cuántas empresas salen y no se denomina a la exclusión “corrección”.

## Bitácora

Cada hipótesis conserva corte, empresa, fuente e implementación SHA-256, filtros, exclusiones, resultados calculados, responsable, fecha y resultado escrito por el usuario. Cambiar filtros no reescribe la evidencia guardada. Una firma diferente marca una edición previa.

Persistencia: localStorage, máximo 100 registros. El esquema se valida al leer; entradas corruptas y duplicadas no llegan al renderizado. Los errores de persistencia se notifican sin prometer que se guardó. Hay cierre/reapertura, eliminación y exportación JSON de estudio y bitácora. No hay sincronización, recordatorios, almacenamiento multiusuario ni importación automática del archivo exportado.

## Validación

Pruebas con reversión agregada sintética, identidad en los siete cortes, invariancia a replicación y orden, denominadores cero/ausentes, selección propia y filtros, exclusión simétrica de saltos y lectura de registros locales corruptos. La compilación de Next.js comprueba el renderizado inicial. La revisión visual interactiva del nuevo resultado requiere navegador; no se declara completada mediante pruebas unitarias.
