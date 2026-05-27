<script setup lang="ts">
import { parsePtQueryCommand } from "~~/shared/utils/parsePtQuery";

const command = ref("");
const error = ref("");
const inputRef = ref<HTMLInputElement | null>(null);

function focusInput() {
  inputRef.value?.focus();
}

function submit() {
  const parsed = parsePtQueryCommand(command.value);
  if (!parsed) {
    error.value = 'comando inválido · uso: pt query --company "nombre"';
    return;
  }

  error.value = "";
  return navigateTo(
    `/resultados/${encodeURIComponent(parsed.company)}`,
  );
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === "Escape") {
    command.value = "";
    error.value = "";
  }
}
</script>

<template>
  <div
    class="overflow-hidden rounded-card border border-border bg-surface font-mono text-13 shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
    role="group" aria-label="Terminal de consulta pt" @click="focusInput">
    <div class="flex items-center gap-1.5 border-b border-border bg-surface-alt px-3.5 py-2.5">
      <span class="size-2.75 rounded-full bg-[#ff5f57]" aria-hidden="true" />
      <span class="size-2.75 rounded-full bg-[#ffbd2e]" aria-hidden="true" />
      <span class="size-2.75 rounded-full bg-[#28c941]" aria-hidden="true" />
      <span class="mx-auto text-11 tracking-wide text-text-subtle">
        pt — query
      </span>
    </div>
    <div class="flex flex-col gap-1 px-5 pt-5 pb-6">
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="font-medium text-accent">$</span>
        <span class="text-text">pt query</span>
        <span class="text-text-muted">--company</span>
        <span class="text-[#86efac]">"Buk"</span>
      </div>
      <div class="h-2" aria-hidden="true" />
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="min-w-22 text-xs text-text-subtle">empresa</span>
        <span class="text-text">Buk</span>
      </div>
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="min-w-22 text-xs text-text-subtle">cargo </span>
        <span class="text-text">Fullstack Dev</span>
      </div>
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="min-w-22 text-xs text-text-subtle">etapas </span>
        <span class="text-accent">3</span>
      </div>
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="min-w-22 text-xs text-text-subtle">resultado</span>
        <span class="font-medium text-positive">Oferta aceptada ✓</span>
      </div>
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="min-w-22 text-xs text-text-subtle">respuesta</span>
        <span class="text-text">1–2 semanas</span>
      </div>
      <div class="h-2" aria-hidden="true" />
      <div class="flex items-baseline gap-3 leading-relaxed">
        <span class="shrink-0 font-medium text-accent">$</span>
        <div class="relative min-w-0 flex-1">
          <span
            v-if="!command"
            class="pointer-events-none absolute inset-y-0 left-0 animate-terminal-blink text-accent"
            aria-hidden="true"
          >
            ▋
          </span>
          <input
            ref="inputRef"
            v-model="command"
            type="text"
            class="w-full border-0 bg-transparent p-0 font-mono text-13 text-text outline-none caret-accent"
            :class="{ 'caret-transparent': !command }"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            aria-label="Comando pt query"
            @keydown.enter.prevent="submit"
            @keydown="onKeydown"
            @input="error = ''"
          />
        </div>
      </div>
      <p v-if="error" class="m-0 text-negative" role="alert">
        {{ error }}
      </p>
    </div>
  </div>
</template>
