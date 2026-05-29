import type { AdminSubmission } from "~~/shared/types/admin";

const PAGE_SIZE = 30;

export function useAdminReviews() {
  const search = ref("");
  const page = ref(1);
  const reviews = ref<AdminSubmission[]>([]);
  const total = ref(0);
  const totalPages = ref(0);
  const loading = ref(false);
  const error = ref(false);
  const deletingId = ref<string | null>(null);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const rangeStart = computed(() =>
    total.value === 0 ? 0 : (page.value - 1) * PAGE_SIZE + 1,
  );

  const rangeEnd = computed(() =>
    Math.min(page.value * PAGE_SIZE, total.value),
  );

  async function fetchReviews() {
    loading.value = true;
    error.value = false;

    try {
      const params = new URLSearchParams({
        page: String(page.value),
        limit: String(PAGE_SIZE),
      });
      const q = search.value.trim();
      if (q) params.set("q", q);

      const data = await $fetch<{
        submissions: AdminSubmission[];
        total: number;
        totalPages: number;
      }>(`/api/admin/submissions?${params}`);

      reviews.value = data.submissions;
      total.value = data.total;
      totalPages.value = data.totalPages;
    } catch {
      error.value = true;
      reviews.value = [];
      total.value = 0;
      totalPages.value = 0;
    } finally {
      loading.value = false;
    }
  }

  watch(search, () => {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      if (page.value !== 1) {
        page.value = 1;
      } else {
        fetchReviews();
      }
    }, 300);
  });

  watch(page, fetchReviews);

  onMounted(fetchReviews);

  onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
  });

  function formatDate(value: string): string {
    return new Intl.DateTimeFormat("es-CL", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

  async function deleteReview(id: string) {
    if (!confirm("¿Eliminar esta reseña? Esta acción no se puede deshacer.")) {
      return;
    }

    deletingId.value = id;

    try {
      await $fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      await fetchReviews();
      if (reviews.value.length === 0 && page.value > 1) {
        page.value--;
      }
    } catch {
      alert("No se pudo eliminar la reseña.");
    } finally {
      deletingId.value = null;
    }
  }

  return {
    search,
    page,
    reviews,
    total,
    totalPages,
    loading,
    error,
    deletingId,
    rangeStart,
    rangeEnd,
    formatDate,
    deleteReview,
  };
}
