<script setup lang="ts">
useSeoMeta({
  title: "Política de privacidad",
  description:
    "Cómo tratamos los datos en postulaciones-tracker, incluido el uso de Cloudflare Turnstile.",
});
</script>

<template>
  <div class="mx-auto max-w-184 px-6 pt-10 pb-24">
    <div class="mb-10">
      <div class="mb-5 flex items-center gap-1.5 font-mono text-xs">
        <NuxtLink to="/" class="text-text-muted no-underline transition-colors duration-150 hover:text-text">
          inicio
        </NuxtLink>
        <span class="text-text-subtle">/</span>
        <span class="text-accent">privacidad</span>
      </div>
      <h1 class="m-0 mb-3 font-display text-32 font-extrabold tracking-tight text-text">
        Política de privacidad
      </h1>
      <p class="m-0 text-15 leading-relaxed font-light text-text-muted">
        Última actualización: mayo de 2026. Este sitio opera en Chile y está pensado para
        compartir experiencias de postulación de forma anónima.
      </p>
    </div>

    <article
      class="flex flex-col gap-8 [&_a]:text-accent [&_a]:underline [&_a]:underline-offset-2 [&_a]:transition-colors [&_a]:duration-150 [&_a:hover]:text-accent-hover [&_h2]:m-0 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-text [&_li]:mb-2 [&_li]:text-15 [&_li]:leading-relaxed [&_li]:font-light [&_li]:text-text-muted [&_p]:m-0 [&_p]:mb-3 [&_p]:text-15 [&_p]:leading-relaxed [&_p]:font-light [&_p]:text-text-muted [&_p:last-child]:mb-0 [&_ul]:m-0 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul:last-child]:mb-0">
      <section>
        <h2>1. Responsable</h2>
        <p>
          <strong>postulaciones-tracker</strong> es un proyecto comunitario sin registro de
          usuarios. Si tienes dudas sobre esta política, puedes contactarnos a través de los
          canales publicados en el
          <a href="https://github.com/MiguelHigueraDev/postulaciones-tracker" target="_blank"
            rel="noopener noreferrer">repositorio del proyecto en GitHub</a>.
        </p>
      </section>

      <section>
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

      <section>
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

      <section>
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

      <section>
        <h2>5. Finalidad y base de tratamiento</h2>
        <p>
          Usamos los datos del formulario para publicar estadísticas agregadas y experiencias
          anónimas que ayuden a otras personas a entender procesos de selección en Chile. El
          tratamiento de señales técnicas mediante Turnstile tiene como finalidad proteger el
          sitio frente a abuso automatizado.
        </p>
      </section>

      <section>
        <h2>6. Conservación</h2>
        <p>
          Los registros de feedback se conservan mientras el proyecto los mantenga publicados en
          la base de datos. Los contadores de rate limit en memoria se eliminan al reiniciar el
          servidor o al expirar la ventana de un minuto.
        </p>
      </section>

      <section>
        <h2>7. Tus derechos</h2>
        <p>
          Dado que no vinculamos envíos a identidades, no podemos localizar “tu” registro sin
          información adicional que nos proporciones. Si crees que un envío incluye datos
          personales indebidos o deseas ejercer derechos sobre datos procesados por Turnstile en
          nombre de este sitio, escríbenos por el
          <a href="https://github.com/MiguelHigueraDev/postulaciones-tracker" target="_blank"
            rel="noopener noreferrer">repositorio en GitHub</a>; para el tratamiento que
          Cloudflare realiza como responsable independiente (mejora del servicio), contacta a
          Cloudflare según el addendum siguiente.
        </p>
      </section>

      <section>
        <h2>8. Enlaces externos</h2>
        <p>
          Las páginas de terceros (Cloudflare, Supabase) tienen sus propias políticas. No somos
          responsables de su contenido. El código fuente de este sitio está en
          <a href="https://github.com/MiguelHigueraDev/postulaciones-tracker" target="_blank"
            rel="noopener noreferrer">GitHub</a>.
        </p>
      </section>

      <section class="mt-4">
        <div class="mb-5">
          <h2>9. Cloudflare Turnstile — Privacy Addendum</h2>
          <p class="font-mono text-xs leading-relaxed text-text-subtle">
            El texto siguiente reproduce el addendum publicado por Cloudflare (en inglés, idioma
            oficial del documento). Fuente:
            <a href="https://www.cloudflare.com/en-gb/turnstile-privacy-policy/" target="_blank"
              rel="noopener noreferrer">Turnstile Privacy Addendum</a>
            (última actualización indicada por Cloudflare: 18 de junio de 2025).
          </p>
        </div>

        <div
          class="rounded-card border border-border bg-surface px-6 py-7 [&_h3]:m-0 [&_h3]:mb-1 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-text [&_h4]:mt-6 [&_h4]:mb-2 [&_h4]:font-mono [&_h4]:text-11 [&_h4]:font-medium [&_h4]:tracking-wide [&_h4]:text-accent [&_h4]:uppercase [&_h4:first-of-type]:mt-0 [&_li]:text-sm [&_p]:text-sm">
          <h3>Turnstile Privacy Addendum</h3>
          <p class="!mb-6 text-13 text-text-subtle">
            <em>Last updated: JUNE 18, 2025</em>
          </p>

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
