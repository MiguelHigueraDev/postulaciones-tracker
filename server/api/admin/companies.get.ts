import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAdmin } from "~~/server/utils/requireAdmin";
import type { AdminCompaniesPage } from "~~/shared/types/admin";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

function ilikePattern(q: string): string {
  return `%${q}%`;
}

export default defineEventHandler(async (event): Promise<AdminCompaniesPage> => {
  await requireAdmin(event);

  const query = getQuery(event);
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(
    Math.max(Number(query.limit) || DEFAULT_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const q = typeof query.q === "string" ? query.q.trim() : "";
  const offset = (page - 1) * limit;

  const supabase = serverSupabaseServiceRole(event);

  let countRequest = supabase
    .from("companies")
    .select("id", { count: "exact", head: true });

  if (q) {
    countRequest = countRequest.ilike("name", ilikePattern(q));
  }

  const { count, error: countError } = await countRequest;

  if (countError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener las empresas.",
    });
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  if (total === 0 || page > totalPages) {
    return {
      companies: [],
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }

  let dataRequest = supabase
    .from("companies")
    .select("id, name, name_normalized, logo_url")
    .order("name", { ascending: true })
    .range(offset, offset + limit - 1);

  if (q) {
    dataRequest = dataRequest.ilike("name", ilikePattern(q));
  }

  const { data, error } = await dataRequest;

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener las empresas.",
    });
  }

  return {
    companies: data ?? [],
    total,
    page,
    pageSize: limit,
    totalPages,
  };
});
