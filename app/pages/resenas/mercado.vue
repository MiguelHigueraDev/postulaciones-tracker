<script setup lang="ts">
import type { GlobalStatsResponse } from "~~/shared/utils/companyStats";

const { data, error, pending } = await useAsyncData("global-stats", () =>
  $fetch<GlobalStatsResponse>("/api/stats"),
);

const stats = computed(() => data.value?.stats ?? null);
const submissionCount = computed(() => stats.value?.total ?? 0);

useSeoMeta({
  title: "Mercado · Reseñas",
  description:
    "Estadísticas agregadas de procesos de selección en empresas tech de Chile: resultados, tiempos de respuesta y etapas.",
});
</script>

<template>
  <div class="mx-auto max-w-3xl overflow-x-clip px-6 pt-10 pb-24 md:px-8">
    <div class="mb-8">
      <div class="mb-5 flex flex-wrap items-center gap-1.5 font-mono text-xs">
        <NuxtLink
          to="/"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <NuxtLink
          to="/resenas"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          reseñas
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <span class="text-accent">mercado</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Mercado
      </h1>
      <p class="m-0 font-mono text-13 tracking-wide text-text-subtle">
        Promedios de todas las empresas · feedback anónimo
      </p>
    </div>

    <NuxtLink
      to="/resenas"
      class="mb-10 inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-text-muted no-underline transition-colors duration-150 hover:text-accent"
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        aria-hidden="true"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Directorio de empresas
    </NuxtLink>

    <div
      v-if="pending"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <div class="mb-2 flex gap-1.5">
        <span class="size-1.75 rounded-full bg-border animate-loading-dot" />
        <span
          class="size-1.75 rounded-full bg-border animate-loading-dot [animation-delay:0.2s]"
        />
        <span
          class="size-1.75 rounded-full bg-border animate-loading-dot [animation-delay:0.4s]"
        />
      </div>
      <p class="m-0 text-sm text-text-subtle">Cargando datos...</p>
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Error al cargar
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No pudimos obtener los datos. Intenta de nuevo.
      </p>
    </div>

    <CompanyStatsPanel
      v-else-if="stats"
      company-name="Todas las empresas"
      :stats="stats"
      :submission-count="submissionCount"
    />
  </div>
</template>
