# Guía de sustentación de PowerFit GYM

## a) Arquitectura

- `backend/.../controlador`: recibe solicitudes HTTP y devuelve respuestas.
- `backend/.../servicio`: aplica validaciones y coordina operaciones.
- `backend/.../repositorio`: consulta y guarda entidades con Spring Data JPA.
- `backend/.../entidad`: define las tablas y relaciones JPA.
- `frontend/src/api`: configura Axios y contiene los servicios de cada recurso.
- `frontend/src/pages`: contiene las pantallas por módulo.
- `frontend/src/components`: contiene componentes comunes y el layout.
- `frontend/src/context`: comparte sesión, tema y avisos.
- `frontend/src/routes`: define las rutas y sus protecciones.

## b) Modelo de datos

El backend contiene siete entidades y sus tablas correspondientes:

| Tabla | Campos principales | Relaciones |
| --- | --- | --- |
| `usuarios` | `id`, `nombre`, `email`, `password`, `rol`, `activo` | No tiene relaciones JPA salientes. `email` es único. |
| `socios` | `id`, `registrado_por`, `nombre`, `documento`, `telefono`, `fecha_registro`, `activo` | `registrado_por` apunta a `Usuario`; un socio tiene membresías, asistencias y pases. `documento` es único. |
| `categorias` | `id`, `nombre`, `activo` | `Producto` y `Membresia` apuntan a una categoría. |
| `productos` | `id`, `categoria_id`, `nombre`, `requiere_asistencia`, `activo` | Cada producto pertenece a una categoría. |
| `membresias` | `id`, `socio_id`, `categoria_id`, `fecha_inicio`, `fecha_fin`, `monto_total`, `activo` | Cada membresía pertenece a un socio y una categoría. |
| `pases_invitado` | `id`, `socio_id`, `nombre_inv`, `fecha_uso`, `activo` | Cada pase pertenece a un socio. |
| `asistencias` | `id`, `socio_id`, `producto_id`, `fecha_hora` | Cada asistencia pertenece a un socio y un producto. |

Las asociaciones `categoria` de `Producto` y `Membresia`, `producto` de `Asistencia` y `registradoPor` de `Socio` se guardan como claves foráneas. Las propiedades JSON anotadas se llaman `categoria_id`, `producto_id` y `registrado_por`, respectivamente.

En la entidad actual, `Categoria.nombre` no está marcada como única; por eso no se documenta como una restricción JPA.

## c) Reglas de negocio R1 a R5

| Regla | Validación real | Rechazo |
| --- | --- | --- |
| R1: una asistencia requiere un socio activo, una clase activa que requiera asistencia y una membresía activa de la categoría de esa clase, vigente en la fecha de asistencia. | `AsistenciaService.resolverSocio`, `resolverProducto` y `validarAcceso`, al registrar o actualizar. | `ReglaNegocioException` → 422. Socio o producto inexistente → 404. No se consulta `Categoria.activo` para validar el acceso. |
| R2: desactivar un socio conserva asistencias, membresías y pases. | `SocioService.eliminar` pone `activo=false`; `SocioService.actualizar` permite reactivar. | La baja responde 204 y no borra el historial. |
| R3: solo admin o staff pueden registrar socios y crear membresías. | `SecurityConfig.filterChain`, reglas POST de `/socios` y `/membresias`. | Sin autenticación → 401; rol insuficiente → 403. |
| R4: una categoría inactiva no admite nuevas membresías; las membresías existentes siguen permitiendo acceso mientras estén vigentes. | `MembresiaService.crear` rechaza la categoría inactiva; `AsistenciaService.validarAcceso` no revisa el estado de la categoría. | Categoría no disponible → `ReglaNegocioException`, 422. |
| R5: el límite mensual es 3 si el socio tiene una membresía en total; en otro caso es 2. Solo cuentan pases activos del mes calendario de uso. | `PaseInvitadoService.validarYCalcular` y `datosDisponibilidad`, usados por crear y actualizar. | Socio sin membresía vigente o límite alcanzado → `ReglaNegocioException`, 422. |

## d) Seguridad

`POST /auth/login` busca el usuario por email, compara la contraseña con BCrypt y crea el token con `JwtService`. El JWT usa el email como `subject` y contiene el claim `rol` con la autoridad, por ejemplo `ROLE_ADMIN` o `ROLE_STAFF`, además de emisión y expiración.

`JwtAuthenticationFilter` lee `Authorization: Bearer ...`, valida el token y carga el usuario y sus authorities. Un token inválido o expirado responde 401 en JSON. `SecurityConfig` no mantiene sesión y usa reglas por ruta y método.

| Acceso | Rutas y métodos según `SecurityConfig` |
| --- | --- |
| Público | `POST /auth/login`, `/ws` y `/ws/**`, `GET /actuator/health` y solicitudes `OPTIONS`. |
| Admin | `/auth/register`, `/usuarios/**`, cambios `POST/PATCH/PUT/DELETE` en `/categorias/**` y `/productos/**`, y el resto de `/actuator/**`. |
| Admin o staff | `GET` de categorías, productos, socios, membresías, asistencias y pases; `GET /metricas`; `POST` de socios, membresías, asistencias y pases; `PATCH/DELETE` de socios, membresías, asistencias y pases. |
| Cualquier rol autenticado | Cualquier otra ruta que no coincida con las reglas anteriores. |

Sin token o con token inválido, una ruta protegida responde 401. Con token válido pero rol insuficiente responde 403.

## e) Tiempo real (RF31)

1. `WebSocketConfig` registra `/ws` con SockJS y activa el broker `/topic`.
2. Al registrar una asistencia, `AsistenciaController.registrar` guarda primero mediante `AsistenciaService`.
3. Después del guardado, `publicarContador(productoId, fecha)` cuenta las asistencias de esa clase en esa fecha y publica en `/topic/asistencias`.
4. El mensaje exacto tiene esta forma: `{"productoId":1,"producto":"Danza","total":7,"fecha":"2026-11-08"}`.
5. `Dashboard.jsx` carga inicialmente `GET /asistencias/contador-hoy` y se suscribe a `/topic/asistencias`.
6. Si el mensaje es de hoy en hora local, el Dashboard actualiza el contador de esa clase; su barra recalcula el ancho desde el estado actualizado.

El controlador también publica los contadores afectados después de actualizar o eliminar una asistencia correctamente.

## f) Métricas y monitoreo

`GET /metricas` devuelve `membresiasVigentesPorTipo`, `asistenciasHoy` y `generadoEn`. `MetricasService.obtenerMetricas` consulta membresías activas cuya fecha de inicio y fin incluyen hoy, agrupadas por categoría; también cuenta asistencias del día en total y agrupadas por producto.

El Dashboard dibuja barras de membresías por tipo con `membresiasVigentesPorTipo`. Las barras de asistencias por clase usan `GET /asistencias/contador-hoy` y el mismo estado que actualiza el WebSocket.

Actuator expone `GET /actuator/health`, `/actuator/metrics`, `/actuator/loggers` e `/actuator/info`. Health es público; el resto de `/actuator/**` requiere admin. Los gauges son `powerfit.membresias.vigentes` con etiqueta `categoria` y `powerfit.asistencias.hoy` con etiqueta `producto`.

Logback escribe en consola y en `logs/powerfit.log`. La rotación es por fecha, conserva hasta 7 días y limita el total de archivos a 50 MB. Se registran inicios y fallos de login, rechazos de negocio y operaciones principales; los errores inesperados llevan stack trace en el log.

## g) Manejo de errores

`GlobalExceptionHandler` devuelve JSON con la forma `{"mensaje":"..."}`: `IllegalArgumentException` → 400; `ReglaNegocioException` → 422; `RuntimeException` con mensaje de no encontrado/a → 404; otros errores → 500 con mensaje genérico. Spring Security responde 401 o 403 en JSON desde sus handlers.

En el frontend, `obtenerMensajeError` lee `error.response.data.mensaje` o usa un texto genérico. El `catch` de cada pantalla lo pasa a `addToast`, y `ToastContext` lo muestra como aviso. Para 401, Axios limpia la sesión y redirige a `/login`.

## h) Pruebas

Las pruebas de servicio usan JUnit 5 y Mockito, con repositorios simulados:

- `AsistenciaServiceReglaTest`: acceso con membresía de la categoría correcta; rechazo por categoría incorrecta, socio inactivo o producto que no requiere asistencia; permite acceso si la categoría se desactivó pero la membresía sigue vigente.
- `SocioServiceReglaTest`: la baja cambia `activo` sin borrar relaciones y se puede reactivar.
- `MembresiaServiceReglaTest`: categoría inactiva rechazada; categorías distintas simultáneas permitidas; duplicada de la misma categoría rechazada; un mes y precio configurado; desactivar categoría no modifica membresías existentes.
- `PaseInvitadoServiceReglaTest`: el tercer pase permitido para una membresía total; el tercer pase rechazado con dos o más membresías; rechazo sin membresía vigente; pases anulados fuera del conteo.
- `BackendApplicationTests` está deshabilitada porque carga el contexto completo.

La Regla 3 se prueba manualmente con los pasos de [docs/pruebas_manuales.md](pruebas_manuales.md).

## i) Eliminación lógica

Se desactivan usuarios, socios, categorías, productos, membresías y pases con `activo=false`. Las asistencias se eliminan físicamente con `DELETE /asistencias/{id}`.

## j) Decisiones de diseño

- El precio de la membresía se configura una sola vez con `membresia.precio`.
- El servidor calcula `fecha_fin` como `fecha_inicio` más un mes.
- Las fechas del servidor usan la zona `America/Lima`, configurada en `BackendApplication`.
- Las bajas lógicas conservan el historial vinculado al registro.
