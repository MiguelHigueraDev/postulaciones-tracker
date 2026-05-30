import { createError, defineEventHandler, getRouterParam } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { invalidateCompaniesCaches } from "~~/server/utils/invalidateCompaniesCaches";
import { requireAdmin } from "~~/server/utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const id = getRouterParam(event, "id")?.trim();

  if (!id) {
    throw createError({
      statusCode: 400,
      message: "Reseña inválida",
    });
  }

  const supabase = serverSupabaseServiceRole(event);

  const { error } = await supabase.from("submissions").delete().eq("id", id);

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos eliminar la reseña.",
    });
  }

  await invalidateCompaniesCaches("submission delete");

  return { ok: true };
});
