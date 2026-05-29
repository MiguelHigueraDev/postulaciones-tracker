<script setup lang="ts">
import {
  slugifyPosition,
  type PositionListItem,
} from "~~/shared/utils/positionStats";

const positionInput = ref("");

const { data, error, pending } = await useAsyncData("positions-index", () =>
  $fetch<PositionListItem[]>("/api/positions"),
);

const positions = computed<PositionListItem[]>(() => data.value ?? []);
const positionLabels = computed(() =>
  positions.value.map((position) => position.label),
);
const topPositions = computed(() => positions.value.slice(0, 24));

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function resolveToSlug(value: string): string | null {
  const cleaned = value.trim();
  if (!cleaned) return null;

  const needle = normalizeForMatch(cleaned);
  const exact = positions.value.find(
    (entry) => normalizeForMatch(entry.label) === needle,
  );
  if (exact) return exact.slug;

  const slug = slugifyPosition(cleaned);
  return slug || null;
}

function goToPosition(value: string) {
  const slug = resolveToSlug(value);
  if (!slug) return;
  return navigateTo(`/cargos/${encodeURIComponent(slug)}`);
}

function onTypeaheadSelect(value: string) {
  goToPosition(value);
}

function onSubmit() {
  goToPosition(positionInput.value);
}

useSeoMeta({
  title: "Cargos",
  description:
    "Datos del mercado tech chileno por cargo: tiempos de respuesta, sueldos, modalidad y empresas con más procesos publicados.",
});
</script>

<template>
  <div class="mx-auto max-w-3xl px-6 pt-10 pb-24 md:px-8">
    <div class="mb-8">
      <div class="mb-5 flex items-center gap-1.5 font-mono text-xs">
        <NuxtLink
          to="/"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <span class="text-accent">cargos</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Cargos
      </h1>
      <p class="m-0 font-mono text-13 tracking-wide text-text-subtle">
        Datos del mercado tech chileno · agrupados por cargo
      </p>
    </div>

    <form class="relative z-40 mb-10" @submit.prevent="onSubmit">
      <PositionTypeahead
        v-model="positionInput"
        input-id="position-search"
        label="Buscar cargo"
        placeholder="Backend Developer, QA Engineer..."
        @option-select="onTypeaheadSelect"
      />
      <p class="mt-3 mb-0 text-sm font-light text-text-subtle">
        Elige un cargo o busca el tuyo para ver promedios, sueldos y empresas.
      </p>
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
      <p class="m-0 text-sm text-text-subtle">Cargando cargos...</p>
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
    </div>

    <div
      v-else-if="positions.length === 0"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
    >
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Sin cargos aún
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No hay feedback publicado todavía. Sé el primero en compartir tu
        experiencia.
      </p>
      <NuxtLink
        to="/enviar"
        class="mt-3 text-sm font-medium text-accent no-underline hover:text-accent-hover"
      >
        Enviar feedback →
      </NuxtLink>
    </div>

    <section v-else>
      <h2
        class="m-0 mb-4 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
      >
        Top cargos por volumen
      </h2>
      <ul class="m-0 grid list-none grid-cols-1 gap-2 p-0 sm:grid-cols-2">
        <li v-for="entry in topPositions" :key="entry.slug">
          <NuxtLink
            :to="`/cargos/${encodeURIComponent(entry.slug)}`"
            class="group flex items-center gap-3 rounded-md border border-border-subtle bg-surface px-3.5 py-2.5 no-underline transition-colors duration-150 hover:border-border hover:bg-surface-alt"
          >
            <span class="flex-1 truncate text-sm text-text">
              {{ entry.label }}
            </span>
            <span class="font-mono text-13 text-text-muted">
              {{ entry.count }}
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
      <p
        v-if="positions.length > topPositions.length"
        class="mt-4 text-xs text-text-subtle"
      >
        {{ positions.length - topPositions.length }} cargos más sin mostrar.
        Búscalo arriba para verlo.
      </p>
    </section>
  </div>
</template>
