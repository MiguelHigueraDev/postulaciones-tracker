<script setup lang="ts">
const navLinks = [{ to: "/resenas", label: "Reseñas" }];
</script>

<template>
  <header class="sticky top-0 z-50 border-b border-border-subtle bg-bg/85 backdrop-blur-2xl">
    <div class="mx-auto flex h-14 max-w-304 items-center justify-between gap-8 px-6">
      <NuxtLink to="/" class="flex shrink-0 items-center gap-0 no-underline">
        <span class="font-mono text-base leading-none text-text-subtle">[</span>
        <span class="px-0.5 font-mono text-sm font-medium tracking-tight text-accent">
          mp
        </span>
        <span class="font-mono text-base leading-none text-text-subtle">]</span>
        <span class="ml-3 hidden font-mono text-13 tracking-tight text-text-muted sm:inline">
          me-postulé
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-0.5">
        <NuxtLink v-for="link in navLinks" :key="link.to" :to="link.to"
          class="rounded px-3 py-1.5 text-sm font-normal tracking-tight text-text-muted no-underline transition-colors duration-150 hover:bg-surface-alt hover:text-text"
          active-class="!text-text">
          {{ link.label }}
        </NuxtLink>
        <NuxtLink to="/enviar"
          class="nav-cta ml-2 inline-flex items-center gap-1.5 rounded bg-accent px-3.5 py-1.5 text-13 font-medium tracking-tight text-bg no-underline transition-colors duration-150 hover:bg-accent-hover">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Enviar
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
