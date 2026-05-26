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

async function searchCompanies(query: string) {
  if (query.length < 2) {
    companySuggestions.value = [];
    return;
  }

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
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
}

const isFormValid = computed(() => {
  const payload = buildPayload();
  return feedbackSchema.safeParse(payload).success;
});

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
  if (!isFormValid.value || isSubmitting.value) return;

  isSubmitting.value = true;
  submitError.value = "";
  submitSuccess.value = false;

  try {
    await $fetch("/api/submit-feedback", {
      method: "POST",
      body: buildPayload(),
    });
  } catch (err: any) {
    isSubmitting.value = false;
    submitError.value =
      err?.data?.message ||
      "Hubo un error al enviar tu feedback. Por favor intenta de nuevo.";
    return;
  }

  isSubmitting.value = false;

  submitSuccess.value = true;
  Object.assign(form, {
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
}
</script>

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    <div v-if="submitSuccess" class="rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
      ¡Feedback enviado con éxito! Gracias por tu aporte.
    </div>

    <div v-if="submitError" class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      {{ submitError }}
    </div>

    <!-- Company name with autocomplete -->
    <div class="relative">
      <label for="company" class="block text-sm font-medium text-slate-700">
        Empresa *
      </label>
      <input id="company" v-model="form.companyName" type="text" required placeholder="Nombre de la empresa"
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
        @input="onCompanyInput" @focus="onCompanyInput" @blur="onCompanyBlur" />
      <ul v-if="showSuggestions && companySuggestions.length > 0"
        class="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
        <li v-for="name in companySuggestions" :key="name" class="cursor-pointer px-3 py-2 text-sm hover:bg-slate-100"
          @mousedown.prevent="selectCompany(name)">
          {{ name }}
        </li>
      </ul>
    </div>

    <!-- Industry -->
    <div>
      <label for="industry" class="block text-sm font-medium text-slate-700">
        Rubro *
      </label>
      <select id="industry" v-model="form.industry" required
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none">
        <option value="" disabled>Selecciona un rubro</option>
        <option v-for="opt in INDUSTRY_OPTIONS" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- Position -->
    <div>
      <label for="position" class="block text-sm font-medium text-slate-700">
        Cargo *
      </label>
      <input id="position" v-model="form.position" type="text" required
        placeholder="Ej: Backend Developer, Analista de datos"
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none" />
    </div>

    <!-- Application month -->
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label for="app-month" class="block text-sm font-medium text-slate-700">
          Mes de postulación *
        </label>
        <select id="app-month" v-model="form.applicationMonth" required
          class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none">
          <option value="" disabled>Mes</option>
          <option v-for="m in MONTHS" :key="m" :value="m">{{ m }}</option>
        </select>
      </div>
      <div>
        <label for="app-year" class="block text-sm font-medium text-slate-700">
          Año *
        </label>
        <select id="app-year" v-model="form.applicationYear" required
          class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none">
          <option v-for="y in YEARS" :key="y" :value="y">{{ y }}</option>
        </select>
      </div>
    </div>

    <!-- Response time -->
    <div>
      <label for="response-time" class="block text-sm font-medium text-slate-700">
        ¿Respondieron? *
      </label>
      <select id="response-time" v-model="form.responseTime" required
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none">
        <option value="" disabled>Selecciona una opción</option>
        <option v-for="opt in RESPONSE_TIME_OPTIONS" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- Stages reached -->
    <div>
      <label for="stages" class="block text-sm font-medium text-slate-700">
        N° etapas alcanzadas
      </label>
      <input id="stages" v-model.number="form.stagesReached" type="number" min="0" max="20"
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none" />
    </div>

    <!-- Last stage -->
    <div>
      <label for="last-stage" class="block text-sm font-medium text-slate-700">
        ¿En qué etapa dejaste de tener respuesta?
      </label>
      <select id="last-stage" v-model="form.lastStage"
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none">
        <option value="">No aplica</option>
        <option v-for="opt in LAST_STAGE_OPTIONS" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- Result -->
    <div>
      <label for="result" class="block text-sm font-medium text-slate-700">
        Resultado *
      </label>
      <select id="result" v-model="form.result" required
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none">
        <option value="" disabled>Selecciona un resultado</option>
        <option v-for="opt in RESULT_OPTIONS" :key="opt" :value="opt">
          {{ opt }}
        </option>
      </select>
    </div>

    <!-- Comment -->
    <div>
      <label for="comment" class="block text-sm font-medium text-slate-700">
        Comentario (opcional, máx. 280 caracteres)
      </label>
      <textarea id="comment" v-model="form.comment" rows="3" maxlength="280"
        placeholder="Comparte tu experiencia brevemente..."
        class="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none" />
      <p class="mt-1 text-xs text-slate-400">
        {{ form.comment.length }}/280
      </p>
    </div>

    <button type="submit" :disabled="!isFormValid || isSubmitting"
      class="w-full rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50">
      {{ isSubmitting ? "Enviando..." : "Enviar feedback" }}
    </button>
  </form>
</template>
