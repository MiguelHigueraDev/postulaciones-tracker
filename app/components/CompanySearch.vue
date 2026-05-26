<script setup lang="ts">
export interface CompanyOption {
  id: string;
  name: string;
  name_normalized: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    inputId?: string;
    placeholder?: string;
    label?: string;
    showLabel?: boolean;
    required?: boolean;
  }>(),
  {
    modelValue: "",
    inputId: "company-search",
    placeholder: "Nombre de la empresa",
    label: "empresa",
    showLabel: true,
    required: false,
  },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
  "company-select": [company: CompanyOption];
  "dropdown-open": [open: boolean];
}>();

const supabase = useSupabaseClient();
const query = ref(props.modelValue);
const suggestions = ref<CompanyOption[]>([]);
const showSuggestions = ref(false);
const activeIndex = ref(-1);
const isSearching = ref(false);

const dropdownOpen = computed(
  () => showSuggestions.value && suggestions.value.length > 0,
);

watch(dropdownOpen, (open) => emit("dropdown-open", open));

watch(
  () => props.modelValue,
  (v) => {
    if (v !== query.value) query.value = v;
  },
);

watch(query, (v) => emit("update:modelValue", v));

async function searchCompanies(text: string) {
  if (text.length < 2) {
    suggestions.value = [];
    activeIndex.value = -1;
    return;
  }
  isSearching.value = true;
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, name_normalized")
    .ilike("name_normalized", `%${text.toLowerCase()}%`)
    .limit(8);
  isSearching.value = false;
  if (error) {
    suggestions.value = [];
    activeIndex.value = -1;
    return;
  }
  suggestions.value = (data as CompanyOption[]) ?? [];
  activeIndex.value = suggestions.value.length > 0 ? 0 : -1;
}

function onInput() {
  showSuggestions.value = true;
  searchCompanies(query.value);
}

function selectCompany(company: CompanyOption) {
  query.value = company.name;
  showSuggestions.value = false;
  suggestions.value = [];
  activeIndex.value = -1;
  emit("company-select", company);
}

function findExactMatch(): CompanyOption | undefined {
  const q = query.value.trim().toLowerCase();
  if (!q) return undefined;
  return suggestions.value.find(
    (c) =>
      c.name.toLowerCase() === q || c.name_normalized.toLowerCase() === q,
  );
}

async function confirmSelection() {
  const exact = findExactMatch();
  if (exact) {
    selectCompany(exact);
    return;
  }
  if (activeIndex.value >= 0) {
    const highlighted = suggestions.value[activeIndex.value];
    if (highlighted) {
      selectCompany(highlighted);
      return;
    }
  }
  if (suggestions.value.length === 1) {
    const sole = suggestions.value[0];
    if (sole) {
      selectCompany(sole);
      return;
    }
  }
  if (query.value.trim().length < 2) return;

  const { data } = await supabase
    .from("companies")
    .select("id, name, name_normalized")
    .eq("name_normalized", query.value.trim().toLowerCase())
    .maybeSingle();

  if (data) selectCompany(data as CompanyOption);
}

function onKeydown(e: KeyboardEvent) {
  if (!showSuggestions.value && e.key !== "Enter") return;

  if (e.key === "ArrowDown") {
    e.preventDefault();
    if (suggestions.value.length === 0) return;
    activeIndex.value = (activeIndex.value + 1) % suggestions.value.length;
    return;
  }
  if (e.key === "ArrowUp") {
    e.preventDefault();
    if (suggestions.value.length === 0) return;
    activeIndex.value =
      activeIndex.value <= 0
        ? suggestions.value.length - 1
        : activeIndex.value - 1;
    return;
  }
  if (e.key === "Enter") {
    e.preventDefault();
    confirmSelection();
  }
  if (e.key === "Escape") {
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
    <div class="relative" :class="{ 'z-50': dropdownOpen }">
      <svg
        class="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-text-subtle"
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
      <input
        :id="inputId"
        v-model="query"
        type="text"
        :placeholder="placeholder"
        class="w-full rounded-md border border-border bg-surface py-2.5 pr-10 pl-9.5 font-mono text-sm text-text transition-[border-color,box-shadow] duration-150 placeholder:text-text-subtle focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_rgba(129,140,248,0.12)]"
        autocomplete="off"
        :required="required"
        @input="onInput"
        @focus="onInput"
        @blur="onBlur"
        @keydown="onKeydown"
      />
      <button
        v-if="query"
        type="button"
        class="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 cursor-pointer items-center justify-center rounded border-0 bg-surface-alt text-text-muted transition-colors duration-100 hover:bg-border hover:text-text"
        aria-label="Limpiar"
        @click="query = ''"
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
      <ul
        v-if="dropdownOpen"
        class="absolute top-[calc(100%+4px)] right-0 left-0 z-50 m-0 list-none overflow-hidden rounded-lg border border-border bg-surface-alt p-1 shadow-[0_12px_32px_rgba(0,0,0,0.5)]"
        role="listbox"
      >
        <li
          v-for="(company, index) in suggestions"
          :key="company.id"
          role="option"
          class="cursor-pointer rounded px-3 py-2 text-15 text-text transition-colors duration-100 hover:bg-surface-hover"
          :class="{ 'bg-surface-hover': index === activeIndex }"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="selectCompany(company)"
          @mouseenter="activeIndex = index"
        >
          {{ company.name }}
        </li>
      </ul>
      <p
        v-else-if="showSuggestions && query.length >= 2 && !isSearching"
        class="absolute top-[calc(100%+4px)] right-0 left-0 z-50 m-0 rounded-lg border border-border bg-surface-alt px-3 py-2.5 font-mono text-xs text-text-subtle"
      >
        Sin coincidencias
      </p>
    </div>
  </div>
</template>
