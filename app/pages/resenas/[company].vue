<script setup lang="ts">
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
    logo_url: string | null;
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

const logoFailed = ref(false);

const showLogo = computed(
  () => Boolean(company.value?.logo_url) && !logoFailed.value,
);

const monogram = computed(
  () => company.value?.name.trim().charAt(0).toUpperCase() || "?",
);

watch(
  () => company.value?.logo_url,
  () => {
    logoFailed.value = false;
  },
);

function resultPercent(key: string): number | null {
  const entry = stats.value?.results.find((r) => r.key === key);
  return entry != null ? entry.percent : null;
}

const ghostRate = computed(() => resultPercent("Ghost"));
const acceptRate = computed(() => resultPercent("Oferta - Aceptada"));
const ratingLabel = computed(() => {
  const value = stats.value?.workplace?.ratings.overall;
  return value == null || Number.isNaN(value) ? null : value.toFixed(1);
});

function percentLabel(value: number | null | undefined): string {
  return value == null || Number.isNaN(value) ? "—" : `${Math.round(value)}%`;
}

const registrosLabel = computed(() =>
  submissionCount.value === 1 ? "registro" : "registros",
);

useSeoMeta({
  title: () => {
    if (pending.value) return "Reseñas";
    if (error.value || !company.value) return "Empresa no encontrada";
    return company.value.name;
  },
  description: () => {
    if (!company.value) {
      return "Estadísticas de procesos de selección por empresa en Chile.";
    }
    return `Estadísticas de postulación en ${company.value.name}: tiempos de respuesta, etapas y resultados.`;
  },
});
</script>

<template>
  <div class="mx-auto max-w-304 overflow-x-clip px-6 pt-10 pb-24">
    <div class="mb-10">
      <div class="mb-5 flex flex-wrap items-center gap-1.5 font-mono text-xs">
        <NuxtLink to="/" class="text-text-muted no-underline transition-colors duration-150 hover:text-text">
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <NuxtLink to="/resenas" class="text-text-muted no-underline transition-colors duration-150 hover:text-text">
          reseñas
        </NuxtLink>
        <template v-if="company">
          <span class="text-text-subtle">/</span>
          <span class="text-accent">{{ company.name }}</span>
        </template>
      </div>

      <template v-if="company && stats">
        <div class="flex flex-wrap items-start gap-4 gap-y-3">
          <span
            class="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-alt font-display text-xl font-bold text-text-muted"
            aria-hidden="true">
            <img v-if="showLogo" :src="company.logo_url!" :alt="`${company.name} logo`" class="size-full object-cover"
              @error="logoFailed = true" />
            <template v-else>{{ monogram }}</template>
          </span>
          <div class="min-w-0 flex-1">
            <h1 class="m-0 font-display text-32 font-extrabold tracking-tight text-text md:text-40">
              {{ company.name }}
            </h1>
            <NuxtLink
              to="/resenas"
              class="mt-2 inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-text-muted no-underline transition-colors duration-150 hover:text-accent"
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
          </div>
          <div class="inline-flex shrink-0 flex-col items-end rounded-md border border-border bg-surface px-4 py-2">
            <span class="font-mono text-2xl font-medium leading-none text-accent">
              {{ submissionCount }}
            </span>
            <span class="font-mono text-11 tracking-wide text-text-subtle">
              {{ registrosLabel }}
            </span>
          </div>
        </div>

        <div v-if="submissionCount > 0"
          class="mt-6 grid max-w-md grid-cols-3 gap-2 rounded-card border border-border-subtle bg-surface p-4">
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">
              Rating
            </span>
            <span class="inline-flex items-center gap-1 text-sm font-medium text-text">
              <svg v-if="ratingLabel" width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24"
                stroke-width="1.5" stroke-linejoin="round" aria-hidden="true">
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <template v-if="ratingLabel">{{ ratingLabel }}</template>
              <span v-else class="text-text-subtle">—</span>
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">
              Acepta
            </span>
            <span class="text-sm font-medium text-positive">
              {{ percentLabel(acceptRate) }}
            </span>
          </div>
          <div class="flex flex-col gap-1">
            <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">
              Ghost
            </span>
            <span class="text-sm font-medium text-ghost">
              {{ percentLabel(ghostRate) }}
            </span>
          </div>
        </div>
      </template>

      <template v-else>
        <h1 class="m-0 font-display text-32 font-extrabold tracking-tight text-text md:text-40">
          Reseñas
        </h1>
        <NuxtLink
          to="/resenas"
          class="mt-2 inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-text-muted no-underline transition-colors duration-150 hover:text-accent"
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
      </template>
    </div>

    <div v-if="pending"
      class="flex flex-col items-center gap-2 rounded-card border border-border-subtle bg-surface px-4 py-16 text-center">
      <div class="mb-2 flex gap-1.5">
        <span class="size-1.75 rounded-full bg-border animate-loading-dot" />
        <span class="size-1.75 rounded-full bg-border animate-loading-dot [animation-delay:0.2s]" />
        <span class="size-1.75 rounded-full bg-border animate-loading-dot [animation-delay:0.4s]" />
      </div>
      <p class="m-0 text-sm text-text-subtle">Cargando datos...</p>
    </div>

    <div v-else-if="error"
      class="flex flex-col items-center gap-2 rounded-card border border-border-subtle bg-surface px-4 py-16 text-center">
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Error al cargar
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No pudimos obtener los datos. Intenta de nuevo.
      </p>
      <NuxtLink to="/resenas" class="mt-3 text-sm text-accent no-underline hover:text-accent-hover">
        ← Volver a reseñas
      </NuxtLink>
    </div>

    <div v-else-if="!company || !stats"
      class="flex flex-col items-center gap-2 rounded-card border border-border-subtle bg-surface px-4 py-16 text-center">
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Empresa no encontrada
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No hay datos para «{{ slug }}». Vuelve al directorio para elegir otra empresa.
      </p>
      <NuxtLink to="/resenas" class="mt-3 text-sm text-accent no-underline hover:text-accent-hover">
        ← Volver a reseñas
      </NuxtLink>
    </div>

    <CompanyStatsPanel v-else :show-header="false" :company-name="company.name" :company-slug="company.name_normalized"
      :company-logo-url="company.logo_url" :stats="stats" :submission-count="submissionCount" />
  </div>
</template>
