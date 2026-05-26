<script setup lang="ts">
import { getResultStyle } from "~~/shared/constants/resultStyles";
import type {
  GlobalSubmission,
  PaginatedAllSubmissions,
} from "~~/shared/utils/companyStats";
import {
  parseSubmissionsPage,
  parseSubmissionsSearch,
  patchRouteQuery,
} from "~~/shared/utils/submissionsTableRoute";

const route = useRoute();
const router = useRouter();

const searchInput = ref(parseSubmissionsSearch(route.query.q));
const debouncedSearch = ref(searchInput.value);
const page = ref(parseSubmissionsPage(route.query.page));
const submissions = ref<GlobalSubmission[]>([]);
const total = ref(0);
const totalPages = ref(0);
const isLoading = ref(true);
const loadError = ref(false);

let searchTimeout: ReturnType<typeof setTimeout> | null = null;

watch(searchInput, (value) => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    if (debouncedSearch.value !== value) {
      debouncedSearch.value = value;
      page.value = 1;
    }
  }, 300);
});

async function fetchSubmissions() {
  isLoading.value = true;
  loadError.value = false;

  try {
    const params = new URLSearchParams({ page: String(page.value) });
    const q = debouncedSearch.value.trim();
    if (q) params.set("q", q);

    const data = await $fetch<PaginatedAllSubmissions>(
      `/api/submissions?${params}`,
    );

    submissions.value = data.submissions;
    total.value = data.total;
    totalPages.value = data.totalPages;

    if (data.totalPages > 0 && page.value > data.totalPages) {
      page.value = data.totalPages;
      return;
    }
  } catch {
    loadError.value = true;
    submissions.value = [];
    total.value = 0;
    totalPages.value = 0;
  } finally {
    isLoading.value = false;
  }
}

watch([page, debouncedSearch], fetchSubmissions, { immediate: true });

function syncRouteQuery() {
  const q = debouncedSearch.value.trim();
  const next = patchRouteQuery(route.query, {
    tabla: "1",
    q: q || undefined,
    page: page.value > 1 ? String(page.value) : undefined,
  });
  if (next) router.replace({ query: next });
}

watch([debouncedSearch, page], syncRouteQuery);

watch(
  () => [route.query.q, route.query.page] as const,
  ([q, pageParam]) => {
    const nextQ = parseSubmissionsSearch(q);
    const nextPage = parseSubmissionsPage(pageParam);

    if (nextQ !== debouncedSearch.value) {
      debouncedSearch.value = nextQ;
      searchInput.value = nextQ;
    }

    if (nextPage !== page.value) {
      page.value = nextPage;
    }
  },
);

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout);
});

const hasResults = computed(() => submissions.value.length > 0);
const canGoPrev = computed(() => page.value > 1);
const canGoNext = computed(() => page.value < totalPages.value);

const selectedSubmission = ref<GlobalSubmission | null>(null);

function openDetail(submission: GlobalSubmission) {
  selectedSubmission.value = submission;
}

function closeDetail() {
  selectedSubmission.value = null;
}

function onRowClick(submission: GlobalSubmission, event: MouseEvent) {
  const target = event.target as HTMLElement;
  if (target.closest("a")) return;
  openDetail(submission);
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <slot name="actions" />

    <div class="flex flex-wrap items-center gap-3.5">
      <div class="relative min-w-64 flex-1">
        <svg
          class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-subtle"
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
          v-model="searchInput"
          type="text"
          placeholder="Buscar empresa, cargo, rubro..."
          class="w-full rounded-md border border-border bg-surface py-2 pr-10 pl-9.5 font-mono text-13 text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)]"
          spellcheck="false"
        />
        <button
          v-if="searchInput"
          type="button"
          class="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-0 bg-surface-alt text-text-muted transition-colors duration-100 hover:bg-border hover:text-text"
          aria-label="Limpiar"
          @click="searchInput = ''"
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

      <div
        v-if="!isLoading"
        class="inline-flex shrink-0 items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5"
      >
        <span class="font-mono text-13 font-medium text-accent">
          {{ total }}
        </span>
        <span class="font-mono text-11 tracking-wide text-text-subtle">
          registros
        </span>
      </div>
    </div>

    <div
      v-if="isLoading"
      class="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-20 text-center"
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
      <p class="m-0 text-sm font-light text-text-subtle">Cargando datos...</p>
    </div>

    <div
      v-else-if="loadError"
      class="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-20 text-center"
    >
      <p class="m-0 font-display text-base font-bold tracking-tight text-text-muted">
        Error al cargar
      </p>
      <p class="m-0 text-sm font-light text-text-subtle">
        No pudimos obtener los registros. Intenta de nuevo.
      </p>
      <button
        type="button"
        class="mt-3 cursor-pointer border-0 bg-transparent p-0 text-sm font-medium text-accent hover:text-accent-hover"
        @click="fetchSubmissions()"
      >
        Reintentar
      </button>
    </div>

    <div
      v-else-if="!hasResults"
      class="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-20 text-center"
    >
      <div class="mb-1 text-text-subtle">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p class="m-0 font-display text-base font-bold tracking-tight text-text-muted">
        {{ debouncedSearch ? "Sin resultados" : "No hay datos aún" }}
      </p>
      <p class="m-0 text-sm font-light text-text-subtle">
        {{
          debouncedSearch
            ? `No hay registros para "${debouncedSearch}".`
            : "¡Sé el primero en compartir tu experiencia!"
        }}
      </p>
      <NuxtLink
        v-if="!debouncedSearch"
        to="/enviar"
        class="mt-3 text-sm font-medium text-accent no-underline transition-colors duration-150 hover:text-accent-hover"
      >
        Enviar feedback →
      </NuxtLink>
    </div>

    <template v-else>
      <div
        class="900:relative 900:left-1/2 900:w-[min(76rem,calc(100vw-3rem))] 900:max-w-[calc(100vw-3rem)] 900:-translate-x-1/2"
      >
        <div class="max-w-full overflow-x-auto rounded-card border border-border">
          <table class="w-full min-w-[860px] table-fixed border-collapse 900:min-w-0">
            <colgroup>
              <col class="w-[10%]" />
              <col class="w-[7%]" />
              <col class="w-[12%]" />
              <col class="w-[9%]" />
              <col class="w-[13%]" />
              <col class="w-[6%]" />
              <col class="w-[12%]" />
              <col class="w-[10%]" />
              <col />
            </colgroup>
          <thead class="border-b border-border bg-surface-alt">
            <tr>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Empresa
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Rubro
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Cargo
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Período
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Respuesta
              </th>
              <th
                class="px-4 py-2.5 text-center font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Etapas
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Última etapa
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Resultado
              </th>
              <th
                class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase"
              >
                Comentario
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="s in submissions"
              :key="s.id"
              class="cursor-pointer border-b border-border-subtle transition-colors duration-100 last:border-b-0 hover:bg-surface-alt"
              @click="onRowClick(s, $event)"
            >
              <td class="overflow-hidden px-4 py-3.5 align-middle text-sm font-medium whitespace-nowrap text-text">
                <NuxtLink
                  v-if="s.company_slug"
                  :to="`/resultados/${encodeURIComponent(s.company_slug)}`"
                  class="text-text no-underline transition-colors duration-150 hover:text-accent"
                >
                  {{ s.company_name }}
                </NuxtLink>
                <span v-else>{{ s.company_name }}</span>
              </td>
              <td class="overflow-hidden px-4 py-3.5 align-middle text-sm font-light text-text-muted">
                <span class="block truncate" :title="s.industry">{{ s.industry }}</span>
              </td>
              <td class="overflow-hidden px-4 py-3.5 align-middle text-sm font-light text-text">
                <span class="block truncate" :title="s.position">{{ s.position }}</span>
              </td>
              <td class="overflow-hidden px-4 py-3.5 align-middle font-mono text-13 whitespace-nowrap text-text-muted">
                {{ s.application_month }}
              </td>
              <td class="overflow-hidden px-4 py-3.5 align-middle text-sm font-light text-text-muted">
                <span class="block truncate" :title="s.response_time">{{ s.response_time }}</span>
              </td>
              <td class="px-4 py-3.5 text-center align-middle font-mono text-13 text-text-muted">
                {{ s.stages_reached }}
              </td>
              <td class="overflow-hidden px-4 py-3.5 align-middle text-sm font-light text-text-muted">
                <span class="block truncate" :title="s.last_stage ?? undefined">
                  {{ s.last_stage ?? "—" }}
                </span>
              </td>
              <td class="px-4 py-3.5 align-middle text-sm">
                <span
                  class="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs font-medium tracking-wide whitespace-nowrap"
                  :style="{
                    color: getResultStyle(s.result).color,
                    backgroundColor: getResultStyle(s.result).bg,
                    borderColor: getResultStyle(s.result).border,
                  }"
                >
                  <span
                    class="size-1.5 shrink-0 rounded-full"
                    :style="{ backgroundColor: getResultStyle(s.result).dot }"
                    aria-hidden="true"
                  />
                  {{ getResultStyle(s.result).label }}
                </span>
              </td>
              <td class="overflow-hidden px-4 py-3.5 align-middle text-13 font-light text-text-muted">
                <span v-if="s.comment" class="block truncate" :title="s.comment">{{ s.comment }}</span>
                <span v-else class="font-mono text-text-subtle">—</span>
              </td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>

      <div
        v-if="total > 0"
        class="flex flex-wrap items-center justify-between gap-3"
      >
        <p class="m-0 font-mono text-13 text-text-subtle">
          <template v-if="totalPages > 1">
            Página {{ page }} de {{ totalPages }}
          </template>
          <template v-else>
            {{ total }} {{ total === 1 ? "registro" : "registros" }}
          </template>
        </p>
        <div v-if="totalPages > 1" class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center rounded-md border border-border bg-surface px-3.5 py-1.5 font-mono text-13 text-text-muted transition-colors duration-150 hover:border-text-muted hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canGoPrev"
            @click="page--"
          >
            Anterior
          </button>
          <button
            type="button"
            class="inline-flex cursor-pointer items-center rounded-md border border-border bg-surface px-3.5 py-1.5 font-mono text-13 text-text-muted transition-colors duration-150 hover:border-text-muted hover:bg-surface-alt hover:text-text disabled:cursor-not-allowed disabled:opacity-40"
            :disabled="!canGoNext"
            @click="page++"
          >
            Siguiente
          </button>
        </div>
      </div>
    </template>

    <SubmissionDetailModal
      :submission="selectedSubmission"
      @close="closeDetail"
    />
  </div>
</template>
