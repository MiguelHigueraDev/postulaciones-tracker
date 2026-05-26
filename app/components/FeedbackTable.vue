<script setup lang="ts">
interface Submission {
  id: string;
  industry: string;
  position: string;
  application_month: string;
  response_time: string;
  stages_reached: number;
  last_stage: string | null;
  result: string;
  comment: string | null;
  created_at: string;
  companies: { name: string };
}

const supabase = useSupabaseClient();
const searchQuery = ref("");
const isLoading = ref(true);
const submissions = ref<Submission[]>([]);

const { data } = await useAsyncData("submissions", async () => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Submission[];
});

submissions.value = data.value ?? [];
isLoading.value = false;

const filteredSubmissions = computed(() => {
  if (!searchQuery.value.trim()) return submissions.value;
  const q = searchQuery.value.toLowerCase();
  return submissions.value.filter(
    (s) =>
      s.companies.name.toLowerCase().includes(q) ||
      s.position.toLowerCase().includes(q) ||
      s.industry.toLowerCase().includes(q),
  );
});

import { getResultStyle } from "~~/shared/constants/resultStyles";
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex flex-wrap items-center gap-3.5">
      <div class="relative min-w-64 flex-1">
        <svg class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-subtle" width="14"
          height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
          stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Buscar empresa, cargo, rubro..."
          class="w-full rounded-md border border-border bg-surface py-2 pr-10 pl-9.5 font-mono text-13 text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)]"
          spellcheck="false" />
        <button v-if="searchQuery"
          class="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-0 bg-surface-alt text-text-muted transition-colors duration-100 hover:bg-border hover:text-text"
          aria-label="Limpiar" @click="searchQuery = ''">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"
            stroke-linecap="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div v-if="!isLoading"
        class="inline-flex shrink-0 items-center gap-1.5 rounded border border-border bg-surface px-3 py-1.5">
        <span class="font-mono text-13 font-medium text-accent">
          {{ filteredSubmissions.length }}
        </span>
        <span class="font-mono text-11 tracking-wide text-text-subtle">
          registros
        </span>
      </div>
    </div>

    <div v-if="isLoading"
      class="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-20 text-center">
      <div class="mb-2 flex gap-1.5">
        <span class="size-1.75 rounded-full bg-border animate-loading-dot" />
        <span class="size-1.75 rounded-full bg-border animate-loading-dot [animation-delay:0.2s]" />
        <span class="size-1.75 rounded-full bg-border animate-loading-dot [animation-delay:0.4s]" />
      </div>
      <p class="m-0 text-sm font-light text-text-subtle">Cargando datos...</p>
    </div>

    <div v-else-if="filteredSubmissions.length === 0"
      class="flex flex-col items-center justify-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-20 text-center">
      <div class="mb-1 text-text-subtle">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </div>
      <p class="m-0 font-display text-base font-bold tracking-tight text-text-muted">
        {{ searchQuery ? "Sin resultados" : "No hay datos aún" }}
      </p>
      <p class="m-0 text-sm font-light text-text-subtle">
        {{
          searchQuery
            ? `No hay registros para "${searchQuery}".`
            : "¡Sé el primero en compartir tu experiencia!"
        }}
      </p>
      <NuxtLink v-if="!searchQuery" to="/enviar"
        class="mt-3 text-sm font-medium text-accent no-underline transition-colors duration-150 hover:text-accent-hover">
        Enviar feedback →
      </NuxtLink>
    </div>

    <div v-else class="overflow-x-auto rounded-card border border-border">
      <table class="w-full min-w-[860px] border-collapse">
        <thead class="border-b border-border bg-surface-alt">
          <tr>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Empresa
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Rubro
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Cargo
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Período
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Respuesta
            </th>
            <th
              class="px-4 py-2.5 text-center font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Etapas
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Última etapa
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Resultado
            </th>
            <th
              class="px-4 py-2.5 text-left font-mono text-11 font-medium tracking-widest whitespace-nowrap text-text-subtle uppercase">
              Comentario
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="s in filteredSubmissions" :key="s.id"
            class="border-b border-border-subtle transition-colors duration-100 last:border-b-0 hover:bg-surface-alt">
            <td class="px-4 py-3.5 align-middle text-sm font-medium whitespace-nowrap text-text">
              {{ s.companies.name }}
            </td>
            <td class="px-4 py-3.5 align-middle text-sm font-light text-text-muted">
              {{ s.industry }}
            </td>
            <td class="max-w-48 px-4 py-3.5 align-middle text-sm font-light text-text">
              {{ s.position }}
            </td>
            <td class="px-4 py-3.5 align-middle font-mono text-13 whitespace-nowrap text-text-muted">
              {{ s.application_month }}
            </td>
            <td class="px-4 py-3.5 align-middle text-sm font-light text-text-muted">
              {{ s.response_time }}
            </td>
            <td class="px-4 py-3.5 text-center align-middle font-mono text-13 text-text-muted">
              {{ s.stages_reached }}
            </td>
            <td class="max-w-40 truncate px-4 py-3.5 align-middle text-sm font-light text-text-muted">
              {{ s.last_stage ?? "—" }}
            </td>
            <td class="px-4 py-3.5 align-middle text-sm">
              <span
                class="inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs font-medium tracking-wide whitespace-nowrap"
                :style="{
                  color: getResultStyle(s.result).color,
                  backgroundColor: getResultStyle(s.result).bg,
                  borderColor: getResultStyle(s.result).border,
                }">
                <span class="size-1.5 shrink-0 rounded-full" :style="{ backgroundColor: getResultStyle(s.result).dot }"
                  aria-hidden="true" />
                {{ getResultStyle(s.result).label }}
              </span>
            </td>
            <td class="max-w-64 truncate px-4 py-3.5 align-middle text-13 font-light text-text-muted">
              <span v-if="s.comment" :title="s.comment">{{ s.comment }}</span>
              <span v-else class="font-mono text-text-subtle">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
