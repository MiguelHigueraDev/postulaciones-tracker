<template>
  <div class="home-page">

    <!-- Hero -->
    <section class="hero">
      <div class="hero-inner">

        <h1 class="hero-headline">
          Transparencia<br />en el hiring.
        </h1>

        <p class="hero-body">
          Datos reales de procesos de selección en empresas tech de Chile.
          Tiempos de respuesta, etapas, resultados. Aportado de forma anónima
          por la comunidad.
        </p>

        <div class="hero-actions">
          <NuxtLink to="/resultados" class="btn-primary">
            Ver datos
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/enviar" class="btn-ghost">
            Compartir experiencia
          </NuxtLink>
        </div>
      </div>

      <!-- Terminal decoration -->
      <div class="hero-terminal" aria-hidden="true">
        <div class="terminal-header">
          <span class="t-dot t-dot--red"></span>
          <span class="t-dot t-dot--yellow"></span>
          <span class="t-dot t-dot--green"></span>
          <span class="t-title">pt — query</span>
        </div>
        <div class="terminal-body">
          <div class="t-line"><span class="t-prompt">$</span> <span class="t-cmd">pt query</span> <span
              class="t-flag">--company</span> <span class="t-str">"Buk"</span></div>
          <div class="t-line t-spacer"></div>
          <div class="t-line"><span class="t-key">empresa</span> <span class="t-val">Buk</span></div>
          <div class="t-line"><span class="t-key">cargo </span> <span class="t-val">Fullstack Dev</span></div>
          <div class="t-line"><span class="t-key">etapas </span> <span class="t-num">3</span></div>
          <div class="t-line"><span class="t-key">resultado</span> <span class="t-ok">Oferta ✓</span></div>
          <div class="t-line"><span class="t-key">respuesta</span> <span class="t-val">1–2 semanas</span></div>
          <div class="t-line t-spacer"></div>
          <div class="t-line t-cursor"><span class="t-prompt">$</span> <span class="t-blink">▋</span></div>
        </div>
      </div>
    </section>


    <!-- Features -->
    <section class="features">
      <article class="feature-card">
        <div class="feature-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h3 class="feature-title">Zero tracking</h3>
        <p class="feature-body">
          Sin cookies de sesión, sin fingerprinting, sin logging de IPs.
          Ni siquiera sabemos quién eres.
        </p>
      </article>

      <article class="feature-card">
        <div class="feature-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
          </svg>
        </div>
        <h3 class="feature-title">Datos sin filtros</h3>
        <p class="feature-body">
          Lo que reporta la comunidad, publicado tal cual. Tiempos reales,
          etapas reales, resultados reales.
        </p>
      </article>

      <article class="feature-card">
        <div class="feature-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <h3 class="feature-title">Community-driven</h3>
        <p class="feature-body">
          Cada submission suma. Entre todos construimos la base de datos
          que el mercado laboral tech chileno necesita.
        </p>
      </article>
    </section>

    <!-- Bottom CTA -->
    <section class="cta-block">
      <div class="cta-content">
        <div class="cta-mono">// ¿tuviste una entrevista?</div>
        <h2 class="cta-title">Comparte tu experiencia</h2>
        <p class="cta-body">2 minutos. Sin cuenta. Sin datos personales. La comunidad te lo agradece.</p>
        <NuxtLink to="/enviar" class="btn-primary">
          Enviar feedback
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </NuxtLink>
      </div>
    </section>

  </div>
</template>

<style scoped>
.home-page {
  max-width: 76rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* ─── Hero ─── */
.hero {
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  padding: 4rem 0 3rem;
  align-items: center;
}

@media (min-width: 900px) {
  .hero {
    grid-template-columns: 1fr 1fr;
    padding: 5.5rem 0 4rem;
  }
}

.hero-inner {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.hero-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-muted);
  letter-spacing: 0.02em;
  margin-bottom: 1.5rem;
  border: 1px solid var(--color-border);
  padding: 0.375rem 0.75rem;
  border-radius: 100px;
  width: fit-content;
}

.tag-dot {
  width: 0.4375rem;
  height: 0.4375rem;
  background-color: var(--color-accent);
  border-radius: 50%;
  flex-shrink: 0;
  animation: blink-dot 2.4s ease-in-out infinite;
}

@keyframes blink-dot {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.3;
  }
}

.hero-headline {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 6vw, 4.75rem);
  font-weight: 800;
  line-height: 1.0;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0 0 1.5rem;
}

.hero-body {
  font-size: 1rem;
  line-height: 1.75;
  color: var(--color-text-muted);
  margin: 0 0 2.5rem;
  max-width: 34rem;
  font-weight: 300;
}

.hero-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--color-bg);
  background-color: var(--color-accent);
  text-decoration: none;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  letter-spacing: -0.01em;
  transition: background-color 0.12s ease;
}

.btn-primary:hover {
  background-color: var(--color-accent-hover);
}

.btn-ghost {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  font-size: 0.9375rem;
  font-weight: 400;
  color: var(--color-text-muted);
  background-color: transparent;
  text-decoration: none;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  transition: color 0.12s ease, border-color 0.12s ease, background-color 0.12s ease;
}

.btn-ghost:hover {
  color: var(--color-text);
  border-color: var(--color-text-muted);
  background-color: var(--color-surface-alt);
}

/* ─── Terminal ─── */
.hero-terminal {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  overflow: hidden;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  box-shadow: 0 24px 48px rgba(0, 0, 0, 0.5);
}

.terminal-header {
  background-color: var(--color-surface-alt);
  border-bottom: 1px solid var(--color-border);
  padding: 0.625rem 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.t-dot {
  width: 0.6875rem;
  height: 0.6875rem;
  border-radius: 50%;
}

.t-dot--red {
  background-color: #ff5f57;
}

.t-dot--yellow {
  background-color: #ffbd2e;
}

.t-dot--green {
  background-color: #28c941;
}

.t-title {
  margin-left: auto;
  margin-right: auto;
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  letter-spacing: 0.02em;
}

.terminal-body {
  padding: 1.25rem 1.25rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.t-line {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  line-height: 1.6;
}

.t-spacer {
  height: 0.5rem;
}

.t-prompt {
  color: var(--color-accent);
  font-weight: 500;
}

.t-cmd {
  color: var(--color-text);
}

.t-flag {
  color: var(--color-text-muted);
}

.t-str {
  color: #86efac;
}

.t-key {
  color: var(--color-text-subtle);
  min-width: 5.5rem;
  font-size: 0.75rem;
}

.t-val {
  color: var(--color-text);
}

.t-num {
  color: #818cf8;
}

.t-ok {
  color: #34d399;
  font-weight: 500;
}

.t-blink {
  animation: terminal-blink 1s step-end infinite;
  color: var(--color-accent);
}

@keyframes terminal-blink {

  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

/* ─── Features ─── */
.features {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1px;
  background-color: var(--color-border);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  overflow: hidden;
  margin-bottom: 3rem;
}

@media (min-width: 640px) {
  .features {
    grid-template-columns: repeat(3, 1fr);
  }
}

.feature-card {
  background-color: var(--color-surface);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.875rem;
  transition: background-color 0.15s ease;
}

.feature-card:hover {
  background-color: var(--color-surface-alt);
}

.feature-icon {
  width: 2.25rem;
  height: 2.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  background-color: var(--color-accent-dim);
  color: var(--color-accent);
  flex-shrink: 0;
}

.feature-title {
  font-family: var(--font-display);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.feature-body {
  font-size: 0.9rem;
  line-height: 1.65;
  color: var(--color-text-muted);
  margin: 0;
  font-weight: 300;
}

/* ─── CTA block ─── */
.cta-block {
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  background-color: var(--color-surface);
  margin-bottom: 2rem;
  overflow: hidden;
  position: relative;
}

.cta-block::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 50% 0%, rgba(129, 140, 248, 0.06) 0%, transparent 60%);
  pointer-events: none;
}

.cta-content {
  padding: 3rem 2.5rem;
  position: relative;
}

.cta-mono {
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
  margin-bottom: 0.875rem;
}

.cta-title {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: var(--color-text);
  margin: 0 0 0.75rem;
}

.cta-body {
  font-size: 0.9375rem;
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  font-weight: 300;
}
</style>
