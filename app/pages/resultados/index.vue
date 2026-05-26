<script setup lang="ts">
import type { CompanyOption } from "~/components/CompanySearch.vue";
import {
  patchRouteQuery,
  shouldShowSubmissionsTable,
} from "~~/shared/utils/submissionsTableRoute";

const route = useRoute();
const router = useRouter();

const dropdownOpen = ref(false);
const showAllSubmissions = ref(shouldShowSubmissionsTable(route.query));

watch(showAllSubmissions, (open) => {
  const next = patchRouteQuery(
    route.query,
    open
      ? { tabla: "1" }
      : { tabla: undefined, q: undefined, page: undefined },
  );
  if (next) router.replace({ query: next });
});

watch(
  () => route.query,
  (query) => {
    const open = shouldShowSubmissionsTable(query);
    if (open !== showAllSubmissions.value) {
      showAllSubmissions.value = open;
    }
  },
);

function onSelect(company: CompanyOption) {
  return navigateTo(`/resultados/${encodeURIComponent(company.name_normalized)}`);
}

useSeoMeta({
  title: () =>
    showAllSubmissions.value ? "Todos los registros" : "Resultados",
  description:
    "Feedback colectivo anónimo sobre procesos de selección en empresas tech de Chile.",
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
        <span class="text-accent">resultados</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Resultados
      </h1>
      <p class="m-0 font-mono text-13 tracking-wide text-text-subtle">
        Feedback colectivo anónimo · empresas en Chile
      </p>
    </div>

    <div class="relative z-40 mb-10">
      <CompanySearch
        label="Buscar empresa"
        placeholder="Escribe al menos 2 caracteres..."
        @company-select="onSelect"
        @dropdown-open="dropdownOpen = $event"
      />
      <p class="mt-3 mb-0 text-sm font-light text-text-subtle">
        Selecciona una empresa para ver estadísticas detalladas de sus procesos de selección.
      </p>
    </div>

    <div v-show="!dropdownOpen">
      <template v-if="!showAllSubmissions">
        <div
          class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-16 text-center"
        >
          <div class="mb-1 text-text-subtle" aria-hidden="true">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <p class="m-0 font-display text-base font-bold text-text-muted">
            Busca una empresa
          </p>
          <p class="m-0 max-w-88 text-sm text-text-subtle">
            Usa el buscador para explorar tiempos de respuesta, resultados y etapas por empresa.
          </p>
        </div>

        <div
          class="my-8 flex items-center gap-4"
          role="separator"
          aria-hidden="true"
        >
          <div class="h-px flex-1 bg-border" />
          <span class="font-mono text-11 tracking-widest text-text-subtle uppercase">
            o
          </span>
          <div class="h-px flex-1 bg-border" />
        </div>

        <div class="flex justify-center">
          <button
            type="button"
            class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-15 font-normal text-text-muted transition-colors duration-150 hover:border-text-muted hover:bg-surface-alt hover:text-text"
            @click="showAllSubmissions = true"
          >
            Ver todos los registros
          </button>
        </div>
      </template>

      <template v-else>
        <FeedbackTable>
          <template #actions>
            <div class="flex justify-center">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-5 py-2.5 text-15 font-normal text-text-muted transition-colors duration-150 hover:border-text-muted hover:bg-surface-alt hover:text-text"
                @click="showAllSubmissions = false"
              >
                Ocultar tabla
              </button>
            </div>
          </template>
        </FeedbackTable>
      </template>
    </div>
  </div>
</template>
