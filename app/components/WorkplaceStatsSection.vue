<script setup lang="ts">
import type { CountEntry, WorkplaceStats } from "~~/shared/utils/companyStats";
import { MODALITY_OPTIONS } from "~~/shared/schemas/feedback";

const props = defineProps<{
  workplace: WorkplaceStats;
  positions: CountEntry[];
  companySlug?: string;
}>();

const selectedPosition = ref("");
const filteredWorkplace = ref<WorkplaceStats | null | undefined>(undefined);
const positionOptions = ref<CountEntry[]>([...props.positions]);
const isLoading = ref(false);

const displayedWorkplace = computed(() => {
  if (selectedPosition.value) {
    return filteredWorkplace.value ?? null;
  }
  return props.workplace;
});

const showPositionFilter = computed(() => positionOptions.value.length > 1);

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

const fieldSelect =
  "block w-full max-w-xs appearance-none rounded-md border border-border bg-surface px-3 py-2 font-mono text-13 text-text transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)] cursor-pointer bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2344446a' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] bg-auto bg-position-[right_0.875rem_center] bg-no-repeat pr-10";

function formatSalary(value: number): string {
  return `$${value.toLocaleString("es-CL")}`;
}

function ratingColor(value: number): string {
  if (value >= 4.0) return "#34d399";
  if (value >= 3.0) return "#818cf8";
  if (value >= 2.0) return "#fbbf24";
  return "#f87171";
}

function ratingArcDash(value: number): string {
  const pct = (value / 5) * 100;
  return `${pct} ${100 - pct}`;
}

function sortedModalities(modalities: WorkplaceStats["modalities"]) {
  const map = new Map(modalities.map((m) => [m.key, m]));
  return MODALITY_ORDER.map(
    (key) => map.get(key) ?? { key, count: 0, percent: 0 },
  ).filter((m) => m.count > 0);
}

async function fetchWorkplaceStats(position?: string) {
  if (position) isLoading.value = true;

  try {
    const params = new URLSearchParams();
    if (props.companySlug) params.set("company", props.companySlug);
    if (position) params.set("position", position);

    const data = await $fetch<{
      positions: CountEntry[];
      workplace: WorkplaceStats | null;
    }>(`/api/workplace-stats?${params}`);

    positionOptions.value = data.positions.map(({ key, count }) => ({
      key,
      count,
      percent: 0,
    }));

    if (position) {
      filteredWorkplace.value = data.workplace;
    } else {
      filteredWorkplace.value = undefined;
    }
  } catch {
    if (position) filteredWorkplace.value = null;
  } finally {
    if (position) isLoading.value = false;
  }
}

watch(selectedPosition, (position) => {
  fetchWorkplaceStats(position || undefined);
});

onMounted(() => {
  fetchWorkplaceStats();
});
</script>

<template>
  <section
    class="relative before:absolute before:-top-px before:inset-x-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-accent/30 before:to-transparent"
  >
    <div class="my-5 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <h3
          class="m-0 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
        >
          Perfil laboral
        </h3>
        <span
          class="inline-flex items-center gap-1 rounded-full border border-border-subtle bg-surface-alt px-2 py-0.5 font-mono text-11 text-text-subtle"
        >
          {{ displayedWorkplace?.count ?? 0 }}
          {{ (displayedWorkplace?.count ?? 0) === 1 ? "perfil" : "perfiles" }}
        </span>
      </div>

      <div v-if="showPositionFilter" class="min-w-0">
        <label for="workplace-position-filter" class="sr-only">
          Filtrar por cargo
        </label>
        <select
          id="workplace-position-filter"
          v-model="selectedPosition"
          :class="fieldSelect"
          :disabled="isLoading"
        >
          <option value="">Todos los cargos</option>
          <option
            v-for="entry in positionOptions"
            :key="entry.key"
            :value="entry.key"
          >
            {{ entry.key }} ({{ entry.count }})
          </option>
        </select>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="mb-4 flex items-center gap-2 font-mono text-11 text-text-subtle"
    >
      <span class="size-1.5 rounded-full bg-border animate-loading-dot" />
      Actualizando...
    </div>

    <template v-if="displayedWorkplace">
      <div v-if="displayedWorkplace.ratings.count > 0" class="mb-6">
        <div class="flex flex-col gap-4 sm:flex-row sm:items-stretch sm:gap-6">
          <div
            v-if="displayedWorkplace.ratings.overall !== null"
            class="flex min-w-0 shrink-0 flex-row items-center gap-4 rounded-card border border-border-subtle bg-surface p-4 sm:min-w-26 sm:flex-col sm:items-center sm:justify-center sm:gap-0"
          >
            <div class="relative size-14 sm:size-18">
              <svg viewBox="0 0 36 36" class="size-full -rotate-90">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  class="stroke-surface-alt"
                  stroke-width="2.5"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  :stroke="ratingColor(displayedWorkplace.ratings.overall)"
                  stroke-width="2.5"
                  stroke-linecap="round"
                  :stroke-dasharray="
                    ratingArcDash(displayedWorkplace.ratings.overall)
                  "
                  stroke-dashoffset="25"
                  pathLength="100"
                  class="transition-[stroke-dasharray] duration-600 ease-out"
                />
              </svg>
              <span
                class="absolute inset-0 flex items-center justify-center font-mono text-base font-semibold tracking-tight sm:text-xl"
                :style="{
                  color: ratingColor(displayedWorkplace.ratings.overall),
                }"
              >
                {{ displayedWorkplace.ratings.overall }}
              </span>
            </div>
            <span class="font-mono text-11 text-text-subtle sm:mt-1.5">
              promedio
            </span>
          </div>

          <div class="flex min-w-0 flex-1 flex-col justify-center gap-2.5">
            <div
              v-for="dim in RATING_DIMENSIONS"
              :key="dim.key"
              class="grid grid-cols-[6rem_1fr_2rem] items-center gap-2 sm:grid-cols-[7rem_1fr_2rem] sm:gap-3"
            >
              <span class="truncate text-13 text-text-muted">
                {{ dim.label }}
              </span>
              <div class="h-1.5 overflow-hidden rounded-bar bg-surface-alt">
                <div
                  v-if="displayedWorkplace.ratings[dim.key] !== null"
                  class="h-full rounded-bar opacity-75 transition-[width] duration-500 ease-out"
                  :style="{
                    width: `${((displayedWorkplace.ratings[dim.key]!) / 5) * 100}%`,
                    backgroundColor: ratingColor(
                      displayedWorkplace.ratings[dim.key]!,
                    ),
                  }"
                />
              </div>
              <span
                class="text-right font-mono text-13 font-medium"
                :style="{
                  color:
                    displayedWorkplace.ratings[dim.key] !== null
                      ? ratingColor(displayedWorkplace.ratings[dim.key]!)
                      : 'var(--color-text-subtle)',
                }"
              >
                {{
                  displayedWorkplace.ratings[dim.key] !== null
                    ? displayedWorkplace.ratings[dim.key]
                    : "—"
                }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="
          displayedWorkplace.salary.count > 0 ||
          sortedModalities(displayedWorkplace.modalities).length > 0
        "
        class="grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]"
      >
        <div
          v-if="displayedWorkplace.salary.count > 0"
          class="rounded-card border border-border-subtle bg-surface px-4.5 py-4"
        >
          <span
            class="mb-3 block font-mono text-11 tracking-widest text-text-subtle uppercase"
          >
            Sueldo líquido mensual
          </span>
          <div
            class="flex flex-col items-start gap-3 sm:flex-row sm:items-end sm:gap-5"
          >
            <div
              v-if="displayedWorkplace.salary.median !== null"
              class="flex flex-col"
            >
              <span
                class="font-mono text-[1.375rem] leading-none font-semibold tracking-tight text-accent"
              >
                {{ formatSalary(displayedWorkplace.salary.median) }}
              </span>
              <span class="font-mono text-11 text-text-subtle"> mediana </span>
            </div>
            <div class="flex items-center gap-3">
              <div
                v-if="displayedWorkplace.salary.min !== null"
                class="flex flex-col gap-0.5"
              >
                <span class="font-mono text-11 text-text-subtle lowercase">
                  min
                </span>
                <span class="font-mono text-13 text-text-muted">
                  {{ formatSalary(displayedWorkplace.salary.min) }}
                </span>
              </div>
              <div class="h-6 w-px bg-border-subtle" />
              <div
                v-if="displayedWorkplace.salary.max !== null"
                class="flex flex-col gap-0.5"
              >
                <span class="font-mono text-11 text-text-subtle lowercase">
                  max
                </span>
                <span class="font-mono text-13 text-text-muted">
                  {{ formatSalary(displayedWorkplace.salary.max) }}
                </span>
              </div>
            </div>
          </div>
          <span class="mt-2 block font-mono text-11 text-text-subtle">
            {{ displayedWorkplace.salary.count }}
            {{ displayedWorkplace.salary.count === 1 ? "dato" : "datos" }}
          </span>
        </div>

        <div
          v-if="sortedModalities(displayedWorkplace.modalities).length > 0"
          class="rounded-card border border-border-subtle bg-surface px-4.5 py-4"
        >
          <span
            class="mb-3 block font-mono text-11 tracking-widest text-text-subtle uppercase"
          >
            Modalidad
          </span>
          <div class="flex flex-col gap-2">
            <div
              v-for="mod in sortedModalities(displayedWorkplace.modalities)"
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
      </div>

      <div
        v-else-if="
          selectedPosition &&
          !isLoading &&
          displayedWorkplace.salary.count === 0 &&
          sortedModalities(displayedWorkplace.modalities).length === 0
        "
        class="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center"
      >
        <p class="m-0 text-sm text-text-subtle">
          No hay perfiles laborales para «{{ selectedPosition }}».
        </p>
      </div>
    </template>

    <div
      v-else-if="selectedPosition && !isLoading"
      class="rounded-lg border border-border-subtle bg-surface px-4 py-8 text-center"
    >
      <p class="m-0 text-sm text-text-subtle">
        No hay perfiles laborales para «{{ selectedPosition }}».
      </p>
    </div>
  </section>
</template>
