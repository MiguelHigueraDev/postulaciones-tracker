<template>
  <div class="mx-auto max-w-4xl px-4 py-16">
    <div class="text-center">
      <h1 class="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
        Postulaciones Tracker
      </h1>
      <p class="mt-4 text-lg text-slate-600">
        Comparte tu experiencia postulando a empresas en Chile de forma
        <strong class="text-slate-800">100% anónima</strong>. Ayuda a otros a
        saber qué esperar del proceso de selección.
      </p>
      <div class="mt-10 flex items-center justify-center gap-4">
        <NuxtLink
          to="/enviar"
          class="rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700"
        >
          Enviar feedback
        </NuxtLink>
        <NuxtLink
          to="/resultados"
          class="rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
        >
          Ver resultados
        </NuxtLink>
      </div>
    </div>

    <div class="mt-20 grid gap-8 sm:grid-cols-3">
      <div class="rounded-lg border border-slate-200 bg-white p-6">
        <div class="mb-3 text-2xl">🔒</div>
        <h3 class="font-semibold text-slate-900">100% Anónimo</h3>
        <p class="mt-2 text-sm text-slate-600">
          No recopilamos datos personales, no usamos cookies de rastreo ni
          guardamos direcciones IP.
        </p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-6">
        <div class="mb-3 text-2xl">📊</div>
        <h3 class="font-semibold text-slate-900">Datos reales</h3>
        <p class="mt-2 text-sm text-slate-600">
          Feedback real de personas que han postulado a empresas en Chile.
          Tiempos de respuesta, etapas y resultados.
        </p>
      </div>
      <div class="rounded-lg border border-slate-200 bg-white p-6">
        <div class="mb-3 text-2xl">🤝</div>
        <h3 class="font-semibold text-slate-900">Ayuda a la comunidad</h3>
        <p class="mt-2 text-sm text-slate-600">
          Tu experiencia ayuda a otros postulantes a tomar mejores decisiones
          sobre dónde aplicar.
        </p>
      </div>
    </div>
  </div>
</template>
