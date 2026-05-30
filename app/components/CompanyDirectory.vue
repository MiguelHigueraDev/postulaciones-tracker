<script setup lang="ts">
import type { CompanyOverviewItem } from "~~/shared/types/company";
import {
  parseCompanyDirectorySearch,
  parseCompanyDirectorySort,
  type CompanyDirectorySort,
} from "~~/shared/utils/companyDirectoryRoute";
import { patchRouteQuery } from "~~/shared/utils/submissionsTableRoute";

const route = useRoute();
const router = useRouter();

const searchInput = ref(parseCompanyDirectorySearch(route.query.q));
const sortBy = ref<CompanyDirectorySort>(
  parseCompanyDirectorySort(route.query.sort),
);

const { data, error, pending, refresh } = await useAsyncData(
  "companies-directory",
  () => $fetch<CompanyOverviewItem[]>("/api/companies/directory"),
);

const fieldSelect =
  "w-full min-w-0 appearance-none rounded-md border border-border bg-surface px-3 py-2.5 font-mono text-13 text-text transition-[border-color,box-shadow] duration-150 focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)] cursor-pointer sm:w-auto sm:min-w-44 bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2344446a' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] bg-auto bg-position-[right_0.875rem_center] bg-no-repeat pr-10";

const searchInputClass =
  "w-full rounded-md border border-border bg-surface py-3 pr-10 pl-10 font-mono text-sm text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)]";

const SORT_OPTIONS: { value: CompanyDirectorySort; label: string }[] = [
  { value: "reviews", label: "Más reseñas" },
  { value: "name", label: "Nombre (A–Z)" },
  { value: "ghost", label: "Menor ghost %" },
  { value: "accept", label: "Mayor % acepta" },
  { value: "rating", label: "Mejor rating" },
];

function normalizeForMatch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function compareNullableAsc(
  a: number | null,
  b: number | null,
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return a - b;
}

function compareNullableDesc(
  a: number | null,
  b: number | null,
): number {
  return compareNullableAsc(b, a);
}

const filteredCompanies = computed(() => {
  const list = data.value ?? [];
  const needle = normalizeForMatch(searchInput.value);
  const filtered = needle
    ? list.filter((c) => normalizeForMatch(c.name).includes(needle))
    : [...list];

  const sort = sortBy.value;
  filtered.sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name, "es");
      case "ghost":
        return compareNullableAsc(a.ghost_rate, b.ghost_rate);
      case "accept":
        return compareNullableDesc(a.accept_rate, b.accept_rate);
      case "rating":
        return compareNullableDesc(a.avg_rating, b.avg_rating);
      case "reviews":
      default:
        return b.review_count - a.review_count;
    }
  });

  return filtered;
});

const companyCountLabel = computed(() => {
  const n = filteredCompanies.value.length;
  if (n === 1) return "1 empresa";
  return `${n} empresas`;
});

const hasSearch = computed(() => searchInput.value.trim().length > 0);

function syncRouteQuery() {
  const q = searchInput.value.trim();
  const next = patchRouteQuery(route.query, {
    q: q || undefined,
    sort: sortBy.value === "reviews" ? undefined : sortBy.value,
  });
  if (next) {
    router.replace({ query: next });
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchInput, () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(syncRouteQuery, 300);
});

watch(sortBy, syncRouteQuery);

watch(
  () => route.query,
  (query) => {
    const nextSearch = parseCompanyDirectorySearch(query.q);
    const nextSort = parseCompanyDirectorySort(query.sort);
    if (searchInput.value !== nextSearch) searchInput.value = nextSearch;
    if (sortBy.value !== nextSort) sortBy.value = nextSort;
  },
);

function clearSearch() {
  searchInput.value = "";
}
</script>

<template>
  <div class="flex flex-col gap-8">
    <div
      class="sticky top-14 z-30 -mx-6 border-b border-border-subtle bg-bg/90 px-6 py-5 backdrop-blur-2xl sm:-mx-0 sm:rounded-card sm:border sm:px-5 sm:before:pointer-events-none sm:before:absolute sm:before:inset-0 sm:before:rounded-card sm:before:bg-[radial-gradient(ellipse_at_50%_0%,rgba(129,140,248,0.05)_0%,transparent_65%)]"
    >
      <div class="relative flex flex-col gap-4">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div class="min-w-0 flex-1">
            <label
              for="directory-search"
              class="mb-2 block font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
            >
              Buscar empresa
            </label>
            <div class="relative">
              <svg
                class="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-text-subtle"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                id="directory-search"
                v-model="searchInput"
                type="search"
                :class="searchInputClass"
                placeholder="Filtrar por nombre..."
                autocomplete="off"
                spellcheck="false"
              />
              <button
                v-if="hasSearch"
                type="button"
                class="absolute top-1/2 right-2.5 z-10 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-0 bg-surface-alt text-text-muted transition-colors duration-100 hover:bg-border hover:text-text"
                aria-label="Limpiar búsqueda"
                @click="clearSearch"
              >
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>

          <div class="shrink-0 sm:w-48">
            <label
              for="directory-sort"
              class="mb-2 block font-mono text-11 font-medium tracking-widest text-text-subtle uppercase"
            >
              Ordenar
            </label>
            <select
              id="directory-sort"
              v-model="sortBy"
              :class="fieldSelect"
            >
              <option
                v-for="opt in SORT_OPTIONS"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </option>
            </select>
          </div>
        </div>

        <div
          class="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4"
        >
          <p class="m-0 font-mono text-13 tracking-wide text-text-muted">
            <span class="text-accent">{{ companyCountLabel }}</span>
            <span v-if="hasSearch" class="text-text-subtle">
              · filtrado
            </span>
          </p>
          <NuxtLink
            to="/resenas/mercado"
            class="inline-flex items-center gap-1.5 font-mono text-xs tracking-wide text-text-muted no-underline transition-colors duration-150 hover:text-accent"
          >
            Estadísticas del mercado
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
        </div>
      </div>
    </div>

    <div v-if="pending" class="directory-grid" aria-busy="true" aria-label="Cargando empresas">
      <div
        v-for="n in 12"
        :key="n"
        class="h-28 animate-pulse bg-surface"
        aria-hidden="true"
      />
    </div>

    <div
      v-else-if="error"
      class="flex flex-col items-center gap-4 rounded-card border border-border-subtle bg-surface px-6 py-20 text-center"
    >
      <p class="m-0 font-display text-lg font-bold text-text-muted">
        Error al cargar
      </p>
      <p class="m-0 max-w-sm text-sm font-light text-text-subtle">
        No pudimos obtener el directorio. Intenta de nuevo.
      </p>
      <button
        type="button"
        class="cursor-pointer rounded-md border border-border bg-surface-alt px-4 py-2 font-mono text-13 text-text transition-colors duration-150 hover:border-text-muted hover:bg-surface"
        @click="refresh()"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="(data?.length ?? 0) === 0"
      class="flex flex-col items-center gap-3 rounded-card border border-border-subtle bg-surface px-6 py-20 text-center"
    >
      <p class="m-0 font-display text-lg font-bold text-text-muted">
        Sin empresas aún
      </p>
      <p class="m-0 text-sm font-light text-text-subtle">
        Aún no hay reseñas publicadas. Sé el primero en compartir tu experiencia.
      </p>
      <NuxtLink
        to="/enviar"
        class="mt-2 text-sm font-medium text-accent no-underline hover:text-accent-hover"
      >
        Enviar feedback →
      </NuxtLink>
    </div>

    <div
      v-else-if="filteredCompanies.length === 0"
      class="flex flex-col items-center gap-2 rounded-card border border-border-subtle bg-surface px-6 py-16 text-center"
    >
      <p class="m-0 font-display text-base font-bold text-text-muted">
        Sin coincidencias
      </p>
      <p class="m-0 text-sm text-text-subtle">
        No hay empresas que coincidan con «{{ searchInput.trim() }}».
      </p>
      <button
        type="button"
        class="mt-2 cursor-pointer border-0 bg-transparent font-mono text-13 text-accent hover:text-accent-hover"
        @click="clearSearch"
      >
        Limpiar búsqueda
      </button>
    </div>

    <div
      v-else
      class="directory-grid"
      role="list"
    >
      <div
        v-for="(company, index) in filteredCompanies"
        :key="company.id"
        role="listitem"
        class="directory-grid-item"
        :style="{ '--item-delay': `${Math.min(index, 18) * 35}ms` }"
      >
        <CompanyCard :company="company" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.directory-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  overflow: hidden;
  border-radius: var(--radius-card, 0.5rem);
  border: 1px solid var(--color-border, #2a2a3e);
  background-color: var(--color-border, #2a2a3e);
}

@media (min-width: 640px) {
  .directory-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 900px) {
  .directory-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.directory-grid-item {
  animation: directory-item-in 0.45s ease-out both;
  animation-delay: var(--item-delay, 0ms);
}

@keyframes directory-item-in {
  from {
    opacity: 0;
    transform: translateY(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
