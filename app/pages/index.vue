<script setup lang="ts">
useSeoMeta({
  title: "Transparencia en el hiring",
  description:
    "Datos reales de procesos de selección en empresas tech de Chile. Tiempos de respuesta, etapas y resultados, aportados de forma anónima.",
});
</script>

<template>
  <div class="mx-auto max-w-304 px-6">

    <!-- Hero -->
    <section class="grid grid-cols-1 items-center gap-12 py-16 900:grid-cols-3 900:pt-22 900:pb-16">
      <div class="flex flex-col col-span-2">

        <h1
          class="m-0 mb-6 font-display text-4xl md:text-6xl leading-none font-extrabold tracking-tight text-text max-w-200">
          Transparencia<br />en el hiring.
        </h1>

        <p class="m-0 mb-10 max-w-136 text-base leading-relaxed font-light text-text-muted">
          Datos reales de procesos de selección en empresas tech de Chile.
          Tiempos de respuesta, etapas, resultados. Aportado de forma anónima
          por la comunidad.
        </p>

        <div class="flex flex-wrap items-center gap-3">
          <NuxtLink to="/reseñas"
            class="btn-primary inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-15 font-medium tracking-tight text-bg no-underline transition-colors duration-150 hover:bg-accent-hover">
            Ver datos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/enviar"
            class="inline-flex items-center gap-2 rounded-md border border-border bg-transparent px-5 py-2.5 text-15 font-normal text-text-muted no-underline transition-colors duration-150 hover:border-text-muted hover:bg-surface-alt hover:text-text">
            Compartir experiencia
          </NuxtLink>
        </div>
      </div>

      <HeroTerminal />
    </section>


    <!-- Features -->
    <section
      class="mb-12 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-border bg-border sm:grid-cols-3">
      <article class="flex flex-col gap-3.5 bg-surface p-8 transition-colors duration-150 hover:bg-surface-alt">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-dim text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 class="m-0 font-display text-17 font-bold tracking-tight text-text">
          Zero tracking
        </h3>
        <p class="m-0 text-14 leading-relaxed font-light text-text-muted">
          Sin cookies de sesión, sin fingerprinting, sin logging de IPs.
          Ni siquiera sabemos quién eres.
        </p>
      </article>

      <article class="flex flex-col gap-3.5 bg-surface p-8 transition-colors duration-150 hover:bg-surface-alt">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-dim text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h3 class="m-0 font-display text-17 font-bold tracking-tight text-text">
          Datos sin filtros
        </h3>
        <p class="m-0 text-14 leading-relaxed font-light text-text-muted">
          Lo que reporta la comunidad, publicado tal cual. Tiempos reales,
          etapas reales, resultados reales.
        </p>
      </article>

      <article class="flex flex-col gap-3.5 bg-surface p-8 transition-colors duration-150 hover:bg-surface-alt">
        <div class="flex size-9 shrink-0 items-center justify-center rounded-md bg-accent-dim text-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 class="m-0 font-display text-17 font-bold tracking-tight text-text">
          Community-driven
        </h3>
        <p class="m-0 text-14 leading-relaxed font-light text-text-muted">
          Cada submission suma. Entre todos construimos la base de datos
          que el mercado laboral tech chileno necesita.
        </p>
      </article>
    </section>

    <!-- Bottom CTA -->
    <section
      class="relative mb-8 overflow-hidden rounded-card border border-border bg-surface before:pointer-events-none before:absolute before:inset-0 before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(129,140,248,0.06)_0%,transparent_60%)]">
      <div class="relative px-10 py-12">
        <div class="mb-3.5 font-mono text-13 text-text-subtle">
          // ¿tuviste una entrevista?
        </div>
        <h2 class="m-0 mb-3 font-display text-32 font-extrabold tracking-tight text-text">
          Comparte tu experiencia
        </h2>
        <p class="m-0 mb-8 text-15 font-light text-text-muted">
          2 minutos. Sin cuenta. Sin datos personales. La comunidad te lo agradece.
        </p>
        <NuxtLink to="/enviar"
          class="btn-primary inline-flex items-center gap-2 rounded-md bg-accent px-5 py-2.5 text-15 font-medium tracking-tight text-bg no-underline transition-colors duration-150 hover:bg-accent-hover">
          Enviar feedback
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>
    </section>

  </div>
</template>
