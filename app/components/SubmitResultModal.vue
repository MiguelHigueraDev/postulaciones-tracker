<script setup lang="ts">
const props = defineProps<{
  type: "success" | "error";
  message: string;
}>();

const emit = defineEmits<{
  close: [];
}>();

const dialogRef = ref<HTMLElement | null>(null);

const title = computed(() =>
  props.type === "success" ? "Feedback enviado" : "No se pudo enviar",
);

function onKeydown(event: KeyboardEvent) {
  if (event.key === "Escape") emit("close");
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
  document.body.style.overflow = "hidden";
  nextTick(() => dialogRef.value?.focus());
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
  document.body.style.overflow = "";
});
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center sm:p-6"
      @click.self="emit('close')"
    >
      <div
        class="absolute inset-0 bg-bg/80 backdrop-blur-[2px]"
        aria-hidden="true"
        @click="emit('close')"
      />

      <div
        ref="dialogRef"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="submit-result-title"
        aria-describedby="submit-result-message"
        tabindex="-1"
        class="relative z-10 w-full max-w-md overflow-hidden rounded-card border border-border bg-surface shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
      >
        <div class="px-5 py-6">
          <div
            class="mb-4 flex size-11 items-center justify-center rounded-full border"
            :class="
              type === 'success'
                ? 'border-positive-border bg-positive-bg text-positive'
                : 'border-negative-border bg-negative-bg text-negative'
            "
          >
            <svg
              v-if="type === 'success'"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <svg
              v-else
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>

          <h2
            id="submit-result-title"
            class="m-0 mb-2 text-17 font-medium tracking-tight text-text"
          >
            {{ title }}
          </h2>
          <p
            id="submit-result-message"
            class="m-0 text-14 leading-relaxed font-light text-text-muted"
          >
            {{ message }}
          </p>
        </div>

        <footer class="border-t border-border-subtle px-5 py-4">
          <button
            type="button"
            class="flex w-full cursor-pointer items-center justify-center rounded-md border-0 bg-accent px-6 py-2.5 font-sans text-15 font-medium tracking-tight text-bg transition-colors duration-150 hover:bg-accent-hover"
            @click="emit('close')"
          >
            {{ type === "success" ? "Volver al inicio" : "Entendido" }}
          </button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>
