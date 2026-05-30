<script setup lang="ts">
import { fetchResult } from "~~/shared/utils/fetchResult";
definePageMeta({
  viewTransition: false,
  pageTransition: false,
});

useSeoMeta({
  title: "Admin login",
  robots: "noindex, nofollow",
});

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isSubmitting = ref(false);

watch(
  user,
  async (currentUser) => {
    if (!currentUser) return;

    const result = await fetchResult(() => $fetch("/api/admin/me"));
    if (result.isOk()) {
      const redirect =
        typeof route.query.redirect === "string" ? route.query.redirect : "/admin";
      await navigateTo(redirect);
    }
  },
  { immediate: true },
);

async function onSubmit() {
  errorMessage.value = "";
  isSubmitting.value = true;

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  });

  if (signInError) {
    errorMessage.value = "Credenciales inválidas.";
    isSubmitting.value = false;
    return;
  }

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session) {
    errorMessage.value = "No pudimos iniciar sesión. Intenta de nuevo.";
    isSubmitting.value = false;
    return;
  }

  const adminCheck = await fetchResult(() => $fetch("/api/admin/me"));
  if (adminCheck.isErr()) {
    await supabase.auth.signOut();
    errorMessage.value = "Esta cuenta no tiene acceso de administrador.";
    isSubmitting.value = false;
    return;
  }

  const redirect =
    typeof route.query.redirect === "string" ? route.query.redirect : "/admin";
  await navigateTo(redirect);
  isSubmitting.value = false;
}
</script>

<template>
  <div class="mx-auto flex min-h-[60vh] max-w-md flex-col justify-center px-6 py-16">
    <h1 class="m-0 mb-2 font-display text-2xl font-bold tracking-tight text-text">
      Moderación
    </h1>
    <p class="m-0 mb-8 font-mono text-xs tracking-wide text-text-subtle">
      Acceso restringido
    </p>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <label class="flex flex-col gap-1.5">
        <span class="font-mono text-xs tracking-wide text-text-muted uppercase">
          Email
        </span>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="username"
          class="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
        />
      </label>

      <label class="flex flex-col gap-1.5">
        <span class="font-mono text-xs tracking-wide text-text-muted uppercase">
          Contraseña
        </span>
        <input
          v-model="password"
          type="password"
          required
          autocomplete="current-password"
          class="rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
        />
      </label>

      <p v-if="errorMessage" class="m-0 text-sm text-negative">
        {{ errorMessage }}
      </p>

      <button
        type="submit"
        class="btn-primary mt-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover disabled:opacity-60"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Entrando…" : "Entrar" }}
      </button>
    </form>
  </div>
</template>
