<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue?: string;
    options: readonly string[];
    inputId?: string;
    placeholder?: string;
    label?: string;
    showLabel?: boolean;
    required?: boolean;
    inputClass?: string;
    maxLength?: number;
    showAllWhenEmpty?: boolean;
    minQueryLength?: number;
    noResultsMessage?: string;
  }>(),
  {
    modelValue: "",
    inputId: "typeahead",
    placeholder: "",
    label: "",
    showLabel: true,
    required: false,
    inputClass: "",
    maxLength: undefined,
    showAllWhenEmpty: true,
    minQueryLength: 0,
    noResultsMessage: "",
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "option-select": [value: string];
  "dropdown-open": [open: boolean];
}>();

const query = ref(props.modelValue);
const showSuggestions = ref(false);
const activeIndex = ref(-1);

const defaultInputClass =
  "block w-full appearance-none rounded-md border border-border bg-bg px-3.5 py-2.5 font-sans text-15 text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.15)]";

function normalizeForSearch(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase();
}

const suggestions = computed(() => {
  const trimmed = query.value.trim();
  if (!trimmed && props.showAllWhenEmpty) return [...props.options];

  if (trimmed.length < props.minQueryLength) return [];

  const needle = normalizeForSearch(trimmed);
  return props.options.filter((option) =>
    normalizeForSearch(option).includes(needle),
  );
});

const dropdownOpen = computed(
  () => showSuggestions.value && suggestions.value.length > 0,
);

const showNoResults = computed(
  () =>
    showSuggestions.value &&
    props.noResultsMessage &&
    query.value.trim().length >= props.minQueryLength &&
    suggestions.value.length === 0,
);

watch(dropdownOpen, (open) => emit("dropdown-open", open));

watch(
  () => props.modelValue,
  (value) => {
    if (value !== query.value) query.value = value;
  },
);

watch(query, (value) => emit("update:modelValue", value));

function selectOption(option: string) {
  query.value = option;
  showSuggestions.value = false;
  activeIndex.value = -1;
  emit("option-select", option);
}

function onInput() {
  showSuggestions.value = true;
  activeIndex.value = suggestions.value.length > 0 ? 0 : -1;
}

function confirmSelection() {
  if (activeIndex.value >= 0) {
    const highlighted = suggestions.value[activeIndex.value];
    if (highlighted) {
      selectOption(highlighted);
      return;
    }
  }
  if (suggestions.value.length === 1) {
    const sole = suggestions.value[0];
    if (sole) selectOption(sole);
    return;
  }

  const trimmed = query.value.trim();
  if (!trimmed) return;

  const exact = props.options.find(
    (option) => normalizeForSearch(option) === normalizeForSearch(trimmed),
  );
  if (exact) selectOption(exact);
}

function onKeydown(event: KeyboardEvent) {
  if (!showSuggestions.value && event.key !== "Enter") return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    if (suggestions.value.length === 0) return;
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length;
    return;
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    if (suggestions.value.length === 0) return;
    activeIndex.value =
      activeIndex.value <= 0
        ? suggestions.value.length - 1
        : activeIndex.value - 1;
    return;
  }
  if (event.key === "Enter") {
    if (dropdownOpen.value || query.value.trim()) {
      event.preventDefault();
      confirmSelection();
    }
    return;
  }
  if (event.key === "Escape") {
    showSuggestions.value = false;
    activeIndex.value = -1;
  }
}

function onBlur() {
  setTimeout(() => {
    showSuggestions.value = false;
    activeIndex.value = -1;
  }, 250);
}

function clearQuery() {
  query.value = "";
  showSuggestions.value = false;
  activeIndex.value = -1;
}

defineExpose({ clearQuery });
</script>

<template>
  <div class="flex flex-col">
    <label
      v-if="showLabel && label"
      :for="inputId"
      class="mb-2 block font-mono text-11 tracking-wide text-text-subtle lowercase"
    >
      {{ label }}
      <span v-if="required" class="text-accent">*</span>
    </label>
    <div class="relative" :class="{ 'z-50': dropdownOpen || showNoResults }">
      <slot name="prefix" />
      <input
        :id="inputId"
        v-model="query"
        type="text"
        :maxlength="maxLength"
        :placeholder="placeholder"
        :class="inputClass || defaultInputClass"
        autocomplete="off"
        :required="required"
        @input="onInput"
        @focus="onInput"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <slot name="suffix" :clear="clearQuery" :has-value="!!query" />
      <ul
        v-if="dropdownOpen"
        class="absolute top-[calc(100%+4px)] right-0 left-0 z-50 m-0 max-h-56 list-none overflow-y-auto rounded-lg border border-border bg-surface-alt p-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        role="listbox"
      >
        <li
          v-for="(option, index) in suggestions"
          :key="option"
          role="option"
          class="cursor-pointer rounded px-3 py-2 text-15 text-text transition-colors duration-100 hover:bg-surface-hover"
          :class="{ 'bg-surface-hover': index === activeIndex }"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="selectOption(option)"
          @mouseenter="activeIndex = index"
        >
          {{ option }}
        </li>
      </ul>
      <p
        v-else-if="showNoResults"
        class="absolute top-[calc(100%+4px)] right-0 left-0 z-50 m-0 rounded-lg border border-border bg-surface-alt px-3 py-2.5 font-mono text-xs text-text-subtle"
      >
        {{ noResultsMessage }}
      </p>
    </div>
  </div>
</template>
