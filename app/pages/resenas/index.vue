<script setup lang="ts">
import type { CompanyOption } from "~/components/CompanySearch.vue";
import type { GlobalStatsResponse } from "~~/shared/utils/companyStats";

const dropdownOpen = ref(false);

const { data, error, pending } = await useAsyncData("global-stats", () =>
  $fetch<GlobalStatsResponse>("/api/stats"),
);

const stats = computed(() => data.value?.stats ?? null);
const submissionCount = computed(() => stats.value?.total ?? 0);

function onSelect(company: CompanyOption) {
  return navigateTo(`/resenas/${encodeURIComponent(company.name_normalized)}`);
}

useSeoMeta({
  title: "Reseñas",
  description:
    "Feedback colectivo anónimo sobre procesos de selección en empresas tech de Chile.",
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 pt-10 pb-24 md:px-8">
    <div class="mb-8">
      <div class="mb-5 flex items-center gap-1.5 font-mono text-xs">
        <NuxtLink
          to="/"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <span class="text-accent">reseñas</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Reseñas
      </h1>
      <p class="m-0 font-mono text-13 tracking-wide text-text-subtle">
        Feedback colectivo anónimo · empresas en Chile
      </p>
    </div>

    <div class="relative z-40 mb-10">
      <CompanySearch
        label="Buscar empresa"
        placeholder="Buscar empresa..."
        @company-select="onSelect"
        @dropdown-open="dropdownOpen = $event"
      />
      <p class="mt-3 mb-0 text-sm font-light text-text-subtle">
        Promedios de todas las empresas abajo, o busca una para ver el detalle.
      </p>
    </div>

    <div v-show="!dropdownOpen">
      <div
        v-if="pending"
        class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
      >
        <div class="mb-2 flex gap-1.5">
          <span
            class="size-1.75 rounded-full bg-border animate-loading-dot"
          />
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
  </div>
</template>
