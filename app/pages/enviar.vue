<script setup lang="ts">
useSeoMeta({
  title: "Enviar feedback",
  description:
    "Comparte tu experiencia de postulación de forma anónima. Sin cuenta ni datos personales.",
});
</script>

<template>
  <div class="mx-auto max-w-304 px-6 pt-10 pb-24">
    <div class="mb-10">
      <div class="mb-5 flex items-center gap-1.5 font-mono text-xs">
        <NuxtLink to="/" class="text-text-muted no-underline transition-colors duration-150 hover:text-text">
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <span class="text-accent">enviar</span>
      </div>
      <h1 class="m-0 mb-2 font-display text-32 font-extrabold tracking-tight text-text">
        Enviar feedback
      </h1>
    </div>

    <div class="grid grid-cols-1 items-start gap-8 900:grid-cols-[16rem_1fr] 900:gap-12">
      <div class="flex flex-col gap-7 900:sticky 900:top-20">
        <div class="flex flex-col gap-2.5">
          <div class="font-mono text-xs tracking-wide text-text-subtle">// privacidad</div>
          <p class="m-0 text-sm leading-relaxed font-light text-text-muted">
            No pedimos cuenta ni datos que te identifiquen.
            <NuxtLink target="_blank" to="/privacidad"
              class="mt-2 inline-block text-13 text-accent no-underline hover:underline">
              Política de privacidad
            </NuxtLink>
          </p>
        </div>
        <div class="flex flex-col gap-2.5">
          <div class="font-mono text-xs tracking-wide text-text-subtle">
            // qué datos pedimos
          </div>
          <ul
            class="m-0 flex list-none flex-col gap-1.5 p-0 [&_li]:flex [&_li]:items-center [&_li]:gap-2 [&_li]:text-sm [&_li]:font-light [&_li]:text-text-muted [&_li]:before:font-mono [&_li]:before:text-xs [&_li]:before:text-text-subtle [&_li]:before:content-['—']">
            <li>Empresa y rubro</li>
            <li>Cargo postulado</li>
            <li>Mes de postulación</li>
            <li>Respuesta recibida</li>
            <li>Etapas del proceso</li>
            <li>Resultado final</li>
          </ul>
        </div>
      </div>

      <div class="rounded-card border border-border bg-surface p-8">
        <FeedbackForm />
      </div>
    </div>
  </div>
</template>
