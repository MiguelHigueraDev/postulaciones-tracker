<script setup lang="ts">
useSeoMeta({
  title: "Política de privacidad — postulaciones-tracker",
  description:
    "Cómo tratamos los datos en postulaciones-tracker, incluido el uso de Cloudflare Turnstile.",
});
</script>

<template>
  <div class="page-legal">
    <div class="page-header">
      <div class="page-breadcrumb">
        <NuxtLink to="/" class="breadcrumb-link">inicio</NuxtLink>
        <span class="breadcrumb-sep">/</span>
        <span class="breadcrumb-current">privacidad</span>
      </div>
      <h1 class="page-title">Política de privacidad</h1>
      <p class="page-lead">
        Última actualización: mayo de 2026. Este sitio opera en Chile y está pensado para
        compartir experiencias de postulación de forma anónima.
      </p>
    </div>

    <article class="legal-content">
      <section class="legal-section">
        <h2>1. Responsable</h2>
        <p>
          <strong>postulaciones-tracker</strong> es un proyecto comunitario sin registro de
          usuarios. Si tienes dudas sobre esta política, puedes contactarnos a través de los
          canales publicados en el repositorio del proyecto.
        </p>
      </section>

      <section class="legal-section">
        <h2>2. Qué recopilamos</h2>
        <p>
          Al enviar feedback solo pedimos información sobre tu experiencia de postulación:
          empresa, rubro, cargo, mes de postulación, tiempos de respuesta, etapas del proceso,
          resultado y un comentario opcional. No pedimos nombre, correo, teléfono ni otros
          datos que te identifiquen directamente.
        </p>
        <p>
          Los envíos se almacenan en una base de datos gestionada por
          <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Supabase</a>
          únicamente con los campos del formulario. No asociamos cada envío a una cuenta, dirección IP, ni a un
          perfil de usuario.
        </p>
      </section>

      <section class="legal-section">
        <h2>3. Datos técnicos y anti-abuso</h2>
        <p>
          Para limitar envíos automatizados y spam aplicamos medidas en el servidor:
        </p>
        <ul>
          <li>
            <strong>Limitación por IP:</strong> contamos solicitudes por dirección IP en memoria
            durante aproximadamente un minuto (máximo 5 envíos por ventana). Esa IP no se guarda
            en la base de datos ni se muestra en los resultados públicos.
          </li>
          <li>
            <strong>Cloudflare Turnstile:</strong> en la página de envío usamos Turnstile para
            distinguir uso humano de bots. Al verificar el envío, la IP puede transmitirse a
            Cloudflare junto con el token del widget, según su documentación. No almacenamos el
            token de Turnstile después de validar el envío.
          </li>
          <li>
            <strong>Campo trampa (honeypot):</strong> un campo oculto que los bots suelen
            rellenar; si se completa, rechazamos el envío sin guardarlo.
          </li>
        </ul>
      </section>

      <section class="legal-section">
        <h2>4. Cookies y almacenamiento local</h2>
        <p>
          No usamos cookies de sesión ni de analítica propias. Turnstile, operado por Cloudflare,
          puede establecer cookies o tecnologías equivalentes estrictamente necesarias para la
          detección de bots; el detalle figura en el addendum de privacidad de Turnstile más
          abajo y en la
          <a href="https://www.cloudflare.com/en-gb/cookie-policy/" target="_blank" rel="noopener noreferrer">política
            de cookies de Cloudflare</a>.
        </p>
      </section>

      <section class="legal-section">
        <h2>5. Finalidad y base de tratamiento</h2>
        <p>
          Usamos los datos del formulario para publicar estadísticas agregadas y experiencias
          anónimas que ayuden a otras personas a entender procesos de selección en Chile. El
          tratamiento de señales técnicas mediante Turnstile tiene como finalidad proteger el
          sitio frente a abuso automatizado.
        </p>
      </section>

      <section class="legal-section">
        <h2>6. Conservación</h2>
        <p>
          Los registros de feedback se conservan mientras el proyecto los mantenga publicados en
          la base de datos. Los contadores de rate limit en memoria se eliminan al reiniciar el
          servidor o al expirar la ventana de un minuto.
        </p>
      </section>

      <section class="legal-section">
        <h2>7. Tus derechos</h2>
        <p>
          Dado que no vinculamos envíos a identidades, no podemos localizar “tu” registro sin
          información adicional que nos proporciones. Si crees que un envío incluye datos
          personales indebidos o deseas ejercer derechos sobre datos procesados por Turnstile en
          nombre de este sitio, escríbenos por los canales del proyecto; para el tratamiento que
          Cloudflare realiza como responsable independiente (mejora del servicio), contacta a
          Cloudflare según el addendum siguiente.
        </p>
      </section>

      <section class="legal-section">
        <h2>8. Enlaces externos</h2>
        <p>
          Las páginas de terceros (Cloudflare, Supabase) tienen sus propias políticas. No somos
          responsables de su contenido.
        </p>
      </section>

      <section class="legal-section legal-section--embed">
        <div class="embed-header">
          <h2>9. Cloudflare Turnstile — Privacy Addendum</h2>
          <p class="embed-note">
            El texto siguiente reproduce el addendum publicado por Cloudflare (en inglés, idioma
            oficial del documento). Fuente:
            <a href="https://www.cloudflare.com/en-gb/turnstile-privacy-policy/" target="_blank"
              rel="noopener noreferrer">Turnstile Privacy Addendum</a>
            (última actualización indicada por Cloudflare: 18 de junio de 2025).
          </p>
        </div>

        <div class="turnstile-addendum">
          <h3>Turnstile Privacy Addendum</h3>
          <p class="addendum-meta"><em>Last updated: JUNE 18, 2025</em></p>

          <h4>1. INTRODUCTION</h4>
          <p>
            Turnstile, developed by Cloudflare, Inc. (Cloudflare), is a pro-privacy website
            security tool that processes minimal Signals (as defined below) solely to protect web
            properties against malicious activity by distinguishing human users from bots and
            blocking bot traffic.
          </p>
          <p>
            Cloudflare does not control whether a website chooses to use Turnstile; instead, we
            make Turnstile available to any website that is looking for a way to detect and block
            bot traffic.
          </p>

          <h4>2. SCOPE OF THIS ADDENDUM</h4>
          <p>
            This Turnstile Addendum is supplemental to Cloudflare's main
            <a href="https://www.cloudflare.com/en-gb/privacypolicy/" target="_blank" rel="noopener noreferrer">Privacy
              Policy</a>. It provides additional information specific to your use and
            interaction with Turnstile. This Addendum also applies to the personal data processed
            using Cloudflare's Challenge Platform, and any reference to "Turnstile" in this
            addendum applies equally to the Challenge Platform.
          </p>
          <p>
            The Cloudflare Privacy Policy continues to apply to your use and interaction with
            Turnstile, except where this Turnstile Addendum provides more specific information.
            In those cases, the more specific information will apply instead.
          </p>

          <h4>3. INFORMATION WE COLLECT</h4>
          <p>
            Cloudflare Turnstile processes a variety of client-side signals ("Signals") such as
            client IP address, TLS Fingerprint, User-Agent Header and Sitekey and associated
            origin. Cloudflare does not have the ability to directly identify any individuals
            from any of the Signals Turnstile collects, including IP addresses.
          </p>

          <h4>4. HOW WE USE INFORMATION WE COLLECT</h4>
          <p><em>(i) Bot detection and blocking</em></p>
          <p>
            Turnstile is a tool to protect web properties by distinguishing human users from
            bots and blocking any detected bot traffic that could otherwise harm the safety and
            security of that property.
          </p>
          <p>
            It does so by evaluating the Signals listed above specific to both the website
            visitor and the website visited. The purpose of collecting these Signals is not to
            identify, profile or target any individuals but solely to detect and block bots. The
            Signals collected by Turnstile are strictly necessary for this purpose (i.e. detecting
            and blocking bots to enable visitors to enjoy a safe and secure experience when
            visiting websites that have implemented Turnstile).
          </p>
          <p>
            Cloudflare is a data processor of Signals that we process to provide the Turnstile
            service to our customers, that is, securing our customers' websites. This means that
            we process Signals for this purpose on behalf of, and pursuant to instructions issued
            by, our website operator customers (who are the data controllers of any data processed
            for this purpose). If you have questions, or wish to exercise any data protection
            rights, regarding Cloudflare's processing of Turnstile data to provide our service,
            please contact the relevant website operator.
          </p>
          <p><em>(ii) Improving Turnstile's bot detection capabilities</em></p>
          <p>
            Cloudflare also processes the Signals described in this Privacy Notice to improve
            Turnstile. This is necessary to refine and improve our bot detection algorithms in
            order to respond to evolving bot threats, and to maintain the security of the web
            properties that website visitors choose to visit.
          </p>
          <p>
            Cloudflare is a data controller of Signals that we process to improve Turnstile's bot
            detection capabilities. This Turnstile Privacy Notice (in conjunction with Cloudflare's
            main
            <a href="https://www.cloudflare.com/en-gb/privacypolicy/" target="_blank" rel="noopener noreferrer">Privacy
              Policy</a>) governs our processing of Signals for this purpose.
          </p>

          <h4>5. NOTICE TO EU AND UK RESIDENTS</h4>
          <p>To the extent that the data described in the Turnstile Privacy Notice qualifies as personal data, then:</p>
          <ul>
            <li>
              When processing this personal data as a processor to protect our customers' websites,
              our customers, as controllers, determine the lawful basis of this processing, and we
              process this data under their instruction and on their behalf; and
            </li>
            <li>
              When processing this personal data as a controller, we rely on our legitimate interests
              in improving the effectiveness of Turnstile's bot detection capabilities to process
              this Turnstile data.
            </li>
          </ul>

          <h4>6. COOKIES</h4>
          <p>
            The Signals collected by Turnstile are strictly necessary for the purpose of detecting
            and blocking bots to enable visitors to enjoy a safe and secure experience when
            visiting websites that have implemented Turnstile.
          </p>
          <p>
            For more information about the cookies used by Cloudflare, please check our
            <a href="https://www.cloudflare.com/en-gb/cookie-policy/" target="_blank" rel="noopener noreferrer">Cookie
              Policy</a>
            and our
            <a href="https://developers.cloudflare.com/turnstile/" target="_blank" rel="noopener noreferrer">Turnstile
              Developer Docs</a>.
          </p>

          <h4>CONTACT FOR PRIVACY CONCERNS</h4>
          <p>
            If you have questions or concerns about this Turnstile Privacy Notice or your
            personal data processed through Turnstile, please contact Cloudflare's Data Protection
            Officer at
            <a href="mailto:dpo@cloudflare.com">dpo@cloudflare.com</a>.
          </p>
        </div>
      </section>
    </article>
  </div>
</template>

<style scoped>
.page-legal {
  max-width: 46rem;
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
  margin: 0 0 0.75rem;
}

.page-lead {
  font-size: 0.9375rem;
  line-height: 1.65;
  color: var(--color-text-muted);
  font-weight: 300;
  margin: 0;
}

.legal-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.legal-section h2 {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--color-text);
  margin: 0 0 0.75rem;
}

.legal-section p,
.legal-section li {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-text-muted);
  font-weight: 300;
  margin: 0 0 0.75rem;
}

.legal-section p:last-child,
.legal-section ul:last-child {
  margin-bottom: 0;
}

.legal-section ul {
  margin: 0 0 0.75rem;
  padding-left: 1.25rem;
}

.legal-section li {
  margin-bottom: 0.5rem;
}

.legal-section a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: color 0.12s ease;
}

.legal-section a:hover {
  color: var(--color-accent-hover);
}

.legal-section--embed {
  margin-top: 1rem;
}

.embed-header {
  margin-bottom: 1.25rem;
}

.embed-note {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  line-height: 1.6;
  color: var(--color-text-subtle);
}

.turnstile-addendum {
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.625rem;
  padding: 1.75rem 1.5rem;
}

.turnstile-addendum h3 {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 0.25rem;
}

.addendum-meta {
  font-size: 0.8125rem;
  color: var(--color-text-subtle);
  margin-bottom: 1.5rem !important;
}

.turnstile-addendum h4 {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-accent);
  margin: 1.5rem 0 0.5rem;
}

.turnstile-addendum h4:first-of-type {
  margin-top: 0;
}

.turnstile-addendum p,
.turnstile-addendum li {
  font-size: 0.875rem;
}

.turnstile-addendum ul {
  padding-left: 1.25rem;
  margin: 0 0 0.75rem;
}
</style>
