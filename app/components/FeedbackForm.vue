<script setup lang="ts">
import {
  INDUSTRY_OPTIONS,
  RESPONSE_TIME_OPTIONS,
  LAST_STAGE_OPTIONS,
  RESULT_OPTIONS,
  MONTHS,
  MAX_COMMENT_LENGTH,
  MAX_COMPANY_NAME_LENGTH,
  MAX_POSITION_LENGTH,
  feedbackSchema,
} from "~~/shared/schemas/feedback";

const config = useRuntimeConfig();

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 3 }, (_, i) => currentYear - i);

const form = reactive({
  companyName: "",
  industry: "",
  position: "",
  applicationMonth: "",
  applicationYear: currentYear,
  responseTime: "",
  stagesReached: 0,
  lastStage: "",
  result: "",
  comment: "",
});

const isSubmitting = ref(false);
const resultModal = ref<{ type: "success" | "error"; message: string } | null>(null);
const honeypot = ref("");
const formStartedAt = ref(Date.now());
const turnstileContainer = ref<HTMLElement | null>(null);
const turnstileToken = ref("");
let turnstileWidgetId: string | undefined;

function loadTurnstileScript(): Promise<void> {
  if (window.turnstile) {
    return Promise.resolve();
  }
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Turnstile failed to load"));
    document.head.appendChild(script);
  });
}

function renderTurnstile() {
  if (!turnstileContainer.value || !window.turnstile || !config.public.turnstileSiteKey) return;
  turnstileWidgetId = window.turnstile.render(turnstileContainer.value, {
    sitekey: config.public.turnstileSiteKey,
    callback: (token: string) => { turnstileToken.value = token; },
    "expired-callback": () => { turnstileToken.value = ""; },
    "error-callback": () => { turnstileToken.value = ""; },
  });
}

function resetTurnstile() {
  if (window.turnstile && turnstileWidgetId) window.turnstile.reset(turnstileWidgetId);
  turnstileToken.value = "";
}

onMounted(async () => {
  if (!config.public.turnstileSiteKey) return;
  try {
    await loadTurnstileScript();
    renderTurnstile();
  } catch {
    resultModal.value = {
      type: "error",
      message: "No pudimos cargar la verificación de seguridad. Recarga la página.",
    };
  }
});

function showResult(type: "success" | "error", message: string) {
  resultModal.value = { type, message };
}

function closeResultModal() {
  const wasSuccess = resultModal.value?.type === "success";
  resultModal.value = null;
  if (wasSuccess) navigateTo("/");
}

const isFormValid = computed(() => feedbackSchema.safeParse(buildPayload()).success);
const canSubmit = computed(() => isFormValid.value && !!turnstileToken.value && !isSubmitting.value);

const fieldInput =
  "block w-full appearance-none rounded-md border border-border bg-bg px-3.5 py-2.5 font-sans text-15 text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.15)]";
const fieldSelect = `${fieldInput} cursor-pointer bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2344446a' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")] bg-auto bg-position-[right_0.875rem_center] bg-no-repeat pr-10`;

function buildPayload() {
  return {
    p_company_name: form.companyName,
    p_industry: form.industry,
    p_position: form.position,
    p_application_month: `${form.applicationMonth} ${form.applicationYear}`,
    p_response_time: form.responseTime,
    p_stages_reached: form.stagesReached,
    p_last_stage: form.lastStage || null,
    p_result: form.result,
    p_comment: form.comment || null,
  };
}

async function handleSubmit() {
  if (!canSubmit.value) return;
  isSubmitting.value = true;
  resultModal.value = null;

  try {
    await $fetch("/api/submit-feedback", {
      method: "POST",
      body: {
        ...buildPayload(),
        turnstileToken: turnstileToken.value,
        _hp: honeypot.value,
        _formElapsedMs: Date.now() - formStartedAt.value,
      },
    });
  } catch (err: any) {
    isSubmitting.value = false;
    resetTurnstile();
    showResult("error", err?.data?.message || "Error al enviar. Intenta de nuevo.");
    return;
  }

  isSubmitting.value = false;
  showResult("success", "Feedback enviado. ¡Gracias por contribuir!");
  formStartedAt.value = Date.now();
  resetTurnstile();
  Object.assign(form, {
    companyName: "", industry: "", position: "",
    applicationMonth: "", applicationYear: currentYear,
    responseTime: "", stagesReached: 0, lastStage: "", result: "", comment: "",
  });
}
</script>

<template>
  <form class="flex flex-col" @submit.prevent="handleSubmit">
    <SubmitResultModal
      v-if="resultModal"
      :type="resultModal.type"
      :message="resultModal.message"
      @close="closeResultModal"
    />

    <!-- Section: Empresa -->
    <fieldset class="m-0 mb-4 border-0 border-b border-border-subtle py-6 last:border-b-0">
      <legend class="mb-1 flex w-full items-center gap-2.5 p-0 font-mono text-13 font-medium tracking-tight text-text">
        <span class="font-mono text-11 tracking-wide text-accent">01</span>
        Empresa
      </legend>

      <div class="relative mb-4 last:mb-0">
        <label for="company" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
          empresa <span class="text-accent">*</span>
        </label>
        <CompanySearch v-model="form.companyName" input-id="company" :show-label="false" required
          :maxlength="MAX_COMPANY_NAME_LENGTH" placeholder="Nombre de la empresa" />
      </div>

      <div class="relative mb-4 last:mb-0">
        <label for="industry" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
          rubro <span class="text-accent">*</span>
        </label>
        <select id="industry" v-model="form.industry" required :class="fieldSelect">
          <option value="" disabled>Selecciona un rubro</option>
          <option v-for="opt in INDUSTRY_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </fieldset>

    <!-- Section: Postulación -->
    <fieldset class="m-0 mb-4 border-0 border-b border-border-subtle py-6 last:border-b-0">
      <legend class="flex w-full items-center gap-2.5 p-0 font-mono text-13 font-medium tracking-tight text-text">
        <span class="font-mono text-11 tracking-wide text-accent">02</span>
        Postulación
      </legend>

      <div class="relative mb-4 last:mb-0">
        <label for="position" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
          cargo <span class="text-accent">*</span>
        </label>
        <input id="position" v-model="form.position" type="text" required
          :maxlength="MAX_POSITION_LENGTH"
          placeholder="Backend Developer, Analista de datos..." :class="fieldInput" />
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3.5">
        <div class="relative">
          <label for="app-month" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
            mes <span class="text-accent">*</span>
          </label>
          <select id="app-month" v-model="form.applicationMonth" required :class="fieldSelect">
            <option value="" disabled>Mes</option>
            <option v-for="m in MONTHS" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="relative">
          <label for="app-year" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
            año <span class="text-accent">*</span>
          </label>
          <select id="app-year" v-model="form.applicationYear" required :class="fieldSelect">
            <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </fieldset>

    <!-- Section: Proceso -->
    <fieldset class="m-0 mb-4 border-0 border-b border-border-subtle py-6 last:border-b-0">
      <legend class="flex w-full items-center gap-2.5 p-0 font-mono text-13 font-medium tracking-tight text-text">
        <span class="font-mono text-11 tracking-wide text-accent">03</span>
        Proceso
      </legend>

      <div class="relative mb-4 last:mb-0">
        <label for="response-time" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
          ¿respondieron? <span class="text-accent">*</span>
        </label>
        <select id="response-time" v-model="form.responseTime" required :class="fieldSelect">
          <option value="" disabled>Selecciona una opción</option>
          <option v-for="opt in RESPONSE_TIME_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <div class="mb-4 grid grid-cols-2 gap-3.5">
        <div class="relative">
          <label for="stages" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
            etapas alcanzadas
          </label>
          <input id="stages" v-model.number="form.stagesReached" type="number" min="0" max="20"
            :class="`${fieldInput} max-w-28 font-mono`" />
        </div>
        <div class="relative">
          <label for="last-stage" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
            última etapa
          </label>
          <select id="last-stage" v-model="form.lastStage" :class="fieldSelect">
            <option value="">No aplica</option>
            <option v-for="opt in LAST_STAGE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>

      <div class="relative mb-4 last:mb-0">
        <label for="result" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
          resultado <span class="text-accent">*</span>
        </label>
        <select id="result" v-model="form.result" required :class="fieldSelect">
          <option value="" disabled>Selecciona un resultado</option>
          <option v-for="opt in RESULT_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </fieldset>

    <!-- Section: Comentario -->
    <fieldset class="m-0 mb-2 border-0 border-b border-border-subtle py-6 last:border-b-0">
      <legend class="flex w-full items-center gap-2.5 p-0 font-mono text-13 font-medium tracking-tight text-text">
        <span class="font-mono text-11 tracking-wide text-accent">04</span>
        Comentario
        <span class="text-xs font-normal text-text-subtle">(opcional)</span>
      </legend>

      <div class="relative mb-4 last:mb-0">
        <label for="comment" class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase">
          comentario
        </label>
        <textarea id="comment" v-model="form.comment" rows="3" :maxlength="MAX_COMMENT_LENGTH"
          placeholder="Describe brevemente tu experiencia..."
          :class="`${fieldInput} min-h-22 resize-y text-14 leading-relaxed`" />
        <div class="mt-1.5 text-right font-mono text-11 text-text-subtle">
          <span :class="{ 'text-yield': form.comment.length > MAX_COMMENT_LENGTH - 40 }">
            {{ form.comment.length }}/{{ MAX_COMMENT_LENGTH }}
          </span>
        </div>
      </div>
    </fieldset>

    <!-- Honeypot -->
    <div class="absolute left-[-9999px] opacity-0" aria-hidden="true">
      <input id="website" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <!-- Turnstile -->
    <div ref="turnstileContainer" class="flex justify-center py-5" />

    <button type="submit" :disabled="!canSubmit"
      class="submit-btn flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-0 bg-accent px-6 py-3 font-sans text-15 font-medium tracking-tight text-bg transition-colors duration-150 hover:enabled:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-35">
      <span v-if="isSubmitting" class="size-3.5 animate-spin rounded-full border-2 border-bg/30 border-t-bg"
        aria-hidden="true" />
      <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
      </svg>
      {{ isSubmitting ? "Enviando..." : "Enviar feedback" }}
    </button>
  </form>
</template>
