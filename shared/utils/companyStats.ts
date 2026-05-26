import { RESULT_STATS_ORDER } from "~~/shared/constants/resultStyles";
import { RESPONSE_TIME_OPTIONS } from "~~/shared/schemas/feedback";

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
}

export interface CountEntry {
  key: string;
  count: number;
  percent: number;
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
