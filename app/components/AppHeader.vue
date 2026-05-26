<script setup lang="ts">
const links = [
  { to: "/resultados", label: "Resultados" },
  { to: "/enviar", label: "Enviar feedback" },
];
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <NuxtLink to="/" class="header-logo">
        <span class="logo-bracket">[</span>
        <span class="logo-text">pt</span>
        <span class="logo-bracket">]</span>
        <span class="logo-full">postulaciones-tracker</span>
      </NuxtLink>

      <nav class="header-nav">
        <NuxtLink
          v-for="link in links"
          :key="link.to"
          :to="link.to"
          class="nav-link"
          active-class="nav-link--active"
        >
          {{ link.label }}
        </NuxtLink>
        <NuxtLink to="/enviar" class="nav-cta">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Enviar
        </NuxtLink>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background-color: color-mix(in srgb, var(--color-bg) 85%, transparent);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--color-border-subtle);
}

.header-inner {
  max-width: 76rem;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 3.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
}

.header-logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  gap: 0;
  flex-shrink: 0;
}

.logo-bracket {
  font-family: var(--font-mono);
  font-size: 1rem;
  color: var(--color-text-subtle);
  line-height: 1;
}

.logo-text {
  font-family: var(--font-mono);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-accent);
  letter-spacing: -0.02em;
  padding: 0 0.05em;
}

.logo-full {
  display: none;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  margin-left: 0.75rem;
  letter-spacing: -0.01em;
}

@media (min-width: 640px) {
  .logo-full {
    display: inline;
  }
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 0.125rem;
}

.nav-link {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-text-muted);
  text-decoration: none;
  padding: 0.375rem 0.75rem;
  border-radius: 0.25rem;
  transition: color 0.12s ease, background-color 0.12s ease;
  letter-spacing: -0.01em;
}

.nav-link:hover {
  color: var(--color-text);
  background-color: var(--color-surface-alt);
}

.nav-link--active {
  color: var(--color-text);
}

/* Hide "Enviar feedback" from nav links — shown as CTA button */
.nav-link[href="/enviar"] {
  display: none;
}

.nav-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  margin-left: 0.5rem;
  padding: 0.4rem 0.875rem;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-bg);
  background-color: var(--color-accent);
  text-decoration: none;
  border-radius: 0.25rem;
  transition: background-color 0.12s ease;
  letter-spacing: -0.01em;
}

.nav-cta:hover {
  background-color: var(--color-accent-hover);
}
</style>
