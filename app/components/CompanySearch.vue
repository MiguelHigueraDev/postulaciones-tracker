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
  <div class="company-search">
    <label v-if="showLabel" :for="inputId" class="company-search-label">
      {{ label }}
      <span v-if="required" class="req">*</span>
    </label>
    <div
      class="company-search-field"
      :class="{ 'company-search-field--open': dropdownOpen }"
    >
      <svg
        class="search-icon"
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
        class="company-search-input"
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
        class="search-clear"
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
        class="suggestions"
        role="listbox"
      >
        <li
          v-for="(company, index) in suggestions"
          :key="company.id"
          role="option"
          class="suggestion-item"
          :class="{ 'suggestion-item--active': index === activeIndex }"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="selectCompany(company)"
          @mouseenter="activeIndex = index"
        >
          {{ company.name }}
        </li>
      </ul>
      <p
        v-else-if="showSuggestions && query.length >= 2 && !isSearching"
        class="suggestions-empty"
      >
        Sin coincidencias
      </p>
    </div>
  </div>
</template>

<style scoped>
.company-search {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.company-search-label {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 500;
  letter-spacing: 0.04em;
  text-transform: lowercase;
  color: var(--color-text-muted);
}

.req {
  color: var(--color-accent);
}

.company-search-field {
  position: relative;
}

.company-search-field--open {
  z-index: 50;
}

.search-icon {
  position: absolute;
  left: 0.875rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-subtle);
  pointer-events: none;
}

.company-search-input {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0.375rem;
  padding: 0.625rem 2.5rem 0.625rem 2.375rem;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text);
  transition: border-color 0.12s ease, box-shadow 0.12s ease;
}

.company-search-input::placeholder {
  color: var(--color-text-subtle);
}

.company-search-input:focus {
  outline: none;
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.12);
}

.search-clear {
  position: absolute;
  right: 0.625rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  border: none;
  background-color: var(--color-surface-alt);
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.1s ease, color 0.1s ease;
}

.search-clear:hover {
  background-color: var(--color-border);
  color: var(--color-text);
}

.suggestions-empty {
  position: absolute;
  z-index: 50;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  margin: 0;
  padding: 0.625rem 0.75rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--color-text-subtle);
  background-color: var(--color-surface-alt);
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
}

.suggestions {
  position: absolute;
  z-index: 50;
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

.suggestion-item:hover,
.suggestion-item--active {
  background-color: var(--color-surface-hover);
}
</style>
