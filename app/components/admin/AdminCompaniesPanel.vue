<script setup lang="ts">
const {
  search,
  page,
  companies,
  totalPages,
  loading,
  error,
  selectedId,
  selected,
  name,
  saving,
  message,
  messageIsError,
  nameUnchanged,
  nameNormalizedPreview,
  logoFile,
  logoUploading,
  logoRemoving,
  logoMessage,
  logoMessageIsError,
  saveCompany,
  onLogoSelected,
  uploadLogo,
  removeLogo,
} = useAdminCompanies();
</script>

<template>
  <section>
    <div class="mb-4">
      <input
        v-model="search"
        type="search"
        placeholder="Buscar empresa…"
        class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
      />
    </div>

    <p v-if="loading" class="font-mono text-xs text-text-muted">
      Cargando empresas…
    </p>
    <p v-else-if="error" class="text-sm text-negative">
      No se pudieron cargar las empresas.
    </p>
    <p v-else-if="companies.length === 0" class="font-mono text-xs text-text-muted">
      No hay empresas para mostrar.
    </p>

    <div v-else class="grid gap-6 900:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div class="overflow-hidden rounded-md border border-border">
        <ul class="max-h-96 overflow-y-auto">
          <li
            v-for="company in companies"
            :key="company.id"
            class="border-b border-border last:border-b-0"
          >
            <button
              type="button"
              class="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-surface-alt"
              :class="selectedId === company.id ? 'bg-surface-alt' : ''"
              @click="selectedId = company.id"
            >
              <span
                class="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded border border-border bg-surface-alt text-xs font-bold text-text-muted"
              >
                <img
                  v-if="company.logo_url"
                  :src="company.logo_url"
                  :alt="`${company.name} logo`"
                  class="size-full object-cover"
                />
                <span v-else>{{ company.name.charAt(0).toUpperCase() }}</span>
              </span>
              <span class="min-w-0 truncate text-sm">{{ company.name }}</span>
            </button>
          </li>
        </ul>
      </div>

      <div v-if="selected" class="rounded-md border border-border bg-surface p-4">
        <label class="mb-4 flex flex-col gap-1.5">
          <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">
            Nombre
          </span>
          <input
            v-model="name"
            type="text"
            maxlength="120"
            class="rounded-md border border-border bg-surface px-3 py-2 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
          />
          <span class="font-mono text-[10px] text-text-subtle">
            Slug: {{ nameNormalizedPreview }}
          </span>
        </label>

        <div class="mb-4 flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
            :disabled="saving || !name.trim() || nameUnchanged"
            @click="saveCompany"
          >
            {{ saving ? "Guardando…" : "Guardar cambios" }}
          </button>
        </div>

        <p
          v-if="message"
          class="mb-4 text-sm"
          :class="messageIsError ? 'text-negative' : 'text-positive'"
        >
          {{ message }}
        </p>

        <div class="mb-4 flex items-center gap-3">
          <span
            class="flex size-16 items-center justify-center overflow-hidden rounded-md border border-border bg-surface-alt text-xl font-bold text-text-muted"
          >
            <img
              v-if="selected.logo_url"
              :src="selected.logo_url"
              :alt="`${selected.name} logo`"
              class="size-full object-cover"
            />
            <span v-else>{{ selected.name.charAt(0).toUpperCase() }}</span>
          </span>
          <p class="m-0 font-mono text-xs text-text-subtle">
            PNG, JPEG, WebP o SVG. Máx. 512 KB.
          </p>
        </div>

        <label class="mb-4 flex flex-col gap-1.5">
          <span class="font-mono text-[10px] tracking-wider text-text-subtle uppercase">
            Nuevo logo
          </span>
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp,image/svg+xml"
            class="text-sm text-text-muted file:mr-3 file:rounded file:border-0 file:bg-surface-alt file:px-3 file:py-1.5 file:font-mono file:text-xs file:text-text"
            @change="onLogoSelected"
          />
        </label>

        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="rounded-md bg-accent px-3 py-2 text-sm font-medium text-bg transition-colors duration-150 hover:bg-accent-hover disabled:opacity-50"
            :disabled="!logoFile || logoUploading"
            @click="uploadLogo"
          >
            {{ logoUploading ? "Subiendo…" : "Subir logo" }}
          </button>
          <button
            v-if="selected.logo_url"
            type="button"
            class="rounded-md border border-negative-border px-3 py-2 text-sm text-negative transition-colors duration-150 hover:bg-negative-bg disabled:opacity-50"
            :disabled="logoRemoving"
            @click="removeLogo"
          >
            {{ logoRemoving ? "Eliminando…" : "Eliminar logo" }}
          </button>
        </div>

        <p
          v-if="logoMessage"
          class="mt-3 text-sm"
          :class="logoMessageIsError ? 'text-negative' : 'text-positive'"
        >
          {{ logoMessage }}
        </p>
      </div>
    </div>

    <div
      v-if="totalPages > 1"
      class="mt-4 flex items-center justify-end gap-2 font-mono text-xs text-text-muted"
    >
      <button
        type="button"
        class="rounded border border-border px-2 py-1 disabled:opacity-40"
        :disabled="page <= 1 || loading"
        @click="page--"
      >
        Anterior
      </button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button
        type="button"
        class="rounded border border-border px-2 py-1 disabled:opacity-40"
        :disabled="page >= totalPages || loading"
        @click="page++"
      >
        Siguiente
      </button>
    </div>
  </section>
</template>
