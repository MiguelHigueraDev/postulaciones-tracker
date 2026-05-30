<script setup lang="ts">
import type { CompanyStats } from "~~/shared/utils/companyStats";
import { getResultStyle } from "~~/shared/constants/resultStyles";

const props = withDefaults(
  defineProps<{
    companyName: string;
    companySlug?: string;
    companyLogoUrl?: string | null;
    stats: CompanyStats;
    submissionCount: number;
    showHeader?: boolean;
  }>(),
  {
    showHeader: true,
  },
);

const logoFailed = ref(false);

const showLogo = computed(
  () => Boolean(props.companyLogoUrl) && !logoFailed.value,
);

const monogram = computed(
  () => props.companyName.trim().charAt(0).toUpperCase() || "?",
);

const hasRubrosCargos = computed(
  () =>
    props.stats.industries.length > 0 || props.stats.positions.length > 0,
);

watch(
  () => props.companyLogoUrl,
  () => {
    logoFailed.value = false;
  },
);
</script>

<template>
  <div class="flex min-w-0 flex-col gap-8">
    <header
      v-if="showHeader"
      class="flex flex-wrap items-start justify-between gap-6 border-b border-border-subtle pb-6"
    >
      <div class="flex items-center gap-4">
        <span
          v-if="companySlug"
          class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-alt font-display text-xl font-bold text-text-muted"
          aria-hidden="true"
        >
          <img
            v-if="showLogo"
            :src="companyLogoUrl!"
            :alt="`${companyName} logo`"
            class="size-full object-cover"
            @error="logoFailed = true"
          />
          <template v-else>{{ monogram }}</template>
        </span>
        <h2 class="m-0 font-display text-28 font-extrabold tracking-tight text-text">
          {{ companyName }}
        </h2>
      </div>
      <div
        class="inline-flex flex-col items-end rounded-md border border-border bg-surface px-4 py-2"
      >
        <span class="font-mono text-2xl font-medium leading-none text-accent">
          {{ submissionCount }}
        </span>
        <span class="font-mono text-11 tracking-wide text-text-subtle">
          {{ submissionCount === 1 ? "registro" : "registros" }}
        </span>
      </div>
    </header>

    <div
      v-if="submissionCount === 0"
      class="rounded-card border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <p class="m-0 mb-2 font-display text-base font-bold text-text-muted">
        {{ companySlug ? "Sin datos para esta empresa" : "Sin datos aún" }}
      </p>
      <p class="m-0 mb-4 text-sm text-text-subtle">
        {{
          companySlug
            ? "Aún no hay feedback publicado. Sé el primero en compartir tu experiencia."
            : "Aún no hay feedback publicado. Sé el primero en compartir tu experiencia con la comunidad."
        }}
      </p>
      <NuxtLink
        to="/enviar"
        class="text-sm font-medium text-accent no-underline hover:text-accent-hover"
      >
        Enviar feedback →
      </NuxtLink>
    </div>

    <template v-else>
      <div class="stats-grid">
        <section class="stats-card">
          <h3
            class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
          >
            Resultados
          </h3>
          <ul class="m-0 flex list-none flex-col gap-3.5 p-0">
            <li v-for="entry in stats.results" :key="entry.key">
              <div class="mb-1.5 flex items-center gap-2 text-13">
                <span
                  class="size-1.5 shrink-0 rounded-full"
                  :style="{ backgroundColor: getResultStyle(entry.key).dot }"
                  aria-hidden="true"
                />
                <span class="flex-1 font-normal text-text">
                  {{ getResultStyle(entry.key).label }}
                </span>
                <span class="font-mono text-text-muted">{{ entry.count }}</span>
                <span class="min-w-10 text-right font-mono text-text-subtle">
                  {{ entry.percent }}%
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-bar bg-surface-alt">
                <div
                  class="h-full min-w-0 rounded-bar transition-[width] duration-300 ease-out"
                  :style="{
                    width: `${entry.percent}%`,
                    backgroundColor: getResultStyle(entry.key).dot,
                  }"
                />
              </div>
            </li>
          </ul>
        </section>

        <section class="stats-card">
          <h3
            class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
          >
            Tiempos de respuesta
          </h3>
          <ul class="m-0 flex list-none flex-col gap-3.5 p-0">
            <li v-for="entry in stats.responseTimes" :key="entry.key">
              <div class="mb-1.5 flex items-center gap-2 text-13">
                <span class="flex-1 text-13 text-text-muted">
                  {{ entry.key }}
                </span>
                <span class="font-mono text-text-muted">{{ entry.count }}</span>
                <span class="min-w-10 text-right font-mono text-text-subtle">
                  {{ entry.percent }}%
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-bar bg-surface-alt">
                <div
                  class="h-full min-w-0 rounded-bar bg-accent opacity-65 transition-[width] duration-300 ease-out"
                  :style="{ width: `${entry.percent}%` }"
                />
              </div>
            </li>
          </ul>
        </section>

        <section class="stats-card">
          <h3
            class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
          >
            Proceso
          </h3>
          <div class="grid grid-cols-1 gap-3 900:grid-cols-2">
            <div
              class="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-alt px-4 py-3"
            >
              <span class="font-mono text-lg font-medium text-text">
                {{ stats.stages.average }}
              </span>
              <span class="font-mono text-11 text-text-subtle lowercase">
                etapas promedio
              </span>
            </div>
            <div
              class="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface-alt px-4 py-3"
            >
              <span class="font-mono text-lg font-medium text-text">
                {{ stats.stages.min }}–{{ stats.stages.max }}
              </span>
              <span class="font-mono text-11 text-text-subtle lowercase">
                rango etapas
              </span>
            </div>
          </div>
          <ul
            v-if="stats.lastStages.length > 0"
            class="mt-5 flex list-none flex-col gap-3.5 p-0"
          >
            <li v-for="entry in stats.lastStages" :key="entry.key">
              <div class="mb-1.5 flex items-center gap-2 text-13">
                <span class="flex-1 text-13 text-text-muted">
                  {{ entry.key }}
                </span>
                <span class="font-mono text-text-muted">{{ entry.count }}</span>
                <span class="min-w-10 text-right font-mono text-text-subtle">
                  {{ entry.percent }}%
                </span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-bar bg-surface-alt">
                <div
                  class="h-full min-w-0 rounded-bar bg-accent opacity-65 transition-[width] duration-300 ease-out"
                  :style="{ width: `${entry.percent}%` }"
                />
              </div>
            </li>
          </ul>
        </section>

        <section v-if="hasRubrosCargos" class="stats-card">
          <h3
            class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
          >
            Rubros y cargos
          </h3>
          <div v-if="stats.industries.length > 0" class="mb-5 last:mb-0">
            <span class="mb-2 block font-mono text-11 text-text-subtle lowercase">
              Rubros
            </span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="entry in stats.industries"
                :key="entry.key"
                class="inline-flex items-center gap-1.5 rounded border border-border bg-surface-alt px-2.5 py-1 text-13 text-text-muted"
              >
                {{ entry.key }}
                <span class="font-mono text-11 text-accent">
                  {{ entry.count }}
                </span>
              </span>
            </div>
          </div>
          <div v-if="stats.positions.length > 0" class="mb-5 last:mb-0">
            <span class="mb-2 block font-mono text-11 text-text-subtle lowercase">
              Cargos
            </span>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="entry in stats.positions"
                :key="entry.key"
                class="inline-flex items-center gap-1.5 rounded border border-border bg-surface-alt px-2.5 py-1 text-13 text-text-muted"
              >
                {{ entry.key }}
                <span class="font-mono text-11 text-accent">
                  {{ entry.count }}
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>

      <WorkplaceStatsSection
        v-if="stats.workplace"
        :workplace="stats.workplace"
        :positions="stats.positions"
        :company-slug="companySlug"
      />

      <CompanySubmissionsList
        v-if="companySlug"
        :company-name="companyName"
        :company-slug="companySlug"
        :total-count="submissionCount"
      />
    </template>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}

@media (min-width: 900px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}

.stats-card {
  min-width: 0;
  border-radius: var(--radius-card, 0.625rem);
  border: 1px solid var(--color-border-subtle, #1c1c2c);
  background-color: var(--color-surface, #111118);
  padding: 1.25rem;
}
</style>
