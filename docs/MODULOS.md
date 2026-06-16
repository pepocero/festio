# Módulos y multitenant

## Principio fundamental

Cada recurso de negocio pertenece a un **usuario concreto**. Un usuario solo puede ver, crear, editar y eliminar **sus propios** datos. No existe visibilidad cruzada entre usuarios.

## Aislamiento por `user_id`

Todas las tablas con datos de usuario incluyen la columna `user_id`:

| Tabla | Multitenant |
|-------|-------------|
| `users` | Cada fila es un usuario |
| `invitations` | Filtrado por `user_id` en todas las consultas |
| `assets` | Filtrado por `user_id`; claves R2 bajo `users/{userId}/` |
| `templates` | Global (solo lectura); no contiene datos de usuario |

## Reglas de implementación

1. **Autenticación obligatoria** en rutas privadas (`/api/invitations`, `/api/uploads`, etc.).
2. El `user_id` se obtiene **únicamente del JWT** verificado en el middleware `requireAuth`, nunca del cuerpo de la petición ni de parámetros de URL.
3. Toda consulta D1 sobre invitaciones o assets debe incluir `WHERE user_id = ?` con el ID del JWT.
4. Las rutas públicas (`GET /i/:slug`) solo exponen invitaciones con `status = 'published'` y no revelan datos del propietario más allá de lo necesario para la tarjeta.

## Ejemplo de consulta correcta

```sql
SELECT * FROM invitations WHERE id = ? AND user_id = ?
```

## Ejemplo incorrecto (prohibido)

```sql
SELECT * FROM invitations WHERE id = ?
-- Sin filtro user_id: permite acceso a invitaciones de otros usuarios
```

## Módulos futuros

Si se añaden funcionalidades (RSVP, recordatorios, dominios personalizados), cada módulo debe:

- Asociarse a `user_id` o a una `invitation_id` verificada contra `user_id`.
- Exponerse solo al usuario propietario en el panel.
- No filtrar datos por email o slug sin validar propiedad.
