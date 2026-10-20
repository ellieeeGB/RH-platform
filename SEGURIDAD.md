# Seguridad y modelo de amenazas

## Frontera de uso

Aplicación local de un estudio de consultoría. La escucha predeterminada es 127.0.0.1. No se publicó ni se conectó a un hosting. El repositorio público contiene únicamente código, metadatos de preguntas y datos ficticios; los datos reales permanecen fuera de Git.

## Controles implementados

| Amenaza | Control y prueba |
|---|---|
| Robo de contraseña almacenada | Argon2 con sal; nunca guardar contraseña en claro. CLI con getpass, sin contraseña en argumentos. |
| Fuerza bruta | 5 fallos bloquean la cuenta 15 minutos; 10 intentos/IP por 15 minutos; respuesta genérica ante credenciales incorrectas. |
| Robo/reutilización de sesión | JWT HS256 con issuer/audience/exp; 15 minutos. Refresh opaco rotatorio almacenado como hash; sesión de 8 horas, revocable al salir. Cookies httpOnly y SameSite Strict. HTTPS requiere Secure=1. |
| CSRF | Token aleatorio de sesión en encabezado para toda mutación autenticada, incluido refresh; comprobación de Origin y Sec-Fetch-Site. Login no usa sesión preexistente. |
| Acceso a otra empresa | Dependencia de autenticación y filtro obligatorio de empresa en SQL para cliente. Parámetros de empresa del navegador no sustituyen el permiso. Exportaciones, calidad, catálogo, planes e historial respetan el mismo filtro. Crear o editar un plan como cliente requiere el identificador `propia`, resuelto en el servidor. |
| Reidentificación de pares | Códigos HMAC con secreto distinto del JWT. Cliente solo ve pares agregados de su propio segmento (sector, municipio, tamaño o Tier); mínimo 5 empresas válidas, exclusión de su empresa, sin extremos ni lista de identidades. |
| Inyección SQL | SQLAlchemy con parámetros; no existe SQL libre ni SQL generado por una consulta en lenguaje natural. |
| XSS | escape de HTML y uso de textContent; CSP sin scripts externos ni inline; cabeceras nosniff, DENY y no-referrer. Texto importado no se ejecuta. |
| Fórmulas maliciosas | XLSX no evalúa fórmulas; CSV neutraliza =, +, -, @ en exportaciones. No macros ni enlaces externos. |
| Archivo abusivo | Límites de extensión/contenido/tamaño/celdas/hojas y tamaño ZIP expandido. Hasta tres vistas previas activas en memoria, de 15 minutos y ligadas a usuario. |
| Filtración de contactos | Descartar columnas identificadas por pregunta/subopción y patrones de correo/teléfono en texto libre; no registrar sus valores en errores. |
| Cambio concurrente | Revisión optimista en la importación y en cada plan; actualización atómica o HTTP 409. |
| Borrado del rastro de una decisión | Auditoría append-only desde la API con actor, fecha, motivo y antes/después. No hay endpoint que borre auditoría. |
| Exposición por exportación | Acceso autenticado, aislamiento, no-store y registro de descarga. No enlaces públicos a datos. |

## Límites que deben resolverse antes de producción

- El límite de peticiones y las vistas previas son locales a **un proceso**. No ejecutar múltiples workers sin migrar cuotas/caché a un servicio compartido.
- k≥5, HMAC y redondeo reducen exposición, pero **no garantizan anonimato formal**. Cruces repetidos de segmentos y periodos pueden revelar información por diferencia. Antes de un acceso amplio: cohortes fijas, presupuesto de consultas y revisión de supresión complementaria/privacidad diferencial. Las cuentas de consultoría son de confianza y pueden ver el estudio completo.
- La detección de PII es conservadora por cabeceras y patrones, no una garantía para todo texto libre. Restringir quién carga archivos, revisar columnas nuevas y excluir narrativas que puedan identificar personas. Los valores sin encabezado no se conservan.
- Las notas y acciones manuales son contenido privado del seguimiento. Se comparten entre usuarios autorizados de esa empresa y el equipo de consultoría; no son notas personales exclusivas del autor. No se publican en Git ni en la demo.
- La auditoría vive en la misma base. Un administrador de la máquina puede alterarla; se requiere copia externa de solo anexado para un rastro resistente a manipulación.
- No hay recuperación de contraseña por correo ni MFA/SSO. Crear cuentas de forma administrada; la API de alta existe, pero la revocación administrativa/rotación de contraseña por interfaz es siguiente fase.
- Los respaldos y la retención de importaciones no se automatizan. Antes de borrar o migrar, respaldar cifrado y probar restauración; nunca subir respaldos al repositorio.
- No se incluyen pruebas contra PostgreSQL ni pruebas de penetración externas. Las pruebas de integración disponibles usan SQLite.
- La revisión visual de accesibilidad y los tamaños 375/768/1024/1440 no se ejecutaron por ausencia de navegador de QA. Hay diseño adaptable, navegación por teclado, tablas equivalentes y reduced-motion, pero no se declara certificación WCAG.

## Desplegar después de verificar

Usar proxy HTTPS, `RH_COOKIE_SECURE=1`, `RH_ORIGIN` exacto, secretos de al menos 32 caracteres y volúmenes privados. Rechazar hosts no previstos en el proxy, limitar tamaño/cuerpo/tiempo, desactivar logs de cuerpos, fijar permisos del directorio `privado/`, monitorear errores y aplicar actualizaciones de dependencias. No publicar el puerto de desarrollo directamente. El cambio a alojamiento público requiere autorización separada.

## Fuentes técnicas

- [FastAPI: contraseñas y JWT](https://fastapi.tiangolo.com/tutorial/security/oauth2-jwt/)
- [SQLAlchemy: sesiones y transacciones](https://docs.sqlalchemy.org/en/20/orm/session_basics.html)
- [openpyxl: lectura optimizada](https://openpyxl.readthedocs.io/en/stable/optimized.html)

No se afirman obligaciones jurídicas ni plazos de la LFT en esta entrega. Para incorporar cumplimiento o INPC, validar fuentes oficiales vigentes en una fase específica.
