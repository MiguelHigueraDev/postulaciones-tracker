import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { requireAdmin } from "~~/server/utils/requireAdmin";
import type { AdminSubmissionsPage } from "~~/shared/types/admin";

const DEFAULT_PAGE_SIZE = 30;
const MAX_PAGE_SIZE = 30;

function ilikePattern(q: string): string {
  return `%${q}%`;
}

type SubmissionRow = {
  id: string;
  industry: string;
  position: string;
  result: string;
  comment: string | null;
  created_at: string;
  company_id: string;
  companies: { name: string; name_normalized: string } | null;
};

export default defineEventHandler(async (event): Promise<AdminSubmissionsPage> => {
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

  let matchingCompanyIds: string[] | null = null;

  if (q) {
    const { data: companies, error: companiesError } = await supabase
      .from("companies")
      .select("id")
      .ilike("name", ilikePattern(q));

    if (companiesError) {
      throw createError({
        statusCode: 500,
        message: "No pudimos obtener las reseñas.",
      });
    }

    matchingCompanyIds = companies?.map((c) => c.id) ?? [];
  }

  function applySearch<T extends { or: (filter: string) => T }>(request: T) {
    if (!q) return request;

    const pattern = ilikePattern(q);
    const filters = [
      `position.ilike.${pattern}`,
      `industry.ilike.${pattern}`,
      `comment.ilike.${pattern}`,
    ];

    if (matchingCompanyIds && matchingCompanyIds.length > 0) {
      filters.push(`company_id.in.(${matchingCompanyIds.join(",")})`);
    }

    return request.or(filters.join(","));
  }

  let countRequest = supabase
    .from("submissions")
    .select("id", { count: "exact", head: true });

  countRequest = applySearch(countRequest);

  const { count, error: countError } = await countRequest;

  if (countError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener las reseñas.",
    });
  }

  const total = count ?? 0;
  const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

  if (total === 0 || page > totalPages) {
    return {
      submissions: [],
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  }

  let dataRequest = supabase
    .from("submissions")
    .select(
      "id, industry, position, result, comment, created_at, company_id, companies(name, name_normalized)",
    )
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  dataRequest = applySearch(dataRequest);

  const { data, error } = await dataRequest;

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener las reseñas.",
    });
  }

  const submissions = ((data ?? []) as SubmissionRow[]).map((row) => ({
    id: row.id,
    industry: row.industry,
    position: row.position,
    result: row.result,
    comment: row.comment,
    created_at: row.created_at,
    company_id: row.company_id,
    company_name: row.companies?.name ?? "—",
    company_slug: row.companies?.name_normalized ?? "",
  }));

  return {
    submissions,
    total,
    page,
    pageSize: limit,
    totalPages,
  };
});
