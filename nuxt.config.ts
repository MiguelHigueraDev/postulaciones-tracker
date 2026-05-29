import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  experimental: {
    viewTransition: true,
  },
  routeRules: {
    "/resultados": { redirect: { to: "/resenas", statusCode: 301 } },
    "/resultados/**": { redirect: { to: "/resenas/**", statusCode: 301 } },
    "/reseñas": { redirect: { to: "/resenas", statusCode: 301 } },
    "/reseñas/**": { redirect: { to: "/resenas/**", statusCode: 301 } },
  },
  app: {
    pageTransition: { name: "page", mode: "out-in" },
    head: {
      title: "me-postulé",
      meta: [
        {
          name: "description",
          content:
            "Datos reales de procesos de selección en empresas tech de Chile. Tiempos de respuesta, etapas y resultados, aportados de forma anónima.",
        },
      ],
      link: [
        { rel: "preconnect", href: "https://fonts.googleapis.com" },
        {
          rel: "preconnect",
          href: "https://fonts.gstatic.com",
          crossorigin: "",
        },
        {
          rel: "stylesheet",
          href: "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=IBM+Plex+Sans:wght@300;400;500&family=JetBrains+Mono:wght@400;500&display=swap",
        },
      ],
    },
  },
  runtimeConfig: {
    turnstileSecretKey: "",
    adminUserId: "",
    public: {
      turnstileSiteKey: "",
    },
  },
  modules: ["@nuxtjs/supabase"],
  css: ["./app/assets/css/main.css"],
  vite: {
    plugins: [tailwindcss()],
  },
  supabase: {
    redirectOptions: {
      login: "",
      callback: "",
      exclude: ["/*"],
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  },
});
