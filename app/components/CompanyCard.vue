<script setup lang="ts">
import type { CompanyOverviewItem } from "~~/shared/types/company";
import { formatAvgResponseDays } from "~~/shared/utils/formatResponseTime";
import { formatCompactSalary } from "~~/shared/utils/formatSalary";

const props = defineProps<{
  company: CompanyOverviewItem;
}>();

const to = computed(
  () => `/resenas/${encodeURIComponent(props.company.name_normalized)}`,
);

const monogram = computed(
  () => props.company.name.trim().charAt(0).toUpperCase() || "?",
);

const logoFailed = ref(false);

const showLogo = computed(
  () => Boolean(props.company.logo_url) && !logoFailed.value,
);

watch(
  () => props.company.logo_url,
  () => {
    logoFailed.value = false;
  },
);

const reviewLabel = computed(() =>
  props.company.review_count === 1
    ? "1 reseña"
    : `${props.company.review_count} reseñas`,
);

const ratingLabel = computed(() => {
  const value = props.company.avg_rating;
  return value == null || Number.isNaN(value) ? null : value.toFixed(1);
});

const responseLabel = computed(() =>
  formatAvgResponseDays(props.company.avg_response_days),
);

const stagesLabel = computed(() => {
  const value = props.company.avg_stages;
  if (value == null || Number.isNaN(value)) return null;
  return value % 1 === 0 ? String(value) : value.toFixed(1);
});

const salaryLabel = computed(() => {
  const value = props.company.avg_salary;
  if (value == null || Number.isNaN(value)) return null;
  return formatCompactSalary(value);
});

const showWorkplaceStrip = computed(() => salaryLabel.value != null);

function percentLabel(value: number | null | undefined): string {
  return value == null || Number.isNaN(value) ? "—" : `${Math.round(value)}%`;
}
</script>

<template>
  <NuxtLink :to="to"
    class="group flex min-h-44 h-full flex-col gap-4 bg-surface p-7 no-underline transition-colors duration-150 hover:bg-surface-alt">
    <div class="flex items-center gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-alt font-display text-lg font-bold text-text-muted transition-colors duration-150 group-hover:border-text-subtle"
        aria-hidden="true">
        <img v-if="showLogo" :src="company.logo_url!" :alt="`${company.name} logo`" class="size-full object-cover"
          @error="logoFailed = true" />
        <template v-else>{{ monogram }}</template>
      </span>
      <span class="flex min-w-0 flex-1 flex-col">
        <span class="truncate font-display text-base font-semibold tracking-tight text-text" :title="company.name">
          {{ company.name }}
        </span>
        <span class="font-mono text-xs tracking-wide text-text-subtle">
          {{ reviewLabel }}
        </span>
      </span>
    </div>

    <div class="grid grid-cols-3 gap-x-3 gap-y-4 border-t border-border pt-4">
      <div class="flex flex-col gap-1">
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Rating</span>
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
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Ofertas</span>
        <span class="text-sm font-medium text-positive">
          {{ percentLabel(company.offer_rate) }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Ghost</span>
        <span class="text-sm font-medium text-ghost">
          {{ percentLabel(company.ghost_rate) }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Respuesta</span>
        <span class="text-sm font-medium text-text">
          <template v-if="responseLabel">{{ responseLabel }}</template>
          <span v-else class="text-text-subtle">—</span>
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Etapas</span>
        <span class="text-sm font-medium text-text">
          <template v-if="stagesLabel">{{ stagesLabel }}</template>
          <span v-else class="text-text-subtle">—</span>
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Remoto</span>
        <span class="text-sm font-medium text-text">
          {{ percentLabel(company.remote_rate) }}
        </span>
      </div>
    </div>

    <div v-if="showWorkplaceStrip" class="border-t border-border pt-3">
      <div class="flex flex-col gap-1">
        <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">Sueldo</span>
        <span class="text-sm font-medium text-text">
          {{ salaryLabel }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
