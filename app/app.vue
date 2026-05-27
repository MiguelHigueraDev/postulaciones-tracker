<script setup lang="ts">
useHead({
  titleTemplate: (title) =>
    title ? `${title} — me-postulé` : "me-postulé",
});
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg text-text">
    <AppHeader />
    <main class="flex-1">
      <NuxtPage />
    </main>
    <footer class="mt-20 border-t border-border-subtle px-6 py-5">
      <div class="mx-auto flex max-w-304 items-center gap-3 text-xs">
        <span class="font-mono text-xs text-accent">me-postulé</span>
        <span class="text-border">/</span>
        <NuxtLink to="/privacidad"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-accent">
          Privacidad
        </NuxtLink>
        <span class="text-border">/</span>
        <a href="https://github.com/MiguelHigueraDev/postulaciones-tracker" target="_blank"
          rel="noopener noreferrer"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-accent">
          GitHub
        </a>
      </div>
    </footer>
  </div>
</template>
