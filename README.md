# me-postulé

Plataforma comunitaria para compartir y consultar datos reales de procesos de selección en empresas tech de Chile.

## Requisitos

- Node.js 20+
- [pnpm](https://pnpm.io/)

## Instalación

```bash
pnpm install
```

Crea un archivo `.env` con las variables de Supabase:

```env
SUPABASE_URL=
SUPABASE_KEY=
SUPABASE_SECRET_KEY=
```

Opcional, para Cloudflare Turnstile:

```env
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
NUXT_TURNSTILE_SECRET_KEY=
```

### Panel de moderación (admin)

El panel en `/admin` permite eliminar reseñas y subir logos de empresas. La autorización real ocurre en el servidor: solo el usuario cuyo UUID coincide con `NUXT_ADMIN_USER_ID` puede usar las rutas `/api/admin/*`.

1. En el [dashboard de Supabase](https://supabase.com/dashboard) → **Authentication** → **Users**, crea un usuario admin (email + contraseña).
2. Desactiva el registro público en **Authentication** → **Providers** → **Email** (deshabilita "Enable sign ups").
3. Copia el UUID del usuario admin y configúralo como variable de entorno:

```env
NUXT_ADMIN_USER_ID=
```

4. Asegúrate de que `SUPABASE_SECRET_KEY` esté configurada (localmente y en Vercel). Las mutaciones admin (eliminar reseñas, subir logos) usan la secret key del servidor vía `serverSupabaseServiceRole`; nunca se expone al cliente.

5. Aplica ambas migraciones en orden:
+   - `supabase/migrations/20260602000000_admin_moderation.sql` (columna `logo_url`, bucket `company-logos`, RPCs actualizados)
+   - `supabase/migrations/20260602000001_admin_service_role_grants.sql` (permisos del service role para operaciones admin)

## Desarrollo

```bash
pnpm dev
```

La app corre en [http://localhost:3000](http://localhost:3000).

## Producción

```bash
pnpm build
pnpm preview
```

## Contribuciones

Las contribuciones son bienvenidas. Abre un issue o envía un pull request.

## Licencia

[MIT](LICENSE)
