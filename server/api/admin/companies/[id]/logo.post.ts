import {
  createError,
  defineEventHandler,
  getRouterParam,
  readMultipartFormData,
} from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { invalidateCompaniesCaches } from "~~/server/utils/invalidateCompaniesCaches";
import {
  ALLOWED_MIME_TYPES,
  LOGO_BUCKET,
  MAX_LOGO_BYTES,
  extensionForMime,
} from "~~/server/utils/companyLogo";
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

  const form = await readMultipartFormData(event);
  const filePart = form?.find((part) => part.name === "logo" && part.data);

  if (!filePart?.data || !filePart.type) {
    throw createError({
      statusCode: 400,
      message: "Debes enviar un archivo de logo.",
    });
  }

  const mime = filePart.type.toLowerCase();

  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw createError({
      statusCode: 400,
      message: "Formato no permitido. Usa PNG, JPEG, WebP o SVG.",
    });
  }

  if (filePart.data.byteLength > MAX_LOGO_BYTES) {
    throw createError({
      statusCode: 400,
      message: "El logo no puede superar 512 KB.",
    });
  }

  const extension = extensionForMime(mime);

  if (!extension) {
    throw createError({
      statusCode: 400,
      message: "Formato no permitido.",
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
      message: "No pudimos actualizar el logo.",
    });
  }

  if (!company) {
    throw createError({
      statusCode: 404,
      message: "Empresa no encontrada",
    });
  }

  const { data: existingObjects, error: listError } = await supabase.storage
    .from(LOGO_BUCKET)
    .list(companyId);

  if (listError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos subir el logo.",
    });
  }

  const logoPaths =
    existingObjects
      ?.filter((obj) => obj.name.startsWith("logo."))
      .map((obj) => `${companyId}/${obj.name}`) ?? [];

  if (logoPaths.length > 0) {
    const { error: removeError } = await supabase.storage
      .from(LOGO_BUCKET)
      .remove(logoPaths);

    if (removeError) {
      throw createError({
        statusCode: 500,
        message: "No pudimos subir el logo.",
      });
    }
  }

  const storagePath = `${companyId}/logo.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(storagePath, filePart.data, {
      contentType: mime,
      upsert: true,
    });

  if (uploadError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos subir el logo.",
    });
  }

  const { data: publicUrlData } = supabase.storage
    .from(LOGO_BUCKET)
    .getPublicUrl(storagePath);

  const logoUrl = publicUrlData.publicUrl;

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo_url: logoUrl })
    .eq("id", companyId);

  if (updateError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos guardar el logo.",
    });
  }

  await invalidateCompaniesCaches("logo upload");

  return { logo_url: logoUrl };
});
