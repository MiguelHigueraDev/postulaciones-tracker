import { createError, defineEventHandler } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import type { CompanyListItem } from "~~/shared/types/company";

export default defineEventHandler(async (event) => {
  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase
    .from("companies")
    .select("id, name, name_normalized")
    .order("name");

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener las empresas.",
    });
  }

  return (data ?? []) as CompanyListItem[];
});
