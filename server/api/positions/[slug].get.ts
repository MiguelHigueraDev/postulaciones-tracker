import { createError, defineEventHandler, getRouterParam } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import {
  buildPositionStats,
  type PositionStatsResponse,
} from "~~/shared/utils/positionStats";

export default defineEventHandler(
  async (event): Promise<PositionStatsResponse> => {
    const raw = decodeURIComponent(getRouterParam(event, "slug") ?? "").trim();

    if (!raw) {
      throw createError({
        statusCode: 400,
        message: "Cargo inválido",
      });
    }

    const slug = raw.toLowerCase();

    const supabase = await serverSupabaseClient(event);
    const { data, error } = await supabase.rpc("get_position_stats", {
      p_slug: slug,
    });

    if (error) {
      throw createError({
        statusCode: 500,
        message: "No pudimos obtener los datos.",
      });
    }

    if (!data) {
      return { position: null, stats: null };
    }

    return {
      position: data.position,
      stats: buildPositionStats(data.stats),
    };
  },
);
