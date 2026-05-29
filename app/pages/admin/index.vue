<script setup lang="ts">
definePageMeta({
  middleware: "admin",
  viewTransition: false,
  pageTransition: false,
});

useSeoMeta({
  title: "Moderación",
  robots: "noindex, nofollow",
});

const supabase = useSupabaseClient();
const activeTab = ref<"reviews" | "companies">("reviews");

async function verifyAdminAccess() {
  try {
    await $fetch("/api/admin/me");
  } catch {
    await supabase.auth.signOut();
    await navigateTo("/admin/login");
  }
}

async function logout() {
  await supabase.auth.signOut();
  await navigateTo("/admin/login");
}

onMounted(verifyAdminAccess);
</script>

<template>
  <div class="mx-auto max-w-5xl px-6 py-10 pb-24">
    <div class="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 class="m-0 mb-1 font-display text-2xl font-bold tracking-tight text-text">
          Moderación
        </h1>
        <p class="m-0 font-mono text-xs tracking-wide text-text-subtle">
          Eliminar reseñas y gestionar empresas
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
          activeTab === 'companies'
            ? 'border-accent text-text'
            : 'border-transparent text-text-muted hover:text-text'
        "
        @click="activeTab = 'companies'"
      >
        Empresas
      </button>
    </div>

    <AdminReviewsPanel v-if="activeTab === 'reviews'" />
    <AdminCompaniesPanel v-else />
  </div>
</template>
