# Postulaciones Tracker

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
```

Opcional, para Cloudflare Turnstile:

```env
NUXT_PUBLIC_TURNSTILE_SITE_KEY=
NUXT_TURNSTILE_SECRET_KEY=
```

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
