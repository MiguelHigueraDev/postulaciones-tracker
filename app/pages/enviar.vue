<template>
  <div class="page-enviar">
    <div class="page-header">
      <div class="page-breadcrumb">
        <NuxtLink to="/" class="breadcrumb-link">inicio</NuxtLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">enviar</span>
      </div>
      <h1 class="page-title">Enviar feedback</h1>
    </div>

    <div class="form-layout">
      <div class="form-sidebar">
        <div class="sidebar-block">
          <div class="sidebar-label">// privacidad</div>
          <p class="sidebar-text">
            No pedimos cuenta ni datos que te identifiquen.
            <NuxtLink target="_blank" to="/privacidad" class="sidebar-link">Política de privacidad</NuxtLink>
          </p>
        </div>
        <div class="sidebar-block">
          <div class="sidebar-label">// qué datos pedimos</div>
          <ul class="sidebar-list">
            <li>Empresa y rubro</li>
            <li>Cargo postulado</li>
            <li>Mes de postulación</li>
            <li>Respuesta recibida</li>
            <li>Etapas del proceso</li>
            <li>Resultado final</li>
          </ul>
        </div>
      </div>

      <div class="form-main">
        <FeedbackForm />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-enviar {
  max-width: 76rem;
  margin: 0 auto;
  padding: 2.5rem 1.5rem 6rem;
}

.page-header {
  margin-bottom: 2.5rem;
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

/* ─── Layout ─── */
.form-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

@media (min-width: 900px) {
  .form-layout {
    grid-template-columns: 16rem 1fr;
    align-items: start;
    gap: 3rem;
  }
}

/* ─── Sidebar ─── */
.form-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

@media (min-width: 900px) {
  .form-sidebar {
    position: sticky;
    top: 5rem;
  }
}

.sidebar-block {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.sidebar-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-subtle);
  letter-spacing: 0.02em;
}

.sidebar-text {
  font-size: 0.875rem;
  line-height: 1.65;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 300;
}

.sidebar-link {
  display: inline-block;
  margin-top: 0.5rem;
  color: var(--color-accent);
  text-decoration: none;
  font-size: 0.8125rem;
}

.sidebar-link:hover {
  text-decoration: underline;
}

.sidebar-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.sidebar-list li {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  font-weight: 300;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.sidebar-list li::before {
  content: "—";
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-subtle);
}

/* ─── Form card ─── */
.form-main {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  padding: 2rem;
}
</style>
