<script setup lang="ts">
import type { CompanyOverviewItem } from "~~/shared/types/company";

const props = defineProps<{
  company: CompanyOverviewItem;
}>();

const to = computed(
  () => `/resenas/${encodeURIComponent(props.company.name_normalized)}`,
);

const monogram = computed(
  () => props.company.name.trim().charAt(0).toUpperCase() || "?",
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

function percentLabel(value: number | null | undefined): string {
  return value == null || Number.isNaN(value) ? "—" : `${Math.round(value)}%`;
}
</script>

<template>
  <NuxtLink
    :to="to"
    class="group flex flex-col gap-4 bg-surface p-6 no-underline transition-colors duration-150 hover:bg-surface-alt"
  >
    <div class="flex items-center gap-3">
      <span
        class="flex size-10 shrink-0 items-center justify-center rounded-md border border-border bg-surface-alt font-display text-lg font-bold text-text-muted transition-colors duration-150 group-hover:border-text-subtle"
        aria-hidden="true"
      >
        {{ monogram }}
      </span>
      <span class="flex min-w-0 flex-1 flex-col">
        <span
          class="truncate font-display text-base font-semibold tracking-tight text-text"
          :title="company.name"
        >
          {{ company.name }}
        </span>
        <span class="font-mono text-xs tracking-wide text-text-subtle">
          {{ reviewLabel }}
        </span>
      </span>
    </div>

    <div class="grid grid-cols-3 gap-2 border-t border-border pt-3">
      <div class="flex flex-col gap-1">
        <span
          class="font-mono text-[10px] tracking-wider text-text-subtle uppercase"
          >Rating</span
        >
        <span
          class="inline-flex items-center gap-1 text-sm font-medium text-text"
        >
          <svg
            v-if="ratingLabel"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="#fbbf24"
            stroke="#fbbf24"
            stroke-width="1.5"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
          <template v-if="ratingLabel">{{ ratingLabel }}</template>
          <span v-else class="text-text-subtle">—</span>
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span
          class="font-mono text-[10px] tracking-wider text-text-subtle uppercase"
          >Acepta</span
        >
        <span class="text-sm font-medium text-positive">
          {{ percentLabel(company.accept_rate) }}
        </span>
      </div>

      <div class="flex flex-col gap-1">
        <span
          class="font-mono text-[10px] tracking-wider text-text-subtle uppercase"
          >Ghost</span
        >
        <span class="text-sm font-medium text-ghost">
          {{ percentLabel(company.ghost_rate) }}
        </span>
      </div>
    </div>
  </NuxtLink>
</template>
