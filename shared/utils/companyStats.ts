import { RESULT_STATS_ORDER } from "~~/shared/constants/resultStyles";
import { RESPONSE_TIME_OPTIONS } from "~~/shared/schemas/feedback";

export interface WorkplaceProfile {
  salary: number | null;
  good_things: string | null;
  bad_things: string | null;
  benefits: string | null;
  modality: string | null;
  rating_work_environment: number | null;
  rating_work_life_balance: number | null;
  rating_career_opportunities: number | null;
  rating_compensation_benefits: number | null;
}

export interface CompanySubmission {
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
  workplace_profile?: WorkplaceProfile | null;
}

export interface CountEntry {
  key: string;
  count: number;
  percent: number;
}

export interface WorkplaceStats {
  count: number;
  salary: {
    count: number;
    avg: number | null;
    min: number | null;
    max: number | null;
    median: number | null;
  };
  ratings: {
    count: number;
    workEnvironment: number | null;
    workLifeBalance: number | null;
    careerOpportunities: number | null;
    compensationBenefits: number | null;
    overall: number | null;
  };
  modalities: CountEntry[];
}

export interface CompanyStats {
  total: number;
  results: CountEntry[];
  responseTimes: CountEntry[];
  stages: {
    average: number;
    min: number;
    max: number;
  };
  lastStages: CountEntry[];
  industries: CountEntry[];
  positions: CountEntry[];
  workplace: WorkplaceStats | null;
}

export interface CompanyInfo {
  id: string;
  name: string;
  name_normalized: string;
}

interface RawCountEntry {
  key: string;
  count: number;
}

export interface RawWorkplacePayload {
  count: number;
  salary_avg: number | null;
  salary_min: number | null;
  salary_max: number | null;
  salary_median: number | null;
  salary_count: number;
  avg_work_environment: number | string | null;
  avg_work_life_balance: number | string | null;
  avg_career_opportunities: number | string | null;
  avg_compensation_benefits: number | string | null;
  ratings_count: number;
  modalities: RawCountEntry[];
}

export interface RawCompanyStatsPayload {
  total: number;
  results: RawCountEntry[];
  response_times: RawCountEntry[];
  stages: {
    average: number | string;
    min: number;
    max: number;
  };
  last_stages: RawCountEntry[];
  industries: RawCountEntry[];
  positions: RawCountEntry[];
  workplace: RawWorkplacePayload | null;
}

function countsByOrder(
  raw: RawCountEntry[],
  orderedKeys: readonly string[],
  total: number,
): CountEntry[] {
  const map = new Map(raw.map((entry) => [entry.key, entry.count]));
  return orderedKeys.map((key) => {
    const count = map.get(key) ?? 0;
    return {
      key,
      count,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });
}

function countsWithPercent(raw: RawCountEntry[], total: number): CountEntry[] {
  return raw.map(({ key, count }) => ({
    key,
    count,
    percent: total > 0 ? Math.round((count / total) * 100) : 0,
  }));
}

function toNum(val: number | string | null): number | null {
  if (val === null) return null;
  const n = Number(val);
  return Number.isNaN(n) ? null : n;
}

function buildWorkplaceStats(
  raw: RawWorkplacePayload | null,
): WorkplaceStats | null {
  if (!raw || raw.count === 0) return null;

  const ratings = [
    toNum(raw.avg_work_environment),
    toNum(raw.avg_work_life_balance),
    toNum(raw.avg_career_opportunities),
    toNum(raw.avg_compensation_benefits),
  ].filter((v): v is number => v !== null);

  const overall =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
        10
      : null;

  const modalityTotal = raw.modalities.reduce((s, m) => s + m.count, 0);

  return {
    count: raw.count,
    salary: {
      count: raw.salary_count,
      avg: toNum(raw.salary_avg),
      min: toNum(raw.salary_min),
      max: toNum(raw.salary_max),
      median: toNum(raw.salary_median),
    },
    ratings: {
      count: raw.ratings_count,
      workEnvironment: toNum(raw.avg_work_environment),
      workLifeBalance: toNum(raw.avg_work_life_balance),
      careerOpportunities: toNum(raw.avg_career_opportunities),
      compensationBenefits: toNum(raw.avg_compensation_benefits),
      overall,
    },
    modalities: countsWithPercent(raw.modalities, modalityTotal),
  };
}

export interface GlobalStatsResponse {
  stats: CompanyStats;
}

export function buildCompanyStats(raw: RawCompanyStatsPayload): CompanyStats {
  const total = raw.total;

  return {
    total,
    results: countsByOrder(raw.results, RESULT_STATS_ORDER, total),
    responseTimes: countsByOrder(
      raw.response_times,
      RESPONSE_TIME_OPTIONS,
      total,
    ),
    stages: {
      average: Number(raw.stages.average),
      min: raw.stages.min,
      max: raw.stages.max,
    },
    lastStages: countsWithPercent(raw.last_stages, total),
    industries: countsWithPercent(raw.industries, total),
    positions: countsWithPercent(raw.positions, total),
    workplace: buildWorkplaceStats(raw.workplace),
  };
}

export interface SubmissionCursor {
  createdAt: string;
  id: string;
}

export interface PaginatedSubmissions {
  submissions: CompanySubmission[];
  nextCursor: SubmissionCursor | null;
}

export const SUBMISSIONS_PAGE_SIZE = 8;

export interface GlobalSubmission extends CompanySubmission {
  company_name: string;
  company_slug: string;
}

export interface PaginatedAllSubmissions {
  submissions: GlobalSubmission[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const ALL_SUBMISSIONS_PAGE_SIZE = 20;
