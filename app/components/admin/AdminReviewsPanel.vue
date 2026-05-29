<script setup lang="ts">
const {
  search,
  page,
  reviews,
  total,
  totalPages,
  loading,
  error,
  deletingId,
  rangeStart,
  rangeEnd,
  formatDate,
  deleteReview,
} = useAdminReviews();
</script>

<template>
  <section>
    <div class="mb-4">
      <input
        v-model="search"
        type="search"
        placeholder="Buscar por empresa, cargo, industria o comentario…"
        class="w-full rounded-md border border-border bg-surface px-3 py-2.5 text-sm text-text outline-none transition-colors duration-150 focus:border-accent"
      />
    </div>

    <p v-if="loading" class="font-mono text-xs text-text-muted">
      Cargando reseñas…
    </p>
    <p v-else-if="error" class="text-sm text-negative">
      No se pudieron cargar las reseñas.
    </p>
    <p v-else-if="reviews.length === 0" class="font-mono text-xs text-text-muted">
      No hay reseñas para mostrar.
    </p>

    <div v-else class="overflow-x-auto rounded-md border border-border">
      <table class="min-w-full border-collapse text-sm">
        <thead class="bg-surface-alt">
          <tr class="text-left font-mono text-[10px] tracking-wider text-text-subtle uppercase">
            <th class="px-3 py-2">Empresa</th>
            <th class="px-3 py-2">Cargo</th>
            <th class="px-3 py-2">Resultado</th>
            <th class="px-3 py-2">Fecha</th>
            <th class="px-3 py-2">Comentario</th>
            <th class="px-3 py-2" />
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="review in reviews"
            :key="review.id"
            class="border-t border-border"
          >
            <td class="px-3 py-2 whitespace-nowrap">{{ review.company_name }}</td>
            <td class="px-3 py-2 whitespace-nowrap">{{ review.position }}</td>
            <td class="px-3 py-2 whitespace-nowrap">{{ review.result }}</td>
            <td class="px-3 py-2 whitespace-nowrap font-mono text-xs text-text-muted">
              {{ formatDate(review.created_at) }}
            </td>
            <td class="max-w-xs truncate px-3 py-2 text-text-muted">
              {{ review.comment || "—" }}
            </td>
            <td class="px-3 py-2 text-right">
              <button
                type="button"
                class="rounded border border-negative-border px-2 py-1 font-mono text-[10px] tracking-wide text-negative transition-colors duration-150 hover:bg-negative-bg disabled:opacity-50"
                :disabled="deletingId === review.id"
                @click="deleteReview(review.id)"
              >
                {{ deletingId === review.id ? "…" : "Eliminar" }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div
      v-if="total > 0"
      class="mt-4 flex flex-wrap items-center justify-between gap-3 font-mono text-xs text-text-muted"
    >
      <span>
        {{ rangeStart }}–{{ rangeEnd }} de {{ total }} reseñas
      </span>
      <div v-if="totalPages > 1" class="flex items-center gap-2">
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
    </div>
  </section>
</template>
