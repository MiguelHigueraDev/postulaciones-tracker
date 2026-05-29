<script setup lang="ts">
import { getResultStyle } from "~~/shared/constants/resultStyles";
import { MODALITY_OPTIONS } from "~~/shared/schemas/feedback";
import type { CountEntry, WorkplaceStats } from "~~/shared/utils/companyStats";
import type { PositionStats } from "~~/shared/utils/positionStats";
import { formatCompactSalary } from "~~/shared/utils/formatSalary";

defineProps<{
  positionLabel: string;
  stats: PositionStats;
}>();

const RATING_DIMENSIONS = [
  { key: "workEnvironment" as const, label: "Ambiente laboral" },
  { key: "workLifeBalance" as const, label: "Vida-trabajo" },
  { key: "careerOpportunities" as const, label: "Carrera" },
  { key: "compensationBenefits" as const, label: "Compensación" },
] as const;

const MODALITY_ICONS: Record<string, string> = {
  Remoto: "◈",
  Híbrido: "◇",
  Presencial: "◆",
};

const MODALITY_ORDER = [...MODALITY_OPTIONS];

function ratingColor(value: number): string {
  if (value >= 4.0) return "#34d399";
  if (value >= 3.0) return "#818cf8";
  if (value >= 2.0) return "#fbbf24";
  return "#f87171";
}

function sortedModalities(modalities: WorkplaceStats["modalities"]): CountEntry[] {
  const map = new Map(modalities.map((m) => [m.key, m]));
  return MODALITY_ORDER.map(
    (key) => map.get(key) ?? { key, count: 0, percent: 0 },
  ).filter((m) => m.count > 0);
}
</script>

<template>
  <div class="flex min-w-0 flex-col gap-8">
    <header
      class="flex flex-wrap items-start justify-between gap-6 border-b border-border-subtle pb-6"
    >
      <div>
        <span class="mb-1 block font-mono text-11 tracking-widest text-text-subtle uppercase">
          Cargo
        </span>
        <h2 class="m-0 font-display text-28 font-extrabold tracking-tight text-text">
          {{ positionLabel }}
        </h2>
      </div>
      <div
        class="inline-flex flex-col items-end rounded-md border border-border bg-surface px-4 py-2"
      >
        <span class="font-mono text-2xl font-medium leading-none text-accent">
          {{ stats.total }}
        </span>
        <span class="font-mono text-11 tracking-wide text-text-subtle">
          {{ stats.total === 1 ? "registro" : "registros" }}
        </span>
      </div>
    </header>

    <div
      v-if="stats.total === 0"
      class="rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <p class="m-0 mb-2 font-display text-base font-bold text-text-muted">
        Sin datos para este cargo
      </p>
      <p class="m-0 mb-4 text-sm text-text-subtle">
        Aún no hay feedback publicado. Sé el primero en compartir tu experiencia.
      </p>
      <NuxtLink
        to="/enviar"
        class="text-sm font-medium text-accent no-underline hover:text-accent-hover"
      >
        Enviar feedback →
      </NuxtLink>
    </div>

    <template v-else>
      <section>
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

      <section>
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

      <section>
        <h3
          class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
        >
          Proceso
        </h3>
        <div class="flex flex-wrap gap-6">
          <div
            class="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface px-4 py-3"
          >
            <span class="font-mono text-lg font-medium text-text">
              {{ stats.stages.average }}
            </span>
            <span class="font-mono text-11 text-text-subtle lowercase">
              etapas promedio
            </span>
          </div>
          <div
            class="flex flex-col gap-1 rounded-md border border-border-subtle bg-surface px-4 py-3"
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

      <section v-if="stats.industries.length > 0">
        <h3
          class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
        >
          Rubros
        </h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="entry in stats.industries"
            :key="entry.key"
            class="inline-flex items-center gap-1.5 rounded border border-border bg-surface px-2.5 py-1 text-13 text-text-muted"
          >
            {{ entry.key }}
            <span class="font-mono text-11 text-accent">
              {{ entry.count }}
            </span>
          </span>
        </div>
      </section>

      <section v-if="stats.companies.length > 0">
        <h3
          class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
        >
          Top empresas por volumen
        </h3>
        <ul class="m-0 flex list-none flex-col gap-2 p-0">
          <li
            v-for="entry in stats.companies"
            :key="entry.slug || entry.key"
          >
            <NuxtLink
              v-if="entry.slug"
              :to="`/resenas/${encodeURIComponent(entry.slug)}`"
              class="group flex items-center gap-3 rounded-md border border-border-subtle bg-surface px-3.5 py-2.5 no-underline transition-colors duration-150 hover:border-border hover:bg-surface-alt"
            >
              <span class="flex-1 truncate text-sm text-text">
                {{ entry.key }}
              </span>
              <span class="font-mono text-13 text-text-muted">
                {{ entry.count }}
                {{ entry.count === 1 ? "postulación" : "postulaciones" }}
              </span>
              <span
                class="font-mono text-13 text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden="true"
              >
                →
              </span>
            </NuxtLink>
            <div
              v-else
              class="flex items-center gap-3 rounded-md border border-border-subtle bg-surface px-3.5 py-2.5"
            >
              <span class="flex-1 truncate text-sm text-text-muted">
                {{ entry.key }}
              </span>
              <span class="font-mono text-13 text-text-muted">
                {{ entry.count }}
              </span>
            </div>
          </li>
        </ul>
      </section>

      <section
        v-if="stats.workplace"
        class="relative before:absolute before:-top-px before:inset-x-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-accent/30 before:to-transparent"
      >
        <div class="my-5 flex flex-wrap items-center gap-3">
          <h3
            class="m-0 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
          >
            Perfil laboral
          </h3>
          <span
            class="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-alt px-2 py-0.5 font-mono text-11 text-text-subtle"
          >
            {{ stats.workplace.count }}
            {{ stats.workplace.count === 1 ? "perfil" : "perfiles" }}
          </span>
        </div>

        <p
          class="mt-0 mb-5 text-xs leading-relaxed text-text-subtle"
        >
          Datos opcionales aportados solo por quienes aceptaron la oferta para
          este cargo.
        </p>

        <div v-if="stats.workplace.salary.count > 0" class="mb-6">
          <span
            class="mb-3 block font-mono text-11 tracking-widest text-text-subtle uppercase"
          >
            Sueldo líquido mensual (CLP)
          </span>
          <div
            v-if="
              stats.workplace.salary.p25 !== null &&
              stats.workplace.salary.p25 !== undefined &&
              stats.workplace.salary.p75 !== null &&
              stats.workplace.salary.p75 !== undefined &&
              stats.workplace.salary.count >= 2
            "
            class="mb-3 grid grid-cols-3 gap-3"
          >
            <div class="rounded-card border border-border-subtle bg-surface px-3.5 py-3.5">
              <span class="block font-mono text-11 text-text-subtle lowercase">
                P25
              </span>
              <span class="mt-1 block font-mono text-base font-semibold text-text">
                {{ formatCompactSalary(stats.workplace.salary.p25) }}
              </span>
            </div>
            <div class="rounded-card border border-accent/40 bg-surface px-3.5 py-3.5">
              <span class="block font-mono text-11 text-accent lowercase">
                Mediana
              </span>
              <span
                class="mt-1 block font-mono text-base font-semibold text-accent"
              >
                {{ formatCompactSalary(stats.workplace.salary.median ?? 0) }}
              </span>
            </div>
            <div class="rounded-card border border-border-subtle bg-surface px-3.5 py-3.5">
              <span class="block font-mono text-11 text-text-subtle lowercase">
                P75
              </span>
              <span class="mt-1 block font-mono text-base font-semibold text-text">
                {{ formatCompactSalary(stats.workplace.salary.p75) }}
              </span>
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-13 text-text-muted">
            <div
              v-if="stats.workplace.salary.avg !== null"
              class="flex items-baseline gap-1.5"
            >
              <span class="text-11 text-text-subtle lowercase">avg</span>
              <span>
                {{ formatCompactSalary(stats.workplace.salary.avg) }}
              </span>
            </div>
            <div
              v-if="stats.workplace.salary.min !== null"
              class="flex items-baseline gap-1.5"
            >
              <span class="text-11 text-text-subtle lowercase">min</span>
              <span>
                {{ formatCompactSalary(stats.workplace.salary.min) }}
              </span>
            </div>
            <div
              v-if="stats.workplace.salary.max !== null"
              class="flex items-baseline gap-1.5"
            >
              <span class="text-11 text-text-subtle lowercase">max</span>
              <span>
                {{ formatCompactSalary(stats.workplace.salary.max) }}
              </span>
            </div>
            <span class="text-11 text-text-subtle">
              · {{ stats.workplace.salary.count }}
              {{ stats.workplace.salary.count === 1 ? "dato" : "datos" }}
            </span>
          </div>
        </div>

        <div
          v-if="stats.workplace.ratings.count > 0"
          class="mb-6"
        >
          <span
            class="mb-3 block font-mono text-11 tracking-widest text-text-subtle uppercase"
          >
            Valoraciones
          </span>
          <div class="flex flex-col gap-2.5">
            <div
              v-for="dim in RATING_DIMENSIONS"
              :key="dim.key"
              class="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 sm:grid-cols-[8rem_1fr_2rem] sm:gap-3"
            >
              <span class="truncate text-13 text-text-muted">
                {{ dim.label }}
              </span>
              <div class="h-1.5 overflow-hidden rounded-bar bg-surface-alt">
                <div
                  v-if="stats.workplace.ratings[dim.key] !== null"
                  class="h-full rounded-bar opacity-75 transition-[width] duration-500 ease-out"
                  :style="{
                    width: `${((stats.workplace.ratings[dim.key]!) / 5) * 100}%`,
                    backgroundColor: ratingColor(
                      stats.workplace.ratings[dim.key]!,
                    ),
                  }"
                />
              </div>
              <span
                class="text-right font-mono text-13 font-medium"
                :style="{
                  color:
                    stats.workplace.ratings[dim.key] !== null
                      ? ratingColor(stats.workplace.ratings[dim.key]!)
                      : 'var(--color-text-subtle)',
                }"
              >
                {{
                  stats.workplace.ratings[dim.key] !== null
                    ? stats.workplace.ratings[dim.key]
                    : "—"
                }}
              </span>
            </div>
          </div>
        </div>

        <div
          v-if="sortedModalities(stats.workplace.modalities).length > 0"
          class="rounded-card border border-border-subtle bg-surface px-4.5 py-4"
        >
          <span
            class="mb-3 block font-mono text-11 tracking-widest text-text-subtle uppercase"
          >
            Modalidad
          </span>
          <div class="flex flex-col gap-2">
            <div
              v-for="mod in sortedModalities(stats.workplace.modalities)"
              :key="mod.key"
              class="grid grid-cols-[5rem_1fr_2rem] items-center gap-2 sm:grid-cols-[5.5rem_1fr_2rem] sm:gap-3"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-[0.625rem] leading-none text-accent">
                  {{ MODALITY_ICONS[mod.key] ?? "◇" }}
                </span>
                <span class="text-13 text-text-muted">{{ mod.key }}</span>
              </div>
              <div class="h-1.5 overflow-hidden rounded-bar bg-surface-alt">
                <div
                  class="h-full rounded-bar bg-accent opacity-55 transition-[width] duration-500 ease-out"
                  :style="{ width: `${mod.percent}%` }"
                />
              </div>
              <span
                class="min-w-8 text-right font-mono text-11 text-text-subtle"
              >
                {{ mod.percent }}%
              </span>
            </div>
          </div>
        </div>
      </section>

      <section v-if="stats.topCompaniesByRating.length > 0">
        <h3
          class="m-0 mb-2 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
        >
          Mejor evaluadas para este cargo
        </h3>
        <p class="mt-0 mb-4 text-xs text-text-subtle">
          Empresas con al menos 3 perfiles laborales para este cargo, ordenadas
          por promedio general.
        </p>
        <ul class="m-0 flex list-none flex-col gap-2 p-0">
          <li
            v-for="entry in stats.topCompaniesByRating"
            :key="entry.slug || entry.name"
          >
            <NuxtLink
              :to="`/resenas/${encodeURIComponent(entry.slug)}`"
              class="group flex items-center gap-3 rounded-md border border-border-subtle bg-surface px-3.5 py-2.5 no-underline transition-colors duration-150 hover:border-border hover:bg-surface-alt"
            >
              <span class="flex-1 truncate text-sm text-text">
                {{ entry.name }}
              </span>
              <span
                v-if="entry.overall !== null"
                class="font-mono text-13 font-medium"
                :style="{ color: ratingColor(entry.overall) }"
              >
                {{ entry.overall }}
              </span>
              <span class="font-mono text-11 text-text-subtle">
                {{ entry.ratings_count }}
                {{ entry.ratings_count === 1 ? "perfil" : "perfiles" }}
              </span>
              <span
                class="font-mono text-13 text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100"
                aria-hidden="true"
              >
                →
              </span>
            </NuxtLink>
          </li>
        </ul>
      </section>
    </template>
  </div>
</template>
