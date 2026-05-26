<script setup lang="ts">
const links = [
  { to: "/", label: "Inicio" },
  { to: "/enviar", label: "Enviar feedback" },
  { to: "/resultados", label: "Ver resultados" },
];
</script>

<template>
  <header class="border-b border-slate-200 bg-white">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
      <NuxtLink to="/" class="text-xl font-bold text-slate-900">
        Postulaciones Tracker
      </NuxtLink>
      <nav class="flex gap-6">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          active-class="text-slate-900"
        >
          {{ link.label }}
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>
