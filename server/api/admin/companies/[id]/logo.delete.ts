import { createError, defineEventHandler, getRouterParam } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { invalidateCompaniesOverview } from "~~/server/utils/companiesOverviewCache";
import { LOGO_BUCKET } from "~~/server/utils/companyLogo";
import { requireAdmin } from "~~/server/utils/requireAdmin";

export default defineEventHandler(async (event) => {
  await requireAdmin(event);

  const companyId = getRouterParam(event, "id")?.trim();

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: "Empresa inválida",
    });
  }

  const supabase = serverSupabaseServiceRole(event);

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id, logo_url")
    .eq("id", companyId)
    .maybeSingle();

  if (companyError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos eliminar el logo.",
    });
  }

  if (!company) {
    throw createError({
      statusCode: 404,
      message: "Empresa no encontrada",
    });
  }

  const { data: objects, error: listError } = await supabase.storage
    .from(LOGO_BUCKET)
    .list(companyId);

  if (listError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos eliminar el logo.",
    });
  }

  if (objects && objects.length > 0) {
    const paths = objects.map((obj) => `${companyId}/${obj.name}`);
    const { error: removeError } = await supabase.storage
      .from(LOGO_BUCKET)
      .remove(paths);

    if (removeError) {
      throw createError({
        statusCode: 500,
        message: "No pudimos eliminar el logo.",
      });
    }
  }

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_url: null })
    .eq("id", companyId);

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos eliminar el logo.",
    });
  }

  await invalidateCompaniesOverview();

  return { ok: true };
});
