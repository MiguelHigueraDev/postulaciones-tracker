import { createError, defineEventHandler } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import {
  buildCompanyStats,
  type GlobalStatsResponse,
  type RawCompanyStatsPayload,
} from "~~/shared/utils/companyStats";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase.rpc("get_global_stats");

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener los datos.",
    });
  }

  return {
    stats: buildCompanyStats(data as RawCompanyStatsPayload),
  } satisfies GlobalStatsResponse;
});
