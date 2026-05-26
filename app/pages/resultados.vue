<template>
  <div class="page-resultados">
    <div class="page-header">
      <div class="page-breadcrumb">
        <NuxtLink to="/" class="breadcrumb-link">inicio</NuxtLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">resultados</span>
      </div>
      <h1 class="page-title">Resultados</h1>
      <p class="page-subtitle">
        Feedback colectivo anónimo · empresas en Chile
      </p>
    </div>

    <FeedbackTable />
  </div>
</template>

<style scoped>
.page-resultados {
  max-width: 96rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  margin-bottom: 1.25rem;
}

.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color 0.12s ease;
}

.breadcrumb-link:hover {
  color: var(--color-text);
}

.breadcrumb-sep {
  color: var(--color-text-subtle);
}

.breadcrumb-current {
  color: var(--color-accent);
}

.page-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0 0 0.5rem;
}

.page-subtitle {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
  margin: 0;
  letter-spacing: 0.01em;
}
</style>
