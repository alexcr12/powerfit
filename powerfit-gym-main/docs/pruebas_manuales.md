# Prueba manual de la Regla 3

La prueba automatizada de permisos requiere cargar el filtro JWT y la cadena completa de Spring Security. Para evitar que esta prueba levante el contexto y contacte la base remota, verificarla manualmente en Postman:

1. Iniciar sesión con una cuenta existente de rol `staff` o `admin`:

   `POST http://localhost:8080/auth/login`

   ```json
   {"email":"<email de prueba>","password":"<contraseña de prueba>"}
   ```

2. Copiar el `token` de la respuesta.
3. Enviar `POST http://localhost:8080/socios` con un socio de prueba y sin encabezado `Authorization`. Debe responder **401**.
4. Repetir la petición con `Authorization: Bearer <token>` y datos válidos. Una cuenta `staff` o `admin` debe poder registrar el socio.
5. Enviar `POST http://localhost:8080/membresias` sin token. Debe responder **401**. Con token `staff` o `admin` y un `socio_id` y `categoria_id` válidos, debe permitir la petición cuando se cumplan las demás reglas de negocio.
6. Si el entorno dispone de un usuario autenticable con un rol distinto, repetir la petición con su token; debe responder **403**. El modelo del proyecto limita los roles persistidos a `admin` y `staff`, por lo que ese caso requiere un token de prueba configurado aparte.
