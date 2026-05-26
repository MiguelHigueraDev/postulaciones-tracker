import { createError, defineEventHandler, getRouterParam } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import { buildCompanyStats } from "~~/shared/utils/companyStats";

export default defineEventHandler(async (event) => {
  const slug = decodeURIComponent(getRouterParam(event, "slug") ?? "").trim();

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Empresa inválida",
    });
  }

  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase.rpc("get_company_stats", {
    p_name_normalized: slug,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener los datos.",
    });
  }

  if (!data) {
    return { company: null, stats: null };
  }

  return {
    company: data.company,
    stats: buildCompanyStats(data.stats),
  };
});
