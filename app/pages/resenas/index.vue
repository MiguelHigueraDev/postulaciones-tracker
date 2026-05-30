<script setup lang="ts">
useSeoMeta({
  title: "Reseñas",
  description:
    "Directorio de empresas tech en Chile con datos reales de procesos de selección: reseñas, ghost rate, ofertas y ratings.",
});
</script>

<template>
  <div class="mx-auto max-w-304 px-6 pt-10 pb-24">
    <div class="mb-10">
      <div class="mb-5 flex items-center gap-1.5 font-mono text-xs">
        <NuxtLink
          to="/"
          class="text-text-muted no-underline transition-colors duration-150 hover:text-text"
        >
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <span class="text-accent">reseñas</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text md:text-40">
        Directorio de empresas
      </h1>
      <p class="m-0 max-w-xl text-base font-light leading-relaxed text-text-muted">
        Explora feedback anónimo por empresa: volumen de reseñas, ghost rate,
        ofertas aceptadas y ratings del lugar de trabajo.
      </p>
    </div>

    <CompanyDirectory />
  </div>
</template>
