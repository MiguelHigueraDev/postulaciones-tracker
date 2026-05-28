<script setup lang="ts">
import { getResultStyle } from "~~/shared/constants/resultStyles";
import { RATING_LABELS, type RatingKey } from "~~/shared/schemas/feedback";
import type { GlobalSubmission } from "~~/shared/utils/companyStats";

const props = defineProps<{
  submission: GlobalSubmission | null;
}>();

function formatSalary(value: number): string {
  return `$${value.toLocaleString("es-CL")}`;
}

const profileFields = computed(() => {
  const wp = props.submission?.workplace_profile;
  if (!wp) return [];
  return [
    { label: "Sueldo mensual líquido", value: wp.salary != null ? formatSalary(wp.salary) : null },
    { label: "Modalidad", value: wp.modality },
    { label: "Aspectos positivos", value: wp.good_things },
    { label: "Aspectos negativos", value: wp.bad_things },
    { label: "Beneficios", value: wp.benefits },
  ].filter((f) => f.value);
});

const profileRatings = computed(() => {
  const wp = props.submission?.workplace_profile;
  if (!wp) return [];
  const keys: { key: RatingKey; field: keyof typeof wp }[] = [
    { key: "p_rating_work_environment", field: "rating_work_environment" },
    { key: "p_rating_work_life_balance", field: "rating_work_life_balance" },
    { key: "p_rating_career_opportunities", field: "rating_career_opportunities" },
    { key: "p_rating_compensation_benefits", field: "rating_compensation_benefits" },
  ];
  return keys
    .filter((k) => wp[k.field] != null)
    .map((k) => ({ label: RATING_LABELS[k.key], value: wp[k.field] as number }));
});

const hasProfile = computed(() => profileFields.value.length > 0 || profileRatings.value.length > 0);

const emit = defineEmits<{
  close: [];
}>();

const dialogRef = ref<HTMLElement | null>(null);

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

watch(
  () => props.submission,
  (submission) => {
    if (submission) {
      document.addEventListener("keydown", onKeydown);
      document.body.style.overflow = "hidden";
      nextTick(() => dialogRef.value?.focus());
    } else {
      document.removeEventListener("keydown", onKeydown);
      document.body.style.overflow = "";
    }
  },
);

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});

const fields = computed(() => {
  const s = props.submission;
  if (!s) return [];

  return [
    { label: "Rubro", value: s.industry },
    { label: "Cargo", value: s.position },
    { label: "Período", value: s.application_month },
    { label: "Respuesta", value: s.response_time },
    { label: "Etapas", value: String(s.stages_reached) },
    {
      label: "Última etapa",
      value: s.last_stage != null && s.last_stage !== "" ? s.last_stage : "—",
    },
  ];
});
</script>

<template>
  <Teleport to="body">
    <div v-if="submission" class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      @click.self="emit('close')">
      <div class="absolute inset-0 bg-bg/80 backdrop-blur-[2px]" aria-hidden="true" @click="emit('close')" />

      <div ref="dialogRef" role="dialog" aria-modal="true"
        :aria-labelledby="submission ? 'submission-detail-title' : undefined" tabindex="-1"
        class="relative z-10 flex max-h-[min(90vh,40rem)] w-full max-w-lg flex-col overflow-hidden rounded-card border border-border bg-surface shadow-[0_24px_48px_rgba(0,0,0,0.5)]">
        <header class="flex shrink-0 items-start justify-between gap-4 border-b border-border-subtle px-5 py-4">
          <div class="min-w-0 flex-1">
            <p class="m-0 mb-1 font-mono text-11 tracking-widest text-text-subtle uppercase">
              Registro
            </p>
            <h2 id="submission-detail-title" class="m-0 text-17 leading-snug font-medium text-text">
              {{ submission.position }}
            </h2>
            <p class="m-0 mt-1 text-13 font-light text-text-muted">
              <NuxtLink v-if="submission.company_slug"
                :to="`/resenas/${encodeURIComponent(submission.company_slug)}`"
                class="text-text-muted no-underline transition-colors duration-150 hover:text-accent"
                @click="emit('close')">
                {{ submission.company_name }}
              </NuxtLink>
              <span v-else>{{ submission.company_name }}</span>
            </p>
          </div>

          <button type="button"
            class="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border bg-surface-alt text-text-muted transition-colors duration-150 hover:border-text-muted hover:text-text"
            aria-label="Cerrar" @click="emit('close')">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div class="overflow-y-auto px-5 py-4">
          <span
            class="mb-4 inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-xs font-medium tracking-wide"
            :style="{
              color: getResultStyle(submission.result).color,
              backgroundColor: getResultStyle(submission.result).bg,
              borderColor: getResultStyle(submission.result).border,
            }">
            <span class="size-1.5 shrink-0 rounded-full"
              :style="{ backgroundColor: getResultStyle(submission.result).dot }" aria-hidden="true" />
            {{ getResultStyle(submission.result).label }}
          </span>

          <dl class="m-0 flex flex-col gap-3">
            <div v-for="field in fields" :key="field.label" class="grid grid-cols-[6.5rem_1fr] gap-3 text-13">
              <dt class="font-mono text-11 text-text-subtle lowercase">
                {{ field.label }}
              </dt>
              <dd class="m-0 font-light text-text-muted">
                {{ field.value }}
              </dd>
            </div>
          </dl>

          <div v-if="submission.comment" class="mt-4 border-t border-border-subtle pt-4">
            <p class="m-0 mb-2 font-mono text-11 tracking-widest text-text-subtle uppercase">
              Comentario
            </p>
            <p class="m-0 text-14 leading-relaxed font-light whitespace-pre-wrap text-text-muted">
              {{ submission.comment }}
            </p>
          </div>

          <div v-if="hasProfile" class="mt-4 border-t border-border-subtle pt-4">
            <p class="m-0 mb-3 font-mono text-11 tracking-widest text-text-subtle uppercase">
              Perfil laboral
            </p>

            <dl v-if="profileFields.length" class="m-0 mb-3 flex flex-col gap-2.5">
              <div v-for="pf in profileFields" :key="pf.label" class="text-13">
                <dt class="mb-0.5 font-mono text-11 text-text-subtle lowercase">
                  {{ pf.label }}
                </dt>
                <dd class="m-0 font-light whitespace-pre-wrap text-text-muted">
                  {{ pf.value }}
                </dd>
              </div>
            </dl>

            <div v-if="profileRatings.length" class="flex flex-col gap-2">
              <div v-for="pr in profileRatings" :key="pr.label" class="flex items-center justify-between gap-3 text-13">
                <span class="font-light text-text-muted">{{ pr.label }}</span>
                <div class="flex gap-0.5">
                  <span v-for="n in 5" :key="n"
                    class="inline-flex size-5 items-center justify-center rounded text-11 font-medium" :class="n <= pr.value
                      ? 'bg-accent/15 text-accent'
                      : 'bg-surface-alt text-text-subtle/40'">{{ n }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
