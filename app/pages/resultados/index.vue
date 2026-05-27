<script setup lang="ts">
import type { CompanyOption } from "~/components/CompanySearch.vue";

const dropdownOpen = ref(false);

function onSelect(company: CompanyOption) {
  return navigateTo(`/resultados/${encodeURIComponent(company.name_normalized)}`);
}

useSeoMeta({
  title: "Resultados",
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
        <span class="text-accent">resultados</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Resultados
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
        Selecciona una empresa para ver estadísticas detalladas de sus procesos de selección.
      </p>
    </div>

    <div v-show="!dropdownOpen">
      <div
        class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
      >
        <div class="mb-1 text-text-subtle" aria-hidden="true">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <p class="m-0 font-display text-base font-bold text-text-muted">
          Busca una empresa
        </p>
        <p class="m-0 max-w-88 text-sm text-text-subtle">
          Usa el buscador para explorar tiempos de respuesta, resultados y etapas por empresa.
        </p>
      </div>
    </div>
  </div>
</template>
