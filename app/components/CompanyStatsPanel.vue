<script setup lang="ts">
import type { CompanyStats } from "~~/shared/utils/companyStats";
import { getResultStyle } from "~~/shared/constants/resultStyles";

const props = defineProps<{
  companyName: string;
  companySlug: string;
  stats: CompanyStats;
  submissionCount: number;
}>();
</script>

<template>
  <div class="stats-panel">
    <header class="stats-hero">
      <div>
        <h2 class="stats-company">{{ companyName }}</h2>
      </div>
      <div class="stats-total">
        <span class="stats-total-num">{{ submissionCount }}</span>
        <span class="stats-total-label">
          {{ submissionCount === 1 ? "registro" : "registros" }}
        </span>
      </div>
    </header>

    <div v-if="submissionCount === 0" class="stats-empty">
      <p class="stats-empty-title">Sin datos para esta empresa</p>
      <p class="stats-empty-text">
        Aún no hay feedback publicado. Sé el primero en compartir tu experiencia.
      </p>
      <NuxtLink to="/enviar" class="stats-empty-cta">Enviar feedback →</NuxtLink>
    </div>

    <template v-else>
      <section class="stats-section">
        <h3 class="stats-section-title">Resultados</h3>
        <ul class="bar-list">
          <li v-for="entry in stats.results" :key="entry.key" class="bar-row">
            <div class="bar-meta">
              <span class="bar-dot" :style="{ backgroundColor: getResultStyle(entry.key).dot }" aria-hidden="true" />
              <span class="bar-label">{{ getResultStyle(entry.key).label }}</span>
              <span class="bar-count">{{ entry.count }}</span>
              <span class="bar-pct">{{ entry.percent }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill" :style="{
                width: `${entry.percent}%`,
                backgroundColor: getResultStyle(entry.key).dot,
              }" />
            </div>
          </li>
        </ul>
      </section>

      <section class="stats-section">
        <h3 class="stats-section-title">Tiempos de respuesta</h3>
        <ul class="bar-list">
          <li v-for="entry in stats.responseTimes" :key="entry.key" class="bar-row">
            <div class="bar-meta">
              <span class="bar-label bar-label--long">{{ entry.key }}</span>
              <span class="bar-count">{{ entry.count }}</span>
              <span class="bar-pct">{{ entry.percent }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-fill--muted" :style="{ width: `${entry.percent}%` }" />
            </div>
          </li>
        </ul>
      </section>

      <section class="stats-section">
        <h3 class="stats-section-title">Proceso</h3>
        <div class="stats-kpis">
          <div class="kpi">
            <span class="kpi-value">{{ stats.stages.average }}</span>
            <span class="kpi-label">etapas promedio</span>
          </div>
          <div class="kpi">
            <span class="kpi-value">{{ stats.stages.min }}–{{ stats.stages.max }}</span>
            <span class="kpi-label">rango etapas</span>
          </div>
        </div>
        <ul v-if="stats.lastStages.length > 0" class="bar-list bar-list--compact">
          <li v-for="entry in stats.lastStages" :key="entry.key" class="bar-row">
            <div class="bar-meta">
              <span class="bar-label bar-label--long">{{ entry.key }}</span>
              <span class="bar-count">{{ entry.count }}</span>
              <span class="bar-pct">{{ entry.percent }}%</span>
            </div>
            <div class="bar-track">
              <div class="bar-fill bar-fill--muted" :style="{ width: `${entry.percent}%` }" />
            </div>
          </li>
        </ul>
      </section>

      <section v-if="stats.industries.length > 0 || stats.positions.length > 0" class="stats-section">
        <h3 class="stats-section-title">Rubros y cargos</h3>
        <div v-if="stats.industries.length > 0" class="chip-group">
          <span class="chip-group-label">Rubros</span>
          <div class="chips">
            <span v-for="entry in stats.industries" :key="entry.key" class="chip">
              {{ entry.key }}
              <span class="chip-count">{{ entry.count }}</span>
            </span>
          </div>
        </div>
        <div v-if="stats.positions.length > 0" class="chip-group">
          <span class="chip-group-label">Cargos</span>
          <div class="chips">
            <span v-for="entry in stats.positions" :key="entry.key" class="chip">
              {{ entry.key }}
              <span class="chip-count">{{ entry.count }}</span>
            </span>
          </div>
        </div>
      </section>

      <CompanySubmissionsList
        :company-slug="companySlug"
        :total-count="submissionCount"
      />
    </template>
  </div>
</template>

<style scoped>
.stats-panel {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  min-width: 0;
}

.stats-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid var(--color-border-subtle);
}

.stats-company {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0;
}

.stats-note {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-yield);
  margin: 0.5rem 0 0;
}

.stats-total {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  padding: 0.5rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
}

.stats-total-num {
  font-family: var(--font-mono);
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--color-accent);
  line-height: 1;
}

.stats-total-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  letter-spacing: 0.03em;
}

.stats-empty {
  text-align: center;
  padding: 4rem 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.5rem;
  background-color: var(--color-surface);
}

.stats-empty-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  margin: 0 0 0.5rem;
}

.stats-empty-text {
  font-size: 0.875rem;
  color: var(--color-text-subtle);
  margin: 0 0 1rem;
}

.stats-empty-cta {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
}

.stats-empty-cta:hover {
  color: var(--color-accent-hover);
}

.stats-section-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin: 0 0 1rem;
}

.bar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
}

.bar-list--compact {
  margin-top: 1.25rem;
}

.bar-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.375rem;
  font-size: 0.8125rem;
}

.bar-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.bar-label {
  flex: 1;
  color: var(--color-text);
  font-weight: 400;
}

.bar-label--long {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.bar-count {
  font-family: var(--font-mono);
  color: var(--color-text-muted);
}

.bar-pct {
  font-family: var(--font-mono);
  color: var(--color-text-subtle);
  min-width: 2.5rem;
  text-align: right;
}

.bar-track {
  height: 0.375rem;
  background-color: var(--color-surface-alt);
  border-radius: 0.1875rem;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 0.1875rem;
  transition: width 0.3s ease;
  min-width: 0;
}

.bar-fill--muted {
  background-color: var(--color-accent);
  opacity: 0.65;
}

.stats-kpis {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.kpi {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem 1rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.375rem;
}

.kpi-value {
  font-family: var(--font-mono);
  font-size: 1.125rem;
  font-weight: 500;
  color: var(--color-text);
}

.kpi-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  text-transform: lowercase;
}

.chip-group {
  margin-bottom: 1.25rem;
}

.chip-group:last-child {
  margin-bottom: 0;
}

.chip-group-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  margin-bottom: 0.5rem;
  text-transform: lowercase;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.625rem;
  font-size: 0.8125rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  color: var(--color-text-muted);
}

.chip-count {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-accent);
}
</style>
