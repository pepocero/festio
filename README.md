# Festio

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
wrangler d1 create festio-db
# Copiar el database_id en wrangler.jsonc

# Aplicar migraciones y seed en local
npm run db:migrate
npm run db:seed

# Crear bucket R2 (solo la primera vez)
wrangler r2 bucket create festio-assets

# Secret JWT (producción)
wrangler secret put JWT_SECRET

# Desarrollo (requiere build previo)
npm run build
npm run dev
```

Abre `http://localhost:8787`. Copia `.dev.vars.example` a `.dev.vars` y configura `JWT_SECRET`.

## Despliegue en Cloudflare

**Producción:** https://festio.pepocero.workers.dev

Festio es un **Worker full-stack** (API + SPA + SSR) con D1 y R2. No es un sitio estático de Pages; el despliegue correcto es con **Wrangler** o el workflow de GitHub incluido.

### Infraestructura (ya creada en la cuenta)

| Recurso | Nombre | ID / detalle |
|---------|--------|----------------|
| Worker | `festio` | https://festio.pepocero.workers.dev |
| D1 | `festio-db` | `1e0c9006-49e9-4e57-9a2d-cb4cac26d072` |
| R2 | `festio-assets` | binding `ASSETS` |
| Secreto | `JWT_SECRET` | configurado en el Worker |

### Despliegue automático (GitHub Actions)

En el repositorio de GitHub → **Settings → Secrets and variables → Actions**, añade:

| Secreto | Valor |
|---------|--------|
| `CLOUDFLARE_API_TOKEN` | Token con permisos *Workers Scripts*, *Workers R2*, *D1* ([crear token](https://dash.cloudflare.com/profile/api-tokens)) |
| `CLOUDFLARE_ACCOUNT_ID` | `57c6750913a2c0db6a279da9658d402a` |

Cada push a `main` ejecuta `.github/workflows/deploy.yml` (build + migraciones D1 + `wrangler deploy`).

### Despliegue manual (CLI)

```bash
npm run build
npm run db:migrate:remote   # si hay migraciones nuevas
npm run deploy
```

### Conectar Git en el panel de Cloudflare (alternativa)

**Workers & Pages** → **Create** → **Connect to Git** → repo `festio`.

| Campo | Valor |
|-------|--------|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |

Configura los mismos bindings D1/R2, `APP_URL` y `JWT_SECRET` en el proyecto.

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
