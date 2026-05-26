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
  <div class="page-resultados">
    <div class="page-header">
      <div class="page-breadcrumb">
        <NuxtLink to="/" class="breadcrumb-link">inicio</NuxtLink>
        <span class="breadcrumb-sep">/</span>
        <NuxtLink to="/resultados" class="breadcrumb-link">resultados</NuxtLink>
        <template v-if="company">
          <span class="breadcrumb-sep">/</span>
          <span class="breadcrumb-current">{{ company.name }}</span>
        </template>
      </div>
      <h1 class="page-title">Resultados</h1>
      <p class="page-subtitle">
        Estadísticas por empresa · feedback anónimo
      </p>
    </div>

    <div class="search-block">
      <CompanySearch
        :model-value="company?.name ?? ''"
        label="Buscar empresa"
        placeholder="Cambiar empresa..."
        @company-select="onSelect"
      />
    </div>

    <div v-if="pending" class="state-loading">
      <div class="loading-row">
        <span class="loading-dot" />
        <span class="loading-dot" />
        <span class="loading-dot" />
      </div>
      <p class="state-text">Cargando datos...</p>
    </div>

    <div v-else-if="error" class="state-error">
      <p class="state-title">Error al cargar</p>
      <p class="state-text">No pudimos obtener los datos. Intenta de nuevo.</p>
      <NuxtLink to="/resultados" class="state-link">← Volver a resultados</NuxtLink>
    </div>

    <div v-else-if="!company || !stats" class="state-error">
      <p class="state-title">Empresa no encontrada</p>
      <p class="state-text">
        No hay datos para «{{ slug }}». Prueba buscando otra empresa.
      </p>
      <NuxtLink to="/resultados" class="state-link">← Volver a resultados</NuxtLink>
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

<style scoped>
.page-resultados {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
  overflow-x: clip;
}

.page-header {
  margin-bottom: 2rem;
}

.page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  margin-bottom: 1.25rem;
  flex-wrap: wrap;
}

.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.12s ease;
}

.breadcrumb-link:hover {
  color: var(--color-text);
}

.breadcrumb-sep {
  color: var(--color-text-subtle);
}

.breadcrumb-current {
  color: var(--color-accent);
}

.page-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.page-subtitle {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
  margin: 0;
  letter-spacing: 0.01em;
}

.search-block {
  position: relative;
  z-index: 40;
  margin-bottom: 2rem;
}

.state-loading,
.state-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 4rem 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.5rem;
  background-color: var(--color-surface);
}

.state-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin: 0;
}

.state-text {
  font-size: 0.875rem;
  color: var(--color-text-subtle);
  margin: 0;
}

.state-link {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  color: var(--color-accent);
  text-decoration: none;
}

.state-link:hover {
  color: var(--color-accent-hover);
}

.loading-row {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.loading-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background-color: var(--color-border);
  animation: pulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
