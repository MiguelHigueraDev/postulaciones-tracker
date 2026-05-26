<template>
  <div class="app-root">
    <AppHeader />
    <main class="app-main">
      <NuxtPage />
    </main>
    <footer class="app-footer">
      <div class="footer-inner">
        <span class="footer-mono">postulaciones-tracker</span>
        <span class="footer-sep">/</span>
        <span class="footer-tag">sin datos personales · anónimo · Chile</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg);
  color: var(--color-text);
}

.app-main {
  flex: 1;
}

.app-footer {
  border-top: 1px solid var(--color-border-subtle);
  padding: 1.25rem 1.5rem;
  margin-top: 5rem;
}

.footer-inner {
  max-width: 76rem;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
}

.footer-mono {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-accent);
}

.footer-sep {
  color: var(--color-border);
}

.footer-tag {
  color: var(--color-text-subtle);
  letter-spacing: 0.02em;
}
</style>
