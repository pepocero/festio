# Invitaciones Digitales

Aplicación web para crear, personalizar y compartir invitaciones digitales (cumpleaños, bodas, cenas y eventos). Desplegada en **Cloudflare Workers** con **D1**, **R2** y autenticación **JWT**.

## Características

- Registro e inicio de sesión con JWT (cookie HttpOnly)
- Plantillas prediseñadas por categoría
- Editor con colores, fuentes e imagen de fondo propia
- Enlace público compartible (WhatsApp, email, copiar, Web Share API)
- Página pública con Open Graph para vista previa en mensajería
- Botón **Añadir a Google Calendar**

## Requisitos

- Node.js 20+
- Cuenta Cloudflare con Wrangler autenticado (`wrangler login`)

## Desarrollo local

```bash
npm install

# Crear base de datos D1 en Cloudflare (solo la primera vez)
wrangler d1 create invitaciones-db
# Copiar el database_id en wrangler.jsonc

# Aplicar migraciones y seed en local
npm run db:migrate
npm run db:seed

# Crear bucket R2 (solo la primera vez)
wrangler r2 bucket create invitaciones-assets

# Secret JWT (producción)
wrangler secret put JWT_SECRET

# Desarrollo
npm run dev
```

Abre `http://localhost:8787`. El archivo `.dev.vars` incluye un JWT de desarrollo.

## Despliegue

1. Actualiza `database_id` en `wrangler.jsonc` con el ID real de D1.
2. Configura `APP_URL` en `wrangler.jsonc` (vars) con tu dominio de Workers.
3. Ejecuta migraciones remotas:

```bash
npm run db:migrate:remote
npm run db:seed:remote
wrangler secret put JWT_SECRET
npm run deploy
```

## Estructura

```
src/worker/     API Hono + SSR página pública
src/web/        Panel React (SPA)
src/shared/     Esquemas Zod y utilidades
migrations/     Esquema D1 y plantillas seed
public/         Assets estáticos de plantillas
docs/           Guía multitenant
```

## API principal

| Método | Ruta | Descripción |
|--------|------|-------------|
| POST | `/api/auth/register` | Registro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuario actual |
| GET | `/api/templates` | Plantillas |
| CRUD | `/api/invitations` | Invitaciones del usuario |
| POST | `/api/uploads` | Subir imagen |
| GET | `/i/:slug` | Invitación pública (SSR) |

## Seguridad

- Contraseñas con bcrypt
- JWT HMAC-SHA256, expiración 7 días
- Aislamiento multitenant por `user_id` en todas las consultas
- Validación de tipos MIME en uploads (máx. 5 MB)

Ver [docs/MODULOS.md](docs/MODULOS.md) para las reglas de multitenant.
