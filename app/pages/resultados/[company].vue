<script setup lang="ts">
import type { CompanyOption } from "~/components/CompanySearch.vue";
import type { CompanyStats } from "~~/shared/utils/companyStats";

const route = useRoute();

const slug = computed(() =>
  decodeURIComponent(route.params.company as string),
);

interface CompanyPageResponse {
  company: {
    id: string;
    name: string;
    name_normalized: string;
  } | null;
  stats: CompanyStats | null;
}

const { data, error, pending } = await useAsyncData(
  computed(() => `company-stats-${slug.value}`),
  () =>
    $fetch<CompanyPageResponse>(
      `/api/companies/${encodeURIComponent(slug.value)}`,
    ),
  { watch: [slug] },
);

const company = computed(() => data.value?.company ?? null);
const stats = computed(() => data.value?.stats ?? null);
const submissionCount = computed(() => stats.value?.total ?? 0);

function onSelect(selected: CompanyOption) {
  if (selected.name_normalized === slug.value) return;
  return navigateTo(
    `/resultados/${encodeURIComponent(selected.name_normalized)}`,
  );
}
</script>

<template>
  <div class="mx-auto max-w-3xl overflow-x-clip px-6 pt-10 pb-24">
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
          to="/resultados"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          resultados
        </NuxtLink>
        <template v-if="company">
          <span class="text-text-subtle">/</span>
          <span class="text-accent">{{ company.name }}</span>
        </template>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Resultados
      </h1>
      <p class="m-0 font-mono text-13 tracking-wide text-text-subtle">
        Estadísticas por empresa · feedback anónimo
      </p>
    </div>

    <div class="relative z-40 mb-8">
      <CompanySearch
        :model-value="company?.name ?? ''"
        label="Buscar empresa"
        placeholder="Cambiar empresa..."
        @company-select="onSelect"
      />
    </div>

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
      <NuxtLink
        to="/resultados"
        class="mt-3 text-sm text-accent no-underline hover:text-accent-hover"
      >
        ← Volver a resultados
      </NuxtLink>
    </div>

    <div
      v-else-if="!company || !stats"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Empresa no encontrada
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No hay datos para «{{ slug }}». Prueba buscando otra empresa.
      </p>
      <NuxtLink
        to="/resultados"
        class="mt-3 text-sm text-accent no-underline hover:text-accent-hover"
      >
        ← Volver a resultados
      </NuxtLink>
    </div>

    <CompanyStatsPanel
      v-else
      :company-name="company.name"
      :company-slug="company.name_normalized"
      :stats="stats"
      :submission-count="submissionCount"
    />
  </div>
</template>
