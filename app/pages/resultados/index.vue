<script setup lang="ts">
import type { CompanyOption } from "~/components/CompanySearch.vue";

const dropdownOpen = ref(false);

function onSelect(company: CompanyOption) {
  return navigateTo(`/resultados/${encodeURIComponent(company.name_normalized)}`);
}
</script>

<template>
  <div class="page-resultados">
    <div class="page-header">
      <div class="page-breadcrumb">
        <NuxtLink to="/" class="breadcrumb-link">inicio</NuxtLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">resultados</span>
      </div>
      <h1 class="page-title">Resultados</h1>
      <p class="page-subtitle">
        Feedback colectivo anónimo · empresas en Chile
      </p>
    </div>

    <div class="search-block">
      <CompanySearch
        label="Buscar empresa"
        placeholder="Escribe al menos 2 caracteres..."
        @company-select="onSelect"
        @dropdown-open="dropdownOpen = $event"
      />
      <p class="search-hint">
        Selecciona una empresa para ver estadísticas detalladas de sus procesos de selección.
      </p>
    </div>

    <div v-show="!dropdownOpen" class="empty-prompt">
      <div class="empty-icon" aria-hidden="true">
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
      <p class="empty-title">Busca una empresa</p>
      <p class="empty-text">
        Usa el buscador para explorar tiempos de respuesta, resultados y etapas por empresa.
      </p>
    </div>
  </div>
</template>

<style scoped>
.page-resultados {
  max-width: 48rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
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
  margin-bottom: 2.5rem;
}

.search-hint {
  margin: 0.75rem 0 0;
  font-size: 0.875rem;
  color: var(--color-text-subtle);
  font-weight: 300;
}

.empty-prompt {
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

.empty-icon {
  color: var(--color-text-subtle);
  margin-bottom: 0.25rem;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin: 0;
}

.empty-text {
  font-size: 0.875rem;
  color: var(--color-text-subtle);
  margin: 0;
  max-width: 22rem;
}
</style>
