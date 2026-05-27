import { createError, defineEventHandler, getQuery } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import {
  ALL_SUBMISSIONS_PAGE_SIZE,
  type GlobalSubmission,
  type PaginatedAllSubmissions,
} from "~~/shared/utils/companyStats";

const MAX_PAGE_SIZE = 50;

type WorkplaceProfileRow = {
  salary: number | null;
  good_things: string | null;
  bad_things: string | null;
  benefits: string | null;
  modality: string | null;
  rating_work_environment: number | null;
  rating_work_life_balance: number | null;
  rating_career_opportunities: number | null;
  rating_compensation_benefits: number | null;
} | null;

type SubmissionRow = {
  id: string;
  industry: string;
  position: string;
  application_month: string;
  response_time: string;
  stages_reached: number;
  last_stage: string | null;
  result: string;
  comment: string | null;
  created_at: string;
  companies: { name: string; name_normalized: string } | null;
  workplace_profiles: WorkplaceProfileRow;
};

function ilikePattern(q: string): string {
  return `%${q}%`;
}

export default defineEventHandler(
  async (event): Promise<PaginatedAllSubmissions> => {
    const query = getQuery(event);
    const page = Math.max(Number(query.page) || 1, 1);
    const limit = Math.min(
      Math.max(Number(query.limit) || ALL_SUBMISSIONS_PAGE_SIZE, 1),
      MAX_PAGE_SIZE,
    );
    const q = typeof query.q === "string" ? query.q.trim() : "";
    const offset = (page - 1) * limit;

    const supabase = await serverSupabaseClient(event);

    const selectFields =
      "id, industry, position, application_month, response_time, stages_reached, last_stage, result, comment, created_at, companies(name, name_normalized), workplace_profiles(salary, good_things, bad_things, benefits, modality, rating_work_environment, rating_work_life_balance, rating_career_opportunities, rating_compensation_benefits)";

    let matchingCompanyIds: string[] | null = null;

    if (q) {
      const { data: companies, error: companiesError } = await supabase
        .from("companies")
        .select("id")
        .ilike("name", ilikePattern(q));

      if (companiesError) {
        throw createError({
          statusCode: 500,
          message: "No pudimos obtener los registros.",
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
        message: "No pudimos obtener los registros.",
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
      .select(selectFields)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    dataRequest = applySearch(dataRequest);

    const { data, error } = await dataRequest;

    if (error) {
      throw createError({
        statusCode: 500,
        message: "No pudimos obtener los registros.",
      });
    }

    const submissions: GlobalSubmission[] = ((data ?? []) as SubmissionRow[]).map(
      (row) => ({
        id: row.id,
        industry: row.industry,
        position: row.position,
        application_month: row.application_month,
        response_time: row.response_time,
        stages_reached: row.stages_reached,
        last_stage: row.last_stage,
        result: row.result,
        comment: row.comment,
        created_at: row.created_at,
        company_name: row.companies?.name ?? "—",
        company_slug: row.companies?.name_normalized ?? "",
        workplace_profile: row.workplace_profiles ?? null,
      }),
    );

    return {
      submissions,
      total,
      page,
      pageSize: limit,
      totalPages,
    };
  },
);
