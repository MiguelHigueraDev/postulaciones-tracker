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

type ResultKey = "Oferta" | "Rechazo formal" | "Ghost" | "Desistí";

interface ResultStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

const RESULT_STYLES: Record<ResultKey, ResultStyle> = {
  Oferta: {
    label: "Oferta",
    color: "var(--color-positive)",
    bg: "var(--color-positive-bg)",
    border: "var(--color-positive-border)",
    dot: "#34d399",
  },
  "Rechazo formal": {
    label: "Rechazo",
    color: "var(--color-negative)",
    bg: "var(--color-negative-bg)",
    border: "var(--color-negative-border)",
    dot: "#f87171",
  },
  Ghost: {
    label: "Ghost",
    color: "var(--color-ghost)",
    bg: "var(--color-ghost-bg)",
    border: "var(--color-ghost-border)",
    dot: "#94a3b8",
  },
  Desistí: {
    label: "Desistí",
    color: "var(--color-yield)",
    bg: "var(--color-yield-bg)",
    border: "var(--color-yield-border)",
    dot: "#fbbf24",
  },
};

function getResultStyle(result: string): ResultStyle {
  return RESULT_STYLES[result as ResultKey] ?? {
    label: result,
    color: "var(--color-text-muted)",
    bg: "var(--color-surface-alt)",
    border: "var(--color-border)",
    dot: "var(--color-text-subtle)",
  };
}
</script>

<template>
  <div class="table-wrapper">

    <!-- Toolbar -->
    <div class="toolbar">
      <div class="search-wrap">
        <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Buscar empresa, cargo, rubro..."
          class="search-input"
          spellcheck="false"
        />
        <button v-if="searchQuery" class="search-clear" @click="searchQuery = ''" aria-label="Limpiar">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div v-if="!isLoading" class="count-badge">
        <span class="count-num">{{ filteredSubmissions.length }}</span>
        <span class="count-label">registros</span>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="state-empty">
      <div class="loading-row">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
      <p class="state-text">Cargando datos...</p>
    </div>

    <!-- Empty -->
    <div v-else-if="filteredSubmissions.length === 0" class="state-empty">
      <div class="state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </div>
      <p class="state-title">{{ searchQuery ? "Sin resultados" : "No hay datos aún" }}</p>
      <p class="state-text">
        {{ searchQuery ? `No hay registros para "${searchQuery}".` : "¡Sé el primero en compartir tu experiencia!" }}
      </p>
      <NuxtLink v-if="!searchQuery" to="/enviar" class="state-cta">
        Enviar feedback →
      </NuxtLink>
    </div>

    <!-- Table -->
    <div v-else class="table-scroll">
      <table class="data-table">
        <thead>
          <tr>
            <th>Empresa</th>
            <th>Rubro</th>
            <th>Cargo</th>
            <th>Período</th>
            <th>Respuesta</th>
            <th class="th-center">Etapas</th>
            <th>Última etapa</th>
            <th>Resultado</th>
            <th>Comentario</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="s in filteredSubmissions"
            :key="s.id"
            class="data-row"
          >
            <td class="td-company">{{ s.companies.name }}</td>
            <td class="td-muted">{{ s.industry }}</td>
            <td class="td-position">{{ s.position }}</td>
            <td class="td-mono">{{ s.application_month }}</td>
            <td class="td-muted">{{ s.response_time }}</td>
            <td class="td-center td-mono">{{ s.stages_reached }}</td>
            <td class="td-muted td-clamp">{{ s.last_stage ?? "—" }}</td>
            <td>
              <span
                class="result-badge"
                :style="{
                  color: getResultStyle(s.result).color,
                  backgroundColor: getResultStyle(s.result).bg,
                  borderColor: getResultStyle(s.result).border,
                }"
              >
                <span class="result-dot" :style="{ backgroundColor: getResultStyle(s.result).dot }" aria-hidden="true"></span>
                {{ getResultStyle(s.result).label }}
              </span>
            </td>
            <td class="td-comment">
              <span v-if="s.comment" :title="s.comment">{{ s.comment }}</span>
              <span v-else class="td-nil">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  </div>
</template>

<style scoped>
.table-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* ─── Toolbar ─── */
.toolbar {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.search-wrap {
  position: relative;
  flex: 1;
  min-width: 16rem;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-subtle);
  pointer-events: none;
}

.search-input {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.5rem 2.5rem 0.5rem 2.375rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text);
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.search-input::placeholder {
  color: var(--color-text-subtle);
}

.search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
}

.search-clear {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: none;
  background-color: var(--color-surface-alt);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.1s ease, color 0.1s ease;
}

.search-clear:hover {
  background-color: var(--color-border);
  color: var(--color-text);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.25rem;
  flex-shrink: 0;
}

.count-num {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-accent);
}

.count-label {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  letter-spacing: 0.03em;
}

/* ─── States ─── */
.state-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 5rem 1rem;
  text-align: center;
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.5rem;
  background-color: var(--color-surface);
}

.state-icon {
  color: var(--color-text-subtle);
  margin-bottom: 0.25rem;
}

.state-title {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text-muted);
  letter-spacing: -0.02em;
  margin: 0;
}

.state-text {
  font-size: 0.875rem;
  color: var(--color-text-subtle);
  margin: 0;
  font-weight: 300;
}

.state-cta {
  margin-top: 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent);
  text-decoration: none;
  transition: color 0.12s ease;
}

.state-cta:hover {
  color: var(--color-accent-hover);
}

.loading-row {
  display: flex;
  gap: 0.375rem;
  margin-bottom: 0.5rem;
}

.loading-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  border-radius: 50%;
  background-color: var(--color-border);
  animation: pulse 1.2s ease-in-out infinite;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes pulse {
  0%, 80%, 100% { opacity: 0.3; transform: scale(0.85); }
  40% { opacity: 1; transform: scale(1); }
}

/* ─── Table ─── */
.table-scroll {
  overflow-x: auto;
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
}

.data-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
}

.data-table thead {
  background-color: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border);
}

.data-table th {
  padding: 0.625rem 1rem;
  text-align: left;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  white-space: nowrap;
}

.th-center { text-align: center; }

.data-row {
  border-bottom: 1px solid var(--color-border-subtle);
  transition: background-color 0.1s ease;
}

.data-row:last-child {
  border-bottom: none;
}

.data-row:hover {
  background-color: var(--color-surface-alt);
}

.data-table td {
  padding: 0.8125rem 1rem;
  vertical-align: middle;
  font-size: 0.875rem;
}

.td-company {
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
}

.td-muted {
  color: var(--color-text-muted);
  font-weight: 300;
}

.td-position {
  color: var(--color-text);
  font-weight: 300;
  max-width: 12rem;
}

.td-mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  white-space: nowrap;
}

.td-center { text-align: center; }

.td-clamp {
  max-width: 10rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.td-comment {
  max-width: 16rem;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 300;
}

.td-nil {
  color: var(--color-text-subtle);
  font-family: var(--font-mono);
}

/* ─── Result badge ─── */
.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  white-space: nowrap;
  letter-spacing: 0.01em;
}

.result-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  flex-shrink: 0;
}
</style>
