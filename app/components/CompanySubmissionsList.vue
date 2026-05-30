<script setup lang="ts">
import type {
  CompanySubmission,
  GlobalSubmission,
  PaginatedSubmissions,
  SubmissionCursor,
} from "~~/shared/utils/companyStats";
import { fetchResult } from "~~/shared/utils/fetchResult";
import { SUBMISSIONS_PAGE_SIZE } from "~~/shared/utils/companyStats";
import { getResultStyle } from "~~/shared/constants/resultStyles";

const props = defineProps<{
  companyName: string;
  companySlug: string;
  totalCount: number;
}>();

const selectedSubmission = ref<GlobalSubmission | null>(null);

function toGlobalSubmission(submission: CompanySubmission): GlobalSubmission {
  return {
    ...submission,
    company_name: props.companyName,
    company_slug: props.companySlug,
  };
}

function openDetail(submission: CompanySubmission) {
  selectedSubmission.value = toGlobalSubmission(submission);
}

function closeDetail() {
  selectedSubmission.value = null;
}

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

  const params = new URLSearchParams({
    limit: String(SUBMISSIONS_PAGE_SIZE),
  });

  if (cursor) {
    params.set("cursorCreatedAt", cursor.createdAt);
    params.set("cursorId", cursor.id);
  }

  const result = await fetchResult(() =>
    $fetch<PaginatedSubmissions>(
      `/api/companies/${encodeURIComponent(props.companySlug)}/submissions?${params}`,
    ),
  );

  result.match({
    ok: (data) => {
      if (cursor) {
        submissions.value = [...submissions.value, ...data.submissions];
      } else {
        submissions.value = data.submissions;
      }

      nextCursor.value = data.nextCursor;
    },
    err: () => {
      loadError.value = true;
    },
  });

  isLoading.value = false;
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
  <section class="flex min-w-0 flex-col gap-4">
    <div class="flex items-baseline justify-between gap-4">
      <h3 class="m-0 font-mono text-11 font-medium tracking-widest text-text-subtle uppercase">
        Registros
      </h3>
      <span class="font-mono text-11 text-text-subtle">
        {{ submissions.length
        }}<template v-if="totalCount > submissions.length">
          / {{ totalCount }}</template>
      </span>
    </div>

    <div v-if="isLoading && submissions.length === 0"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-10 text-center"
      aria-live="polite">
      <div class="flex gap-1.5">
        <span class="size-1.5 rounded-full bg-border animate-loading-dot" />
        <span class="size-1.5 rounded-full bg-border animate-loading-dot [animation-delay:0.2s]" />
        <span class="size-1.5 rounded-full bg-border animate-loading-dot [animation-delay:0.4s]" />
      </div>
      <p class="m-0 text-sm text-text-subtle">Cargando registros...</p>
    </div>

    <div v-else-if="loadError && submissions.length === 0"
      class="flex flex-col items-center gap-2 rounded-lg border border-border-subtle bg-surface px-4 py-10 text-center">
      <p class="m-0 text-sm text-text-subtle">No pudimos cargar los registros.</p>
      <button type="button"
        class="cursor-pointer border-0 bg-transparent p-0 text-sm text-accent hover:text-accent-hover"
        @click="resetAndLoad()">
        Reintentar
      </button>
    </div>

    <div v-else ref="scrollRoot"
      class="flex min-w-0 flex-col gap-3 md:flex-row md:snap-x md:snap-proximity md:overflow-x-auto md:overscroll-x-contain md:pb-2 md:[scrollbar-color:var(--color-border)_transparent] md:[-webkit-overflow-scrolling:touch] md:[&::-webkit-scrollbar]:h-1.5 md:[&::-webkit-scrollbar-thumb]:rounded-full md:[&::-webkit-scrollbar-thumb]:bg-border">
      <article v-for="submission in submissions" :key="submission.id"
        class="flex cursor-pointer flex-col gap-3.5 rounded-lg border border-border-subtle bg-surface px-4.5 py-4 transition-colors duration-150 hover:border-border hover:bg-surface-alt md:max-h-88 md:min-w-0 md:flex-[0_0_18.5rem] md:snap-start md:overflow-y-auto"
        @click="openDetail(submission)">
        <header class="flex items-start justify-between gap-3">
          <h4 class="m-0 text-15 leading-snug font-medium text-text">
            {{ submission.position }}
          </h4>
          <span
            class="inline-flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-11 font-medium whitespace-nowrap"
            :style="{
              color: getResultStyle(submission.result).color,
              backgroundColor: getResultStyle(submission.result).bg,
              borderColor: getResultStyle(submission.result).border,
            }">
            <span class="size-1.25 shrink-0 rounded-full" :style="{
              backgroundColor: getResultStyle(submission.result).dot,
            }" aria-hidden="true" />
            {{ getResultStyle(submission.result).label }}
          </span>
        </header>

        <dl class="m-0 flex flex-col gap-1.5">
          <div class="grid grid-cols-[4.75rem_1fr] gap-2 text-13">
            <dt class="font-mono text-11 text-text-subtle lowercase">
              Rubro
            </dt>
            <dd class="m-0 font-light text-text-muted">{{ submission.industry }}</dd>
          </div>
          <div class="grid grid-cols-[4.75rem_1fr] gap-2 text-13">
            <dt class="font-mono text-11 text-text-subtle lowercase">
              Período
            </dt>
            <dd class="m-0 font-light text-text-muted">
              {{ submission.application_month }}
            </dd>
          </div>
          <div class="grid grid-cols-[4.75rem_1fr] gap-2 text-13">
            <dt class="font-mono text-11 text-text-subtle lowercase">
              Respuesta
            </dt>
            <dd class="m-0 font-light text-text-muted">
              {{ submission.response_time }}
            </dd>
          </div>
          <div class="grid grid-cols-[4.75rem_1fr] gap-2 text-13">
            <dt class="font-mono text-11 text-text-subtle lowercase">
              Etapas
            </dt>
            <dd class="m-0 font-light text-text-muted">
              {{ submission.stages_reached }}
              <template v-if="submission.last_stage">
                · {{ submission.last_stage }}
              </template>
            </dd>
          </div>
        </dl>

        <p v-if="submission.comment"
          class="m-0 border-t border-border-subtle pt-3 text-13 leading-relaxed font-light text-text-muted">
          {{ submission.comment }}
        </p>
      </article>

      <div v-if="hasMore || isLoading" ref="sentinel"
        class="flex min-h-12 shrink-0 items-center justify-center gap-1.5 md:min-h-0 md:w-16 md:self-stretch"
        aria-hidden="true">
        <span class="size-1.5 rounded-full bg-border animate-loading-dot" />
        <span class="size-1.5 rounded-full bg-border animate-loading-dot [animation-delay:0.2s]" />
        <span class="size-1.5 rounded-full bg-border animate-loading-dot [animation-delay:0.4s]" />
      </div>
    </div>

    <p v-if="loadError && submissions.length > 0" class="m-0 text-13 text-text-subtle">
      Error al cargar más registros.
      <button type="button"
        class="cursor-pointer border-0 bg-transparent p-0 text-sm text-accent hover:text-accent-hover"
        @click="loadMore()">
        Reintentar
      </button>
    </p>

    <SubmissionDetailModal
      :submission="selectedSubmission"
      @close="closeDetail"
    />
  </section>
</template>
