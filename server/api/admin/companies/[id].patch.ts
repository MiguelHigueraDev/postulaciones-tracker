import {
  createError,
  defineEventHandler,
  getRouterParam,
  readBody,
} from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { invalidateCompaniesOverview } from "~~/server/utils/companiesOverviewCache";
import { requireAdmin } from "~~/server/utils/requireAdmin";
import type { AdminCompany, AdminCompanyUpdateBody } from "~~/shared/types/admin";
import { slugifyCompanyName } from "~~/shared/utils/companySlug";
import { sanitizePlainText } from "~~/shared/utils/sanitizeInput";

const MAX_NAME_LENGTH = 120;

export default defineEventHandler(async (event): Promise<AdminCompany> => {
  await requireAdmin(event);

  const companyId = getRouterParam(event, "id")?.trim();

  if (!companyId) {
    throw createError({
      statusCode: 400,
      message: "Empresa inválida",
    });
  }

  const body = await readBody<AdminCompanyUpdateBody>(event);
  const rawName = typeof body?.name === "string" ? body.name : "";
  const name = sanitizePlainText(rawName);

  if (!name) {
    throw createError({
      statusCode: 400,
      message: "El nombre de la empresa es obligatorio.",
    });
  }

  if (name.length > MAX_NAME_LENGTH) {
    throw createError({
      statusCode: 400,
      message: `El nombre no puede superar ${MAX_NAME_LENGTH} caracteres.`,
    });
  }

  const nameNormalized = slugifyCompanyName(name);

  if (!nameNormalized) {
    throw createError({
      statusCode: 400,
      message: "El nombre de la empresa es obligatorio.",
    });
  }

  const supabase = serverSupabaseServiceRole(event);

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .maybeSingle();

  if (companyError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos actualizar la empresa.",
    });
  }

  if (!company) {
    throw createError({
      statusCode: 404,
      message: "Empresa no encontrada",
    });
  }

  const { data: conflict, error: conflictError } = await supabase
    .from("companies")
    .select("id")
    .eq("name_normalized", nameNormalized)
    .neq("id", companyId)
    .maybeSingle();

  if (conflictError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos actualizar la empresa.",
    });
  }

  if (conflict) {
    throw createError({
      statusCode: 409,
      message: "Ya existe otra empresa con ese nombre.",
    });
  }

  const { data: updated, error: updateError } = await supabase
    .from("companies")
    .update({ name, name_normalized: nameNormalized })
    .eq("id", companyId)
    .select("id, name, name_normalized, logo_url")
    .single();

  if (updateError) {
    if (updateError.code === "23505") {
      throw createError({
        statusCode: 409,
        message: "Ya existe otra empresa con ese nombre.",
      });
    }

    throw createError({
      statusCode: 500,
      message: "No pudimos actualizar la empresa.",
    });
  }

  try {
    await invalidateCompaniesOverview();
  } catch (error) {
    console.error("Failed to invalidate companies overview cache", error);
  }

  return updated;
});
