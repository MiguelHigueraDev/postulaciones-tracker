<script setup lang="ts">
import {
  MAX_POSITION_LENGTH,
  POSITION_OPTIONS,
} from "~~/shared/schemas/feedback";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    inputId?: string;
    placeholder?: string;
    label?: string;
    showLabel?: boolean;
    required?: boolean;
    inputClass?: string;
  }>(),
  {
    modelValue: "",
    inputId: "position",
    placeholder: "Backend Developer, Analista de datos...",
    label: "cargo",
    showLabel: true,
    required: false,
    inputClass: "",
  },
);

defineEmits<{
  "update:modelValue": [value: string];
  "dropdown-open": [open: boolean];
}>();
</script>

<template>
  <Typeahead
    :model-value="props.modelValue"
    :options="POSITION_OPTIONS"
    :input-id="props.inputId"
    :placeholder="props.placeholder"
    :label="props.label"
    :show-label="props.showLabel"
    :required="props.required"
    :input-class="props.inputClass"
    :max-length="MAX_POSITION_LENGTH"
    @update:model-value="$emit('update:modelValue', $event)"
    @dropdown-open="$emit('dropdown-open', $event)"
  />
</template>
