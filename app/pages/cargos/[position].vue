<script setup lang="ts">
import {
  slugifyPosition,
  type PositionStatsResponse,
} from "~~/shared/utils/positionStats";

const route = useRoute();

const slug = computed(() =>
  decodeURIComponent(route.params.position as string).toLowerCase(),
);

const positionInput = ref("");

const { data, error, pending } = await useAsyncData(
  computed(() => `position-stats-${slug.value}`),
  () => $fetch<PositionStatsResponse>(`/api/positions/${encodeURIComponent(slug.value)}`),
  { watch: [slug] },
);

const position = computed(() => data.value?.position ?? null);
const stats = computed(() => data.value?.stats ?? null);

watchEffect(() => {
  if (position.value) {
    positionInput.value = position.value.label;
  }
});

function navigateToValue(value: string) {
  const cleaned = value.trim();
  if (!cleaned) return;
  const nextSlug = slugifyPosition(cleaned);
  if (!nextSlug || nextSlug === slug.value) return;
  return navigateTo(`/cargos/${encodeURIComponent(nextSlug)}`);
}

function onSubmit() {
  navigateToValue(positionInput.value);
}

function onTypeaheadSelect(value: string) {
  navigateToValue(value);
}

useSeoMeta({
  title: () => {
    if (pending.value) return "Cargo";
    if (error.value || !position.value) return "Cargo no encontrado";
    return position.value.label;
  },
  description: () => {
    if (!position.value) {
      return "Estadísticas del mercado laboral tech chileno por cargo.";
    }
    return `Datos del mercado para ${position.value.label} en Chile: tiempos de respuesta, sueldos y empresas que más contratan.`;
  },
});
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
          to="/cargos"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          cargos
        </NuxtLink>
        <template v-if="position">
          <span class="text-text-subtle">/</span>
          <span class="text-accent">{{ position.label }}</span>
        </template>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Cargos
      </h1>
      <p class="m-0 font-mono text-13 tracking-wide text-text-subtle">
        Estadísticas por cargo · feedback anónimo
      </p>
    </div>

    <form class="relative z-40 mb-8" @submit.prevent="onSubmit">
      <PositionTypeahead
        v-model="positionInput"
        input-id="position-search"
        label="Cambiar cargo"
        placeholder="Backend Developer, QA Engineer..."
        @option-select="onTypeaheadSelect"
      />
    </form>

    <div
      v-if="pending"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <div class="mb-2 flex gap-1.5">
        <span class="size-1.75 rounded-full bg-border animate-loading-dot" />
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
        to="/cargos"
        class="mt-3 text-sm text-accent no-underline hover:text-accent-hover"
      >
        ← Volver a cargos
      </NuxtLink>
    </div>

    <div
      v-else-if="!position || !stats"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Cargo no encontrado
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No hay datos para «{{ slug }}». Prueba buscando otro cargo.
      </p>
      <NuxtLink
        to="/cargos"
        class="mt-3 text-sm text-accent no-underline hover:text-accent-hover"
      >
        ← Volver a cargos
      </NuxtLink>
    </div>

    <PositionStatsPanel
      v-else
      :position-label="position.label"
      :stats="stats"
    />
  </div>
</template>
