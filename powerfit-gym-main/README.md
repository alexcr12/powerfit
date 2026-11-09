# PowerFit GYM

PowerFit GYM es una aplicación web para administrar un gimnasio.
El personal registra socios, membresías, asistencias y pases de invitado.
El sistema también muestra métricas y contadores de clases en tiempo real.

## Tecnologías

Spring Boot, MySQL, JWT, WebSocket/STOMP, React, Vite y Tailwind CSS.

## Ejecutar en local

1. Inicia MySQL desde XAMPP y crea una base de datos llamada `powerfit`.
2. En `backend/`, ejecuta `./mvnw spring-boot:run`.
3. En `frontend/`, copia `.env.example` como `.env`, ejecuta `npm install` y luego `npm run dev`.
4. Abre el frontend en <http://localhost:5173>. El backend escucha en <http://localhost:8080>.

El backend usa los valores por defecto de `application.properties`. La base local debe estar activa y accesible.

## Variables del backend

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `DB_URL` | `jdbc:mysql://localhost:3306/powerfit?serverTimezone=UTC` | URL JDBC de MySQL. |
| `DB_USER` | `root` | Usuario de MySQL. |
| `DATABASE_PASSWORD` | vacío | Contraseña de MySQL. |
| `JWT_SECRET` | `powerfit-gym-clave-del-curso-2026-cambiar-en-produccion-0123456789` | Clave de firma JWT. |
| `JWT_EXPIRATION_MS` | `86400000` | Duración del JWT en milisegundos. |
| `CORS_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Orígenes permitidos, separados por coma. |
| `MEMBRESIA_PRECIO` | `100.00` | Precio aplicado al crear una membresía. |

## Variable del frontend

| Variable | Valor por defecto | Uso |
| --- | --- | --- |
| `VITE_API_URL` | `http://localhost:8080` | URL base del backend. |

## Usuarios de prueba

Los botones de la pantalla de login rellenan estas credenciales:

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Admin | `admin@powerfit.com` | `admin123` |
| Staff | `staff@powerfit.com` | `staff123` |

## Pruebas

Desde `backend/`, ejecuta `./mvnw test`.

## Carpetas

- `backend/`: API Spring Boot, entidades JPA, seguridad y acceso a MySQL.
- `frontend/`: interfaz React y servicios HTTP.
- `docs/`: guía de sustentación y pasos de prueba manual.
