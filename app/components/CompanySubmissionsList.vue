<script setup lang="ts">
import type {
  CompanySubmission,
  PaginatedSubmissions,
  SubmissionCursor,
} from "~~/shared/utils/companyStats";
import { SUBMISSIONS_PAGE_SIZE } from "~~/shared/utils/companyStats";
import { getResultStyle } from "~~/shared/constants/resultStyles";

const props = defineProps<{
  companySlug: string;
  totalCount: number;
}>();

const submissions = ref<CompanySubmission[]>([]);
const nextCursor = ref<SubmissionCursor | null>(null);
const isLoading = ref(false);
const loadError = ref(false);
const scrollRoot = ref<HTMLElement | null>(null);
const sentinel = ref<HTMLElement | null>(null);
const isDesktop = ref(false);

const hasMore = computed(() => nextCursor.value !== null);

async function fetchPage(cursor?: SubmissionCursor) {
  if (isLoading.value) return;

  isLoading.value = true;
  loadError.value = false;

  try {
    const params = new URLSearchParams({
      limit: String(SUBMISSIONS_PAGE_SIZE),
    });

    if (cursor) {
      params.set("cursorCreatedAt", cursor.createdAt);
      params.set("cursorId", cursor.id);
    }

    const data = await $fetch<PaginatedSubmissions>(
      `/api/companies/${encodeURIComponent(props.companySlug)}/submissions?${params}`,
    );

    if (cursor) {
      submissions.value = [...submissions.value, ...data.submissions];
    } else {
      submissions.value = data.submissions;
    }

    nextCursor.value = data.nextCursor;
  } catch {
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function loadMore() {
  if (!hasMore.value || isLoading.value) return;
  if (nextCursor.value) {
    await fetchPage(nextCursor.value);
  }
}

function resetAndLoad() {
  submissions.value = [];
  nextCursor.value = null;
  loadError.value = false;
  return fetchPage();
}

let observer: IntersectionObserver | null = null;

function setupObserver() {
  observer?.disconnect();
  if (!sentinel.value || !hasMore.value) return;

  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        loadMore();
      }
    },
    {
      root: isDesktop.value ? scrollRoot.value : null,
      rootMargin: isDesktop.value ? "0px 240px 0px 0px" : "0px 0px 240px 0px",
      threshold: 0,
    },
  );

  observer.observe(sentinel.value);
}

function updateViewportMode() {
  isDesktop.value = window.matchMedia("(min-width: 768px)").matches;
}

watch([() => submissions.value.length, hasMore], async () => {
  await nextTick();
  setupObserver();
});

watch(
  () => props.companySlug,
  () => {
    resetAndLoad();
  },
);

onMounted(() => {
  updateViewportMode();
  resetAndLoad();

  const media = window.matchMedia("(min-width: 768px)");
  media.addEventListener("change", () => {
    updateViewportMode();
    nextTick(setupObserver);
  });
});

onUnmounted(() => {
  observer?.disconnect();
});
</script>

<template>
  <section class="submissions-section">
    <div class="submissions-header">
      <h3 class="submissions-title">Registros</h3>
      <span class="submissions-count">
        {{ submissions.length
        }}<template v-if="totalCount > submissions.length">
          / {{ totalCount }}</template
        >
      </span>
    </div>

    <div
      v-if="isLoading && submissions.length === 0"
      class="submissions-state"
      aria-live="polite"
    >
      <div class="state-dots">
        <span class="sentinel-dot" />
        <span class="sentinel-dot" />
        <span class="sentinel-dot" />
      </div>
      <p class="state-text">Cargando registros...</p>
    </div>

    <div v-else-if="loadError && submissions.length === 0" class="submissions-state">
      <p class="state-text">No pudimos cargar los registros.</p>
      <button type="button" class="state-retry" @click="resetAndLoad()">
        Reintentar
      </button>
    </div>

    <div
      v-else
      ref="scrollRoot"
      class="submissions-track"
      :class="{ 'submissions-track--desktop': isDesktop }"
    >
      <article
        v-for="submission in submissions"
        :key="submission.id"
        class="submission-card"
      >
        <header class="card-header">
          <h4 class="card-position">{{ submission.position }}</h4>
          <span
            class="result-badge"
            :style="{
              color: getResultStyle(submission.result).color,
              backgroundColor: getResultStyle(submission.result).bg,
              borderColor: getResultStyle(submission.result).border,
            }"
          >
            <span
              class="result-dot"
              :style="{
                backgroundColor: getResultStyle(submission.result).dot,
              }"
              aria-hidden="true"
            />
            {{ getResultStyle(submission.result).label }}
          </span>
        </header>

        <dl class="card-meta">
          <div class="meta-row">
            <dt>Rubro</dt>
            <dd>{{ submission.industry }}</dd>
          </div>
          <div class="meta-row">
            <dt>Período</dt>
            <dd>{{ submission.application_month }}</dd>
          </div>
          <div class="meta-row">
            <dt>Respuesta</dt>
            <dd>{{ submission.response_time }}</dd>
          </div>
          <div class="meta-row">
            <dt>Etapas</dt>
            <dd>
              {{ submission.stages_reached }}
              <template v-if="submission.last_stage">
                · {{ submission.last_stage }}
              </template>
            </dd>
          </div>
        </dl>

        <p v-if="submission.comment" class="card-comment">
          {{ submission.comment }}
        </p>
      </article>

      <div
        v-if="hasMore || isLoading"
        ref="sentinel"
        class="submissions-sentinel"
        aria-hidden="true"
      >
        <span class="sentinel-dot" />
        <span class="sentinel-dot" />
        <span class="sentinel-dot" />
      </div>
    </div>

    <p v-if="loadError && submissions.length > 0" class="submissions-error">
      Error al cargar más registros.
      <button type="button" class="state-retry" @click="loadMore()">
        Reintentar
      </button>
    </p>
  </section>
</template>

<style scoped>
.submissions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-width: 0;
}

.submissions-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
}

.submissions-title {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text-subtle);
  margin: 0;
}

.submissions-count {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
}

.submissions-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2.5rem 1rem;
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.5rem;
  background-color: var(--color-surface);
}

.state-dots {
  display: flex;
  gap: 0.375rem;
}

.state-text {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-subtle);
}

.state-retry {
  border: none;
  background: none;
  padding: 0;
  font-size: 0.875rem;
  color: var(--color-accent);
  cursor: pointer;
}

.state-retry:hover {
  color: var(--color-accent-hover);
}

.submissions-error {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
}

.submissions-track {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-width: 0;
}

.submissions-track--desktop {
  flex-direction: row;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x proximity;
  padding-bottom: 0.5rem;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  -webkit-overflow-scrolling: touch;
}

.submissions-track--desktop::-webkit-scrollbar {
  height: 0.375rem;
}

.submissions-track--desktop::-webkit-scrollbar-thumb {
  background-color: var(--color-border);
  border-radius: 999px;
}

.submission-card {
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  padding: 1rem 1.125rem;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-subtle);
  border-radius: 0.5rem;
}

.submissions-track--desktop .submission-card {
  flex: 0 0 18.5rem;
  scroll-snap-align: start;
  max-height: 22rem;
  overflow-y: auto;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.75rem;
}

.card-position {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.35;
}

.result-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.1875rem 0.5rem;
  border-radius: 0.25rem;
  border: 1px solid;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.result-dot {
  width: 0.3125rem;
  height: 0.3125rem;
  border-radius: 50%;
  flex-shrink: 0;
}

.card-meta {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  margin: 0;
}

.meta-row {
  display: grid;
  grid-template-columns: 4.75rem 1fr;
  gap: 0.5rem;
  font-size: 0.8125rem;
}

.meta-row dt {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  text-transform: lowercase;
}

.meta-row dd {
  margin: 0;
  color: var(--color-text-muted);
  font-weight: 300;
}

.card-comment {
  margin: 0;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-border-subtle);
  font-size: 0.8125rem;
  font-weight: 300;
  color: var(--color-text-muted);
  line-height: 1.55;
}

.submissions-sentinel {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  min-height: 3rem;
  flex-shrink: 0;
}

.submissions-track--desktop .submissions-sentinel {
  width: 4rem;
  min-height: auto;
  align-self: stretch;
}

.sentinel-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background-color: var(--color-border);
  animation: pulse 1.2s ease-in-out infinite;
}

.sentinel-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.sentinel-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.85);
  }
  40% {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
