import { createError, defineEventHandler } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import type { PositionListItem } from "~~/shared/utils/positionStats";

export default defineEventHandler(async (event): Promise<PositionListItem[]> => {
  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase.rpc("get_positions_index");

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener los cargos.",
    });
  }

  return data ?? [];
});
