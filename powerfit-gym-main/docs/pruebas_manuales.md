# Prueba manual de la Regla 3

Usa Postman con el backend en `http://localhost:8080`. La base configurada en el backend debe estar activa.

## 1. Obtener un token

Envía `POST /auth/login` con una de las cuentas que aparecen en la pantalla de login:

```json
{"email":"admin@powerfit.com","password":"admin123"}
```

También puedes usar `staff@powerfit.com` y `staff123`. Copia el campo `token` de la respuesta.

## 2. Probar el registro de un socio

Envía `POST /socios` sin `Authorization`; debe responder **401**. Después repite con `Authorization: Bearer <token>` y este cuerpo:

```json
{"nombre":"Socio de prueba","documento":"87654321","telefono":"900000001"}
```

Con token admin o staff, debe responder **201** si los datos son válidos. El backend asocia el socio al usuario autenticado.

## 3. Probar la creación de una membresía

Envía `POST /membresias` sin `Authorization`; debe responder **401**. Con token admin o staff, usa IDs existentes de un socio activo y una categoría activa:

```json
{"socio_id":1,"categoria_id":1}
```

La respuesta esperada es **201** cuando no exista ya una membresía vigente de esa categoría y se cumplan las demás reglas de negocio.

## 4. Probar el rechazo por rol

Si el entorno tiene una cuenta que se autentica con una autoridad distinta de admin o staff, repite las peticiones con su token. Deben responder **403**. Las cuentas de prueba y los roles admitidos por `UsuarioService` son admin y staff; se necesita una cuenta de prueba adicional en el entorno para este caso.
