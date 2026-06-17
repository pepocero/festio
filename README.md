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

# Desarrollo
npm run dev
```

Abre `http://localhost:8787`. Copia `.dev.vars.example` a `.dev.vars` y configura `JWT_SECRET`.

`npm run dev` usa Vite con recarga en caliente (no hace falta `build` antes). Para probar el build de producción en local: `npm run dev:wrangler`.

## Despliegue en Cloudflare

Festio es un **Worker full-stack** (API + SPA + SSR) con D1 y R2. El despliegue correcto es con **Wrangler** o el workflow de GitHub incluido.

### Recursos necesarios

| Recurso | Nombre en Cloudflare | Binding / notas |
|---------|----------------------|-----------------|
| Worker | `festio` | Nombre del proyecto |
| D1 | `festio-db` | `DB` en `wrangler.jsonc` |
| R2 | `festio-assets` | `ASSETS` |
| Secreto | `JWT_SECRET` | Variables del Worker |
| Variable | `APP_URL` | URL pública de la app |

No subas al repositorio tokens, `JWT_SECRET` ni otros secretos. Los IDs de cuenta y base de datos configúralos solo en `wrangler.jsonc` local o en secretos de CI.

### Despliegue automático (GitHub Actions)

En el repositorio de GitHub → **Settings → Secrets and variables → Actions**, añade:

| Secreto | Valor |
|---------|--------|
| `CLOUDFLARE_API_TOKEN` | Token con permisos *Workers Scripts*, *Workers R2*, *D1* ([crear token](https://dash.cloudflare.com/profile/api-tokens)) |
| `CLOUDFLARE_ACCOUNT_ID` | Tu Account ID (Cloudflare → **Workers & Pages** → **Overview**, columna derecha) |

Cada push a `main` ejecuta `.github/workflows/deploy.yml` (build + migraciones D1 + `wrangler deploy`).

### Despliegue manual (CLI)

```bash
npm run build
npm run db:migrate:remote   # si hay migraciones nuevas
npm run deploy
```

### Conectar Git en el panel de Cloudflare (alternativa)

**Workers & Pages** → **Create** → **Connect to Git** → repositorio del proyecto.

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
