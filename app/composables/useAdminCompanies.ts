import type { AdminCompany } from "~~/shared/types/admin";
import { slugifyCompanyName } from "~~/shared/utils/companySlug";

export function useAdminCompanies() {
  const search = ref("");
  const page = ref(1);
  const companies = ref<AdminCompany[]>([]);
  const totalPages = ref(0);
  const loading = ref(false);
  const error = ref(false);
  const selectedId = ref<string | null>(null);
  const name = ref("");
  const saving = ref(false);
  const message = ref("");
  const messageIsError = ref(false);
  const logoFile = ref<File | null>(null);
  const logoUploading = ref(false);
  const logoRemoving = ref(false);
  const logoMessage = ref("");
  const logoMessageIsError = ref(false);

  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

  const selected = computed(
    () => companies.value.find((c) => c.id === selectedId.value) ?? null,
  );

  const nameUnchanged = computed(
    () => !selected.value || name.value.trim() === selected.value.name,
  );

  const nameNormalizedPreview = computed(() => {
    const trimmed = name.value.trim();
    if (trimmed) return slugifyCompanyName(trimmed);
    return selected.value?.name_normalized ?? "";
  });

  async function fetchCompanies() {
    loading.value = true;
    error.value = false;

    try {
      const params = new URLSearchParams({
        page: String(page.value),
      });
      const q = search.value.trim();
      if (q) params.set("q", q);

      const data = await $fetch<{
        companies: AdminCompany[];
        totalPages: number;
      }>(`/api/admin/companies?${params}`);

      companies.value = data.companies;
      totalPages.value = data.totalPages;

      if (
        selectedId.value &&
        !data.companies.some((c) => c.id === selectedId.value)
      ) {
        selectedId.value = data.companies[0]?.id ?? null;
      } else if (!selectedId.value && data.companies.length > 0) {
        selectedId.value = data.companies[0]!.id;
      }

      const current = data.companies.find((c) => c.id === selectedId.value);
      name.value = current?.name ?? "";
    } catch {
      error.value = true;
      companies.value = [];
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
        fetchCompanies();
      }
    }, 300);
  });

  watch(page, fetchCompanies);

  watch(selectedId, () => {
    const company = companies.value.find((c) => c.id === selectedId.value);
    name.value = company?.name ?? "";
    message.value = "";
    messageIsError.value = false;
    logoMessage.value = "";
    logoMessageIsError.value = false;
    logoFile.value = null;
  });

  onMounted(fetchCompanies);

  onUnmounted(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
  });

  async function saveCompany() {
    if (!selected.value) return;

    const trimmed = name.value.trim();
    if (!trimmed || nameUnchanged.value) return;

    saving.value = true;
    message.value = "";
    messageIsError.value = false;

    try {
      await $fetch<AdminCompany>(
        `/api/admin/companies/${selected.value.id}`,
        {
          method: "PATCH",
          body: { name: trimmed },
        },
      );

      message.value = "Empresa actualizada.";
      await fetchCompanies();
    } catch (err: unknown) {
      messageIsError.value = true;
      const status =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      message.value =
        status === 409
          ? "Ya existe otra empresa con ese nombre."
          : "No se pudo actualizar la empresa.";
    } finally {
      saving.value = false;
    }
  }

  function onLogoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    logoFile.value = input.files?.[0] ?? null;
    logoMessage.value = "";
  }

  async function uploadLogo() {
    if (!selected.value || !logoFile.value) return;

    logoUploading.value = true;
    logoMessage.value = "";
    logoMessageIsError.value = false;

    try {
      const formData = new FormData();
      formData.append("logo", logoFile.value);

      await $fetch<{ logo_url: string }>(
        `/api/admin/companies/${selected.value.id}/logo`,
        {
          method: "POST",
          body: formData,
        },
      );

      selectedId.value = selected.value.id;
      logoFile.value = null;
      logoMessage.value = "Logo actualizado.";
      await fetchCompanies();
    } catch (err: unknown) {
      logoMessageIsError.value = true;
      const status =
        err && typeof err === "object" && "statusCode" in err
          ? (err as { statusCode?: number }).statusCode
          : undefined;
      if (status === 400) {
        const dataMessage =
          err && typeof err === "object" && "data" in err
            ? (err as { data?: { message?: string } }).data?.message
            : undefined;
        logoMessage.value = dataMessage ?? "No se pudo subir el logo.";
      } else {
        logoMessage.value = "No se pudo subir el logo.";
      }
    } finally {
      logoUploading.value = false;
    }
  }

  async function removeLogo() {
    if (!selected.value?.logo_url) return;
    if (!confirm(`¿Eliminar el logo de ${selected.value.name}?`)) return;

    logoRemoving.value = true;
    logoMessage.value = "";
    logoMessageIsError.value = false;

    try {
      await $fetch(`/api/admin/companies/${selected.value.id}/logo`, {
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

  return {
    search,
    page,
    companies,
    totalPages,
    loading,
    error,
    selectedId,
    selected,
    name,
    saving,
    message,
    messageIsError,
    nameUnchanged,
    nameNormalizedPreview,
    logoFile,
    logoUploading,
    logoRemoving,
    logoMessage,
    logoMessageIsError,
    saveCompany,
    onLogoSelected,
    uploadLogo,
    removeLogo,
  };
}
