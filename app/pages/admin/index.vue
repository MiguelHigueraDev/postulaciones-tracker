<script setup lang="ts">
import type { AdminCompany, AdminSubmission } from "~~/shared/types/admin";

definePageMeta({
  middleware: "admin",
});

useSeoMeta({
  title: "Moderación",
  robots: "noindex, nofollow",
});

const supabase = useSupabaseClient();

const REVIEWS_PAGE_SIZE = 30;

const activeTab = ref<"reviews" | "logos">("reviews");

const reviewSearch = ref("");
const reviewPage = ref(1);
const reviews = ref<AdminSubmission[]>([]);
const reviewTotal = ref(0);
const reviewTotalPages = ref(0);
const reviewsLoading = ref(false);
const reviewsError = ref(false);
const deletingId = ref<string | null>(null);

const companySearch = ref("");
const companyPage = ref(1);
const companies = ref<AdminCompany[]>([]);
const companyTotalPages = ref(0);
const companiesLoading = ref(false);
const companiesError = ref(false);
const selectedCompanyId = ref<string | null>(null);
const logoFile = ref<File | null>(null);
const logoUploading = ref(false);
const logoRemoving = ref(false);
const logoMessage = ref("");
const logoMessageIsError = ref(false);

let reviewSearchTimeout: ReturnType<typeof setTimeout> | null = null;
let companySearchTimeout: ReturnType<typeof setTimeout> | null = null;

const reviewRangeStart = computed(() =>
  reviewTotal.value === 0 ? 0 : (reviewPage.value - 1) * REVIEWS_PAGE_SIZE + 1,
);

const reviewRangeEnd = computed(() =>
  Math.min(reviewPage.value * REVIEWS_PAGE_SIZE, reviewTotal.value),
);

const selectedCompany = computed(
  () => companies.value.find((c) => c.id === selectedCompanyId.value) ?? null,
);

async function verifyAdminAccess() {
  try {
    await $fetch("/api/admin/me");
  } catch {
    await supabase.auth.signOut();
    await navigateTo("/admin/login");
  }
}

async function fetchReviews() {
  reviewsLoading.value = true;
  reviewsError.value = false;

  try {
    const params = new URLSearchParams({
      page: String(reviewPage.value),
      limit: String(REVIEWS_PAGE_SIZE),
    });
    const q = reviewSearch.value.trim();
    if (q) params.set("q", q);

    const data = await $fetch<{
      submissions: AdminSubmission[];
      total: number;
      totalPages: number;
    }>(`/api/admin/submissions?${params}`);

    reviews.value = data.submissions;
    reviewTotal.value = data.total;
    reviewTotalPages.value = data.totalPages;
  } catch {
    reviewsError.value = true;
    reviews.value = [];
    reviewTotal.value = 0;
    reviewTotalPages.value = 0;
  } finally {
    reviewsLoading.value = false;
  }
}

async function fetchCompanies() {
  companiesLoading.value = true;
  companiesError.value = false;

  try {
    const params = new URLSearchParams({
      page: String(companyPage.value),
    });
    const q = companySearch.value.trim();
    if (q) params.set("q", q);

    const data = await $fetch<{
      companies: AdminCompany[];
      totalPages: number;
    }>(`/api/admin/companies?${params}`);

    companies.value = data.companies;
    companyTotalPages.value = data.totalPages;

    if (
      selectedCompanyId.value &&
      !data.companies.some((c) => c.id === selectedCompanyId.value)
    ) {
      selectedCompanyId.value = data.companies[0]?.id ?? null;
    } else if (!selectedCompanyId.value && data.companies.length > 0) {
      selectedCompanyId.value = data.companies[0]!.id;
    }
  } catch {
    companiesError.value = true;
    companies.value = [];
    companyTotalPages.value = 0;
  } finally {
    companiesLoading.value = false;
  }
}

watch(reviewSearch, () => {
  if (reviewSearchTimeout) clearTimeout(reviewSearchTimeout);
  reviewSearchTimeout = setTimeout(() => {
    reviewPage.value = 1;
    fetchReviews();
  }, 300);
});

watch(reviewPage, fetchReviews);

watch(companySearch, () => {
  if (companySearchTimeout) clearTimeout(companySearchTimeout);
  companySearchTimeout = setTimeout(() => {
    companyPage.value = 1;
    fetchCompanies();
  }, 300);
});

watch(companyPage, fetchCompanies);

watch(activeTab, (tab) => {
  if (tab === "reviews" && reviews.value.length === 0) {
    fetchReviews();
  }
  if (tab === "logos" && companies.value.length === 0) {
    fetchCompanies();
  }
});

onMounted(async () => {
  await verifyAdminAccess();
  await fetchReviews();
});

onUnmounted(() => {
  if (reviewSearchTimeout) clearTimeout(reviewSearchTimeout);
  if (companySearchTimeout) clearTimeout(companySearchTimeout);
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
    if (reviews.value.length === 0 && reviewPage.value > 1) {
      reviewPage.value--;
    }
  } catch {
    alert("No se pudo eliminar la reseña.");
  } finally {
    deletingId.value = null;
  }
}

function onLogoSelected(event: Event) {
  const input = event.target as HTMLInputElement;
  logoFile.value = input.files?.[0] ?? null;
  logoMessage.value = "";
}

async function uploadLogo() {
  if (!selectedCompany.value || !logoFile.value) return;

  logoUploading.value = true;
  logoMessage.value = "";
  logoMessageIsError.value = false;

  try {
    const formData = new FormData();
    formData.append("logo", logoFile.value);

    await $fetch<{ logo_url: string }>(
      `/api/admin/companies/${selectedCompany.value.id}/logo`,
      {
        method: "POST",
        body: formData,
      },
    );

    selectedCompanyId.value = selectedCompany.value.id;
    logoFile.value = null;
    logoMessage.value = "Logo actualizado.";
    await fetchCompanies();
  } catch {
    logoMessageIsError.value = true;
    logoMessage.value = "No se pudo subir el logo.";
  } finally {
    logoUploading.value = false;
  }
}

async function removeLogo() {
  if (!selectedCompany.value?.logo_url) return;
  if (!confirm(`¿Eliminar el logo de ${selectedCompany.value.name}?`)) return;

  logoRemoving.value = true;
  logoMessage.value = "";
  logoMessageIsError.value = false;

  try {
    await $fetch(`/api/admin/companies/${selectedCompany.value.id}/logo`, {
      method: "DELETE",
    });
    logoMessage.value = "Logo eliminado.";
    await fetchCompanies();
  } catch {
    logoMessageIsError.value = true;
    logoMessage.value = "No se pudo eliminar el logo.";
  } finally {
    logoRemoving.value = false;
  }
}

async function logout() {
  await supabase.auth.signOut();
  await navigateTo("/admin/login");
}
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10 pb-24">
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="m-0 mb-1 font-display text-2xl font-bold tracking-tight text-text">
          Moderación
        </h1>
        <p class="m-0 font-mono text-xs tracking-wide text-text-subtle">
          Eliminar reseñas y gestionar logos
        </p>
      </div>
      <button
        type="button"
        class="rounded-md border border-border px-3 py-2 font-mono text-xs tracking-wide text-text-muted transition-colors duration-150 hover:border-text-muted hover:text-text"
        @click="logout"
      >
        Cerrar sesión
      </button>
    </div>

    <div class="mb-6 flex gap-2 border-b border-border">
      <button
        type="button"
        class="border-b-2 px-3 py-2 font-mono text-xs tracking-wide transition-colors duration-150"
        :class="
          activeTab === 'reviews'
            ? 'border-accent text-text'
            : 'border-transparent text-text-muted hover:text-text'
        "
        @click="activeTab = 'reviews'"
      >
        Reseñas
      </button>
      <button
        type="button"
        class="border-b-2 px-3 py-2 font-mono text-xs tracking-wide transition-colors duration-150"
        :class="
          activeTab === 'logos'
            ? 'border-accent text-text'
            : 'border-transparent text-text-muted hover:text-text'
        "
        @click="activeTab = 'logos'"
      >
        Logos
      </button>
    </div>

    <section v-if="activeTab === 'reviews'">
      <div class="mb-4">
        <input
          v-model="reviewSearch"
          type="search"
          placeholder="Buscar por empresa, cargo, industria o comentario…"
          class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
        />
      </div>

      <p v-if="reviewsLoading" class="font-mono text-xs text-text-muted">
        Cargando reseñas…
      </p>
      <p v-else-if="reviewsError" class="text-sm text-negative">
        No se pudieron cargar las reseñas.
      </p>
      <p v-else-if="reviews.length === 0" class="font-mono text-xs text-text-muted">
        No hay reseñas para mostrar.
      </p>

      <div v-else class="overflow-x-auto rounded-md border border-border">
        <table class="min-w-full border-collapse text-sm">
          <thead class="bg-surface-alt">
            <tr class="text-left font-mono text-[10px] tracking-wider text-text-subtle uppercase">
              <th class="px-3 py-2">Empresa</th>
              <th class="px-3 py-2">Cargo</th>
              <th class="px-3 py-2">Resultado</th>
              <th class="px-3 py-2">Fecha</th>
              <th class="px-3 py-2">Comentario</th>
              <th class="px-3 py-2" />
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="review in reviews"
              :key="review.id"
              class="border-t border-border"
            >
              <td class="px-3 py-2 whitespace-nowrap">{{ review.company_name }}</td>
              <td class="px-3 py-2 whitespace-nowrap">{{ review.position }}</td>
              <td class="px-3 py-2 whitespace-nowrap">{{ review.result }}</td>
              <td class="px-3 py-2 whitespace-nowrap font-mono text-xs text-text-muted">
                {{ formatDate(review.created_at) }}
              </td>
              <td class="max-w-xs truncate px-3 py-2 text-text-muted">
                {{ review.comment || "—" }}
              </td>
              <td class="px-3 py-2 text-right">
                <button
                  type="button"
                  class="rounded border border-negative-border px-2 py-1 font-mono text-[10px] tracking-wide text-negative transition-colors duration-150 hover:bg-negative-bg disabled:opacity-50"
                  :disabled="deletingId === review.id"
                  @click="deleteReview(review.id)"
                >
                  {{ deletingId === review.id ? "…" : "Eliminar" }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="reviewTotal > 0"
        class="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-text-muted"
      >
        <span>
          {{ reviewRangeStart }}–{{ reviewRangeEnd }} de {{ reviewTotal }} reseñas
        </span>
        <div v-if="reviewTotalPages > 1" class="flex items-center gap-2">
          <button
            type="button"
            class="rounded border border-border px-2 py-1 disabled:opacity-40"
            :disabled="reviewPage <= 1 || reviewsLoading"
            @click="reviewPage--"
          >
            Anterior
          </button>
          <span>{{ reviewPage }} / {{ reviewTotalPages }}</span>
          <button
            type="button"
            class="rounded border border-border px-2 py-1 disabled:opacity-40"
            :disabled="reviewPage >= reviewTotalPages || reviewsLoading"
            @click="reviewPage++"
          >
            Siguiente
          </button>
        </div>
      </div>
    </section>

    <section v-else>
      <div class="mb-4">
        <input
          v-model="companySearch"
          type="search"
          placeholder="Buscar empresa…"
          class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
        />
      </div>

      <p v-if="companiesLoading" class="font-mono text-xs text-text-muted">
        Cargando empresas…
      </p>
      <p v-else-if="companiesError" class="text-sm text-negative">
        No se pudieron cargar las empresas.
      </p>
      <p v-else-if="companies.length === 0" class="font-mono text-xs text-text-muted">
        No hay empresas para mostrar.
      </p>

      <div v-else class="grid gap-6 900:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div class="overflow-hidden rounded-md border border-border">
          <ul class="max-h-96 overflow-y-auto">
            <li
              v-for="company in companies"
              :key="company.id"
              class="border-b border-border last:border-b-0"
            >
              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-alt"
                :class="selectedCompanyId === company.id ? 'bg-surface-alt' : ''"
                @click="selectedCompanyId = company.id"
              >
                <span
                  class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-surface-alt text-xs font-bold text-text-muted"
                >
                  <img
                    v-if="company.logo_url"
                    :src="company.logo_url"
                    :alt="`${company.name} logo`"
                    class="size-full object-cover"
                  />
                  <span v-else>{{ company.name.charAt(0).toUpperCase() }}</span>
                </span>
                <span class="min-w-0 truncate text-sm">{{ company.name }}</span>
              </button>
            </li>
          </ul>
        </div>

        <div v-if="selectedCompany" class="rounded-md border border-border bg-surface p-4">
          <h2 class="m-0 mb-4 font-display text-lg font-semibold text-text">
            {{ selectedCompany.name }}
          </h2>

          <div class="mb-4 flex items-center gap-3">
            <span
              class="flex size-16 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-alt text-xl font-bold text-text-muted"
            >
              <img
                v-if="selectedCompany.logo_url"
                :src="selectedCompany.logo_url"
                :alt="`${selectedCompany.name} logo`"
                class="size-full object-cover"
              />
              <span v-else>{{ selectedCompany.name.charAt(0).toUpperCase() }}</span>
            </span>
            <p class="m-0 font-mono text-xs text-text-subtle">
              PNG, JPEG, WebP o SVG. Máx. 512 KB.
            </p>
          </div>

          <label class="mb-4 flex flex-col gap-1.5">
            <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">
              Nuevo logo
            </span>
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/svg+xml"
              class="text-sm text-text-muted file:mr-3 file:rounded file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:font-mono file:text-xs file:text-text"
              @change="onLogoSelected"
            />
          </label>

          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
              :disabled="!logoFile || logoUploading"
              @click="uploadLogo"
            >
              {{ logoUploading ? "Subiendo…" : "Subir logo" }}
            </button>
            <button
              v-if="selectedCompany.logo_url"
              type="button"
              class="rounded-md border border-negative-border px-3 py-2 text-sm text-negative transition-colors duration-150 hover:bg-negative-bg disabled:opacity-50"
              :disabled="logoRemoving"
              @click="removeLogo"
            >
              {{ logoRemoving ? "Eliminando…" : "Eliminar logo" }}
            </button>
          </div>

          <p
            v-if="logoMessage"
            class="mt-3 text-sm"
            :class="logoMessageIsError ? 'text-negative' : 'text-positive'"
          >
            {{ logoMessage }}
          </p>
        </div>
      </div>

      <div
        v-if="companyTotalPages > 1"
        class="mt-4 flex items-center justify-end gap-2 font-mono text-xs text-text-muted"
      >
        <button
          type="button"
          class="rounded border border-border px-2 py-1 disabled:opacity-40"
          :disabled="companyPage <= 1 || companiesLoading"
          @click="companyPage--"
        >
          Anterior
        </button>
        <span>{{ companyPage }} / {{ companyTotalPages }}</span>
        <button
          type="button"
          class="rounded border border-border px-2 py-1 disabled:opacity-40"
          :disabled="companyPage >= companyTotalPages || companiesLoading"
          @click="companyPage++"
        >
          Siguiente
        </button>
      </div>
    </section>
  </div>
</template>
