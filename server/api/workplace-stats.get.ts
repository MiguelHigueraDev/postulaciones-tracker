import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import {
  buildWorkplaceStats,
  type RawWorkplacePayload,
} from "~~/shared/utils/companyStats";

interface WorkplaceStatsRow {
  positions: { key: string; count: number }[];
  workplace: RawWorkplacePayload | null;
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const company =
    typeof query.company === "string" ? query.company.trim() : undefined;
  const position =
    typeof query.position === "string" ? query.position.trim() : undefined;

  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase.rpc("get_workplace_stats", {
    p_name_normalized: company || null,
    p_position: position || null,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener los datos.",
    });
  }

  if (!data) {
    throw createError({
      statusCode: 404,
      message: "Empresa no encontrada",
    });
  }

  const row = data as WorkplaceStatsRow;

  return {
    positions: row.positions.map(({ key, count }) => ({ key, count })),
    workplace: buildWorkplaceStats(row.workplace),
  };
});
