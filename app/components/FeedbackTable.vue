<script setup lang="ts">
interface Submission {
  id: string;
  industry: string;
  position: string;
  application_month: string;
  response_time: string;
  stages_reached: number;
  last_stage: string | null;
  result: string;
  comment: string | null;
  created_at: string;
  companies: {
    name: string;
  };
}

const supabase = useSupabaseClient();
const searchQuery = ref("");
const isLoading = ref(true);
const submissions = ref<Submission[]>([]);

const { data, error } = await useAsyncData("submissions", async () => {
  const { data, error } = await supabase
    .from("submissions")
    .select("*, companies(name)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Submission[];
});

submissions.value = data.value ?? [];
isLoading.value = false;

const filteredSubmissions = computed(() => {
  if (!searchQuery.value.trim()) return submissions.value;
  const q = searchQuery.value.toLowerCase();
  return submissions.value.filter(
    (s) =>
      s.companies.name.toLowerCase().includes(q) ||
      s.position.toLowerCase().includes(q) ||
      s.industry.toLowerCase().includes(q),
  );
});

const resultBadgeClass = (result: string) => {
  switch (result) {
    case "Oferta":
      return "bg-green-100 text-green-800";
    case "Rechazo formal":
      return "bg-red-100 text-red-800";
    case "Ghost":
      return "bg-slate-100 text-slate-800";
    case "Desistí":
      return "bg-amber-100 text-amber-800";
    default:
      return "bg-slate-100 text-slate-600";
  }
};
</script>

<template>
  <div>
    <div class="mb-6">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Buscar por empresa, cargo o rubro..."
        class="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm shadow-sm focus:border-slate-500 focus:ring-1 focus:ring-slate-500 focus:outline-none"
      />
    </div>

    <div v-if="isLoading" class="py-12 text-center text-sm text-slate-500">
      Cargando datos...
    </div>

    <div
      v-else-if="filteredSubmissions.length === 0"
      class="py-12 text-center text-sm text-slate-500"
    >
      {{
        searchQuery
          ? "No se encontraron resultados para tu búsqueda."
          : "Aún no hay feedback registrado. ¡Sé el primero en compartir!"
      }}
    </div>

    <div v-else class="overflow-x-auto rounded-lg border border-slate-200">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Empresa
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Rubro
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Cargo
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Mes
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              ¿Respondieron?
            </th>
            <th
              class="px-4 py-3 text-center text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Etapas
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Última etapa
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Resultado
            </th>
            <th
              class="px-4 py-3 text-left text-xs font-semibold tracking-wider text-slate-600 uppercase"
            >
              Comentario
            </th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          <tr
            v-for="submission in filteredSubmissions"
            :key="submission.id"
            class="hover:bg-slate-50"
          >
            <td class="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
              {{ submission.companies.name }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
              {{ submission.industry }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">
              {{ submission.position }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
              {{ submission.application_month }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">
              {{ submission.response_time }}
            </td>
            <td class="px-4 py-3 text-center text-sm text-slate-600">
              {{ submission.stages_reached }}
            </td>
            <td class="px-4 py-3 text-sm text-slate-600">
              {{ submission.last_stage ?? "—" }}
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm">
              <span
                class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium"
                :class="resultBadgeClass(submission.result)"
              >
                {{ submission.result }}
              </span>
            </td>
            <td class="max-w-xs px-4 py-3 text-sm text-slate-500">
              {{ submission.comment ?? "—" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p
      v-if="filteredSubmissions.length > 0"
      class="mt-3 text-xs text-slate-400"
    >
      Mostrando {{ filteredSubmissions.length }} resultado{{
        filteredSubmissions.length !== 1 ? "s" : ""
      }}
    </p>
  </div>
</template>
