import {
  createError,
  defineEventHandler,
  getQuery,
  getRouterParam,
} from "h3";
import { serverSupabaseClient } from "#supabase/server";
import {
  SUBMISSIONS_PAGE_SIZE,
  type CompanySubmission,
  type PaginatedSubmissions,
  type SubmissionCursor,
} from "~~/shared/utils/companyStats";

const MAX_PAGE_SIZE = 50;

function quoteFilterValue(value: string): string {
  return `"${value.replace(/"/g, '\\"')}"`;
}

export default defineEventHandler(async (event): Promise<PaginatedSubmissions> => {
  const slug = decodeURIComponent(getRouterParam(event, "slug") ?? "").trim();
  const query = getQuery(event);

  if (!slug) {
    throw createError({
      statusCode: 400,
      message: "Empresa inválida",
    });
  }

  const limit = Math.min(
    Math.max(Number(query.limit) || SUBMISSIONS_PAGE_SIZE, 1),
    MAX_PAGE_SIZE,
  );
  const cursorCreatedAt =
    typeof query.cursorCreatedAt === "string" ? query.cursorCreatedAt : undefined;
  const cursorId =
    typeof query.cursorId === "string" ? query.cursorId : undefined;

  if (Boolean(cursorCreatedAt) !== Boolean(cursorId)) {
    throw createError({
      statusCode: 400,
      message: "Cursor de paginación inválido",
    });
  }

  const supabase = await serverSupabaseClient(event);

  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("id")
    .eq("name_normalized", slug)
    .maybeSingle();

  if (companyError) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener los registros.",
    });
  }

  if (!company) {
    throw createError({
      statusCode: 404,
      message: "Empresa no encontrada",
    });
  }

  let request = supabase
    .from("submissions")
    .select(
      "id, industry, position, application_month, response_time, stages_reached, last_stage, result, comment, created_at",
    )
    .eq("company_id", company.id)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit + 1);

  if (cursorCreatedAt && cursorId) {
    const createdAt = quoteFilterValue(cursorCreatedAt);
    const id = quoteFilterValue(cursorId);
    request = request.or(
      `created_at.lt.${createdAt},and(created_at.eq.${createdAt},id.lt.${id})`,
    );
  }

  const { data, error } = await request;

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener los registros.",
    });
  }

  const rows = (data ?? []) as CompanySubmission[];
  const hasMore = rows.length > limit;
  const submissions = hasMore ? rows.slice(0, limit) : rows;

  let nextCursor: SubmissionCursor | null = null;
  if (hasMore && submissions.length > 0) {
    const last = submissions[submissions.length - 1]!;
    nextCursor = {
      createdAt: last.created_at,
      id: last.id,
    };
  }

  return { submissions, nextCursor };
});
