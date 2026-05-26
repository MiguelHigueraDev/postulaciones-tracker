<script setup lang="ts">
import {
  INDUSTRY_OPTIONS,
  RESPONSE_TIME_OPTIONS,
  LAST_STAGE_OPTIONS,
  RESULT_OPTIONS,
  MONTHS,
  feedbackSchema,
} from "~~/shared/schemas/feedback";

const supabase = useSupabaseClient();
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

const companySuggestions = ref<string[]>([]);
const showSuggestions = ref(false);
const isSubmitting = ref(false);
const submitSuccess = ref(false);
const submitError = ref("");
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
    submitError.value = "No pudimos cargar la verificación de seguridad. Recarga la página.";
  }
});

async function searchCompanies(query: string) {
  if (query.length < 2) { companySuggestions.value = []; return; }
  const { data } = await supabase
    .from("companies")
    .select("name")
    .ilike("name_normalized", `%${query.toLowerCase()}%`)
    .limit(5);
  companySuggestions.value = data?.map((c) => c.name) ?? [];
}

function selectCompany(name: string) {
  form.companyName = name;
  showSuggestions.value = false;
}

function onCompanyInput() {
  showSuggestions.value = true;
  searchCompanies(form.companyName);
}

function onCompanyBlur() {
  setTimeout(() => { showSuggestions.value = false; }, 200);
}

const isFormValid = computed(() => feedbackSchema.safeParse(buildPayload()).success);
const canSubmit = computed(() => isFormValid.value && !!turnstileToken.value && !isSubmitting.value);

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
  submitError.value = "";
  submitSuccess.value = false;

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
    submitError.value = err?.data?.message || "Error al enviar. Intenta de nuevo.";
    return;
  }

  isSubmitting.value = false;
  submitSuccess.value = true;
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
  <form @submit.prevent="handleSubmit" class="feedback-form">

    <div v-if="submitSuccess" class="alert alert--success" role="alert">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg>
      Feedback enviado. ¡Gracias por contribuir!
    </div>

    <div v-if="submitError" class="alert alert--error" role="alert">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      {{ submitError }}
    </div>

    <!-- Section: Empresa -->
    <fieldset class="form-group">
      <legend class="group-legend">
        <span class="legend-prefix">01</span> Empresa
      </legend>

      <div class="field relative">
        <label for="company" class="field-label">empresa <span class="req">*</span></label>
        <input
          id="company"
          v-model="form.companyName"
          type="text"
          required
          placeholder="Nombre de la empresa"
          class="field-input"
          autocomplete="off"
          @input="onCompanyInput"
          @focus="onCompanyInput"
          @blur="onCompanyBlur"
        />
        <ul v-if="showSuggestions && companySuggestions.length > 0" class="suggestions">
          <li
            v-for="name in companySuggestions"
            :key="name"
            class="suggestion-item"
            @mousedown.prevent="selectCompany(name)"
          >{{ name }}</li>
        </ul>
      </div>

      <div class="field">
        <label for="industry" class="field-label">rubro <span class="req">*</span></label>
        <select id="industry" v-model="form.industry" required class="field-input field-select">
          <option value="" disabled>Selecciona un rubro</option>
          <option v-for="opt in INDUSTRY_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </fieldset>

    <!-- Section: Postulación -->
    <fieldset class="form-group">
      <legend class="group-legend">
        <span class="legend-prefix">02</span> Postulación
      </legend>

      <div class="field">
        <label for="position" class="field-label">cargo <span class="req">*</span></label>
        <input
          id="position"
          v-model="form.position"
          type="text"
          required
          placeholder="Backend Developer, Analista de datos..."
          class="field-input"
        />
      </div>

      <div class="field-row">
        <div class="field">
          <label for="app-month" class="field-label">mes <span class="req">*</span></label>
          <select id="app-month" v-model="form.applicationMonth" required class="field-input field-select">
            <option value="" disabled>Mes</option>
            <option v-for="m in MONTHS" :key="m" :value="m">{{ m }}</option>
          </select>
        </div>
        <div class="field">
          <label for="app-year" class="field-label">año <span class="req">*</span></label>
          <select id="app-year" v-model="form.applicationYear" required class="field-input field-select">
            <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>
      </div>
    </fieldset>

    <!-- Section: Proceso -->
    <fieldset class="form-group">
      <legend class="group-legend">
        <span class="legend-prefix">03</span> Proceso
      </legend>

      <div class="field">
        <label for="response-time" class="field-label">¿respondieron? <span class="req">*</span></label>
        <select id="response-time" v-model="form.responseTime" required class="field-input field-select">
          <option value="" disabled>Selecciona una opción</option>
          <option v-for="opt in RESPONSE_TIME_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>

      <div class="field-row">
        <div class="field">
          <label for="stages" class="field-label">etapas alcanzadas</label>
          <input
            id="stages"
            v-model.number="form.stagesReached"
            type="number"
            min="0"
            max="20"
            class="field-input field-num"
          />
        </div>
        <div class="field">
          <label for="last-stage" class="field-label">última etapa</label>
          <select id="last-stage" v-model="form.lastStage" class="field-input field-select">
            <option value="">No aplica</option>
            <option v-for="opt in LAST_STAGE_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
          </select>
        </div>
      </div>

      <div class="field">
        <label for="result" class="field-label">resultado <span class="req">*</span></label>
        <select id="result" v-model="form.result" required class="field-input field-select">
          <option value="" disabled>Selecciona un resultado</option>
          <option v-for="opt in RESULT_OPTIONS" :key="opt" :value="opt">{{ opt }}</option>
        </select>
      </div>
    </fieldset>

    <!-- Section: Comentario -->
    <fieldset class="form-group">
      <legend class="group-legend">
        <span class="legend-prefix">04</span> Comentario <span class="legend-optional">(opcional)</span>
      </legend>

      <div class="field">
        <label for="comment" class="field-label">comentario</label>
        <textarea
          id="comment"
          v-model="form.comment"
          rows="3"
          maxlength="280"
          placeholder="Describe brevemente tu experiencia..."
          class="field-input field-textarea"
        />
        <div class="char-count">
          <span :class="{ 'char-over': form.comment.length > 240 }">{{ form.comment.length }}/280</span>
        </div>
      </div>
    </fieldset>

    <!-- Honeypot -->
    <div style="position:absolute;left:-9999px;opacity:0" aria-hidden="true">
      <input id="website" v-model="honeypot" type="text" tabindex="-1" autocomplete="off" />
    </div>

    <!-- Turnstile -->
    <div ref="turnstileContainer" class="turnstile-wrap" />

    <button type="submit" :disabled="!canSubmit" class="submit-btn">
      <span v-if="isSubmitting" class="spinner" aria-hidden="true"></span>
      <svg v-else width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
      </svg>
      {{ isSubmitting ? "Enviando..." : "Enviar feedback" }}
    </button>
  </form>
</template>

<style scoped>
.feedback-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* ─── Alerts ─── */
.alert {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  font-weight: 400;
}

.alert--success {
  background-color: var(--color-positive-bg);
  color: var(--color-positive);
  border: 1px solid var(--color-positive-border);
}

.alert--error {
  background-color: var(--color-negative-bg);
  color: var(--color-negative);
  border: 1px solid var(--color-negative-border);
}

/* ─── Form groups ─── */
.form-group {
  border: none;
  padding: 0;
  margin: 0 0 0.5rem;
  padding: 1.5rem 0;
  border-bottom: 1px solid var(--color-border-subtle);
}

.form-group:last-of-type {
  border-bottom: none;
}

.group-legend {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  color: var(--color-text);
  font-weight: 500;
  letter-spacing: -0.01em;
  margin-bottom: 1.25rem;
  padding: 0;
  width: 100%;
}

.legend-prefix {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-accent);
  letter-spacing: 0.04em;
}

.legend-optional {
  font-size: 0.75rem;
  color: var(--color-text-subtle);
  font-weight: 400;
}

/* ─── Fields ─── */
.field {
  margin-bottom: 1rem;
  position: relative;
}

.field:last-child {
  margin-bottom: 0;
}

.field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.875rem;
  margin-bottom: 1rem;
}

.field-label {
  display: block;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.04em;
  color: var(--color-text-subtle);
  text-transform: lowercase;
  margin-bottom: 0.5rem;
}

.req {
  color: var(--color-accent);
}

.field-input {
  display: block;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg);
  padding: 0.625rem 0.875rem;
  font-size: 0.9375rem;
  font-family: var(--font-sans);
  color: var(--color-text);
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
  appearance: none;
  -webkit-appearance: none;
}

.field-input::placeholder {
  color: var(--color-text-subtle);
}

.field-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.15);
}

.field-select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2344446a' stroke-width='1.5' fill='none' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.875rem center;
  padding-right: 2.5rem;
  cursor: pointer;
}

.field-num {
  max-width: 7rem;
  font-family: var(--font-mono);
}

.field-textarea {
  resize: vertical;
  min-height: 5.5rem;
  line-height: 1.6;
  font-size: 0.9rem;
}

/* ─── Autocomplete ─── */
.suggestions {
  position: absolute;
  z-index: 20;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  list-style: none;
  margin: 0;
  padding: 0.25rem;
}

.suggestion-item {
  cursor: pointer;
  padding: 0.5rem 0.75rem;
  font-size: 0.9375rem;
  border-radius: 0.25rem;
  transition: background-color 0.1s ease;
  color: var(--color-text);
}

.suggestion-item:hover {
  background-color: var(--color-surface-hover);
}

/* ─── Char count ─── */
.char-count {
  margin-top: 0.375rem;
  text-align: right;
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
}

.char-over {
  color: var(--color-yield);
}

/* ─── Turnstile ─── */
.turnstile-wrap {
  display: flex;
  justify-content: center;
  padding: 1.25rem 0;
}

/* ─── Submit ─── */
.submit-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border-radius: 0.375rem;
  background-color: var(--color-accent);
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.9375rem;
  font-weight: 500;
  font-family: var(--font-sans);
  color: var(--color-bg);
  letter-spacing: -0.01em;
  cursor: pointer;
  transition: background-color 0.12s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: var(--color-accent-hover);
}

.submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.spinner {
  width: 0.875rem;
  height: 0.875rem;
  border: 2px solid rgba(9, 9, 13, 0.3);
  border-top-color: var(--color-bg);
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
