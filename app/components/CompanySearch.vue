<script setup lang="ts">
import type { CompanyListItem } from "~~/shared/types/company";

export type CompanyOption = CompanyListItem;

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    inputId?: string;
    placeholder?: string;
    label?: string;
    showLabel?: boolean;
    required?: boolean;
    maxlength?: number;
  }>(),
  {
    modelValue: "",
    inputId: "company-search",
    placeholder: "Nombre de la empresa",
    label: "empresa",
    showLabel: true,
    required: false,
    maxlength: undefined,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "company-select": [company: CompanyOption];
  "dropdown-open": [open: boolean];
}>();

const { data: companies } = useFetch<CompanyOption[]>("/api/companies", {
  key: "companies-list",
});

const companyNames = computed(
  () => companies.value?.map((company) => company.name) ?? [],
);

const companyInputClass =
  "w-full rounded-md border border-border bg-surface py-2.5 pr-10 pl-9.5 font-mono text-sm text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)]";

function findCompanyByText(text: string): CompanyOption | undefined {
  const normalized = text.trim().toLowerCase();
  if (!normalized) return undefined;

  return companies.value?.find(
    (company) =>
      company.name.toLowerCase() === normalized ||
      company.name_normalized === normalized,
  );
}

function onOptionSelect(name: string) {
  const company =
    companies.value?.find((item) => item.name === name) ??
    findCompanyByText(name);
  if (company) emit("company-select", company);
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="showLabel"
      :for="inputId"
      class="font-mono text-xs font-medium tracking-wider text-text-muted lowercase"
    >
      {{ label }}
      <span v-if="required" class="text-accent">*</span>
    </label>
    <Typeahead
      :model-value="modelValue"
      :options="companyNames"
      :input-id="inputId"
      :placeholder="placeholder"
      :show-label="false"
      :required="required"
      :input-class="companyInputClass"
      :max-length="maxlength"
      no-results-message="Sin coincidencias"
      @update:model-value="$emit('update:modelValue', $event)"
      @option-select="onOptionSelect"
      @dropdown-open="$emit('dropdown-open', $event)"
    >
      <template #prefix>
        <svg
          class="pointer-events-none absolute top-1/2 left-3.5 z-10 -translate-y-1/2 text-text-subtle"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
      </template>
      <template #suffix="{ clear, hasValue }">
        <button
          v-if="hasValue"
          type="button"
          class="absolute top-1/2 right-2.5 z-10 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-0 bg-surface-alt text-text-muted transition-colors duration-100 hover:bg-border hover:text-text"
          aria-label="Limpiar"
          @click="clear()"
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
            aria-hidden="true"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </template>
    </Typeahead>
  </div>
</template>
