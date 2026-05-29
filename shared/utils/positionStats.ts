import { RESULT_STATS_ORDER } from "~~/shared/constants/resultStyles";
import { RESPONSE_TIME_OPTIONS } from "~~/shared/schemas/feedback";
import {
  buildWorkplaceStats,
  type CountEntry,
  type RawWorkplacePayload,
  type WorkplaceStats,
} from "~~/shared/utils/companyStats";

export interface PositionInfo {
  slug: string;
  label: string;
}

export interface PositionListItem {
  slug: string;
  label: string;
  count: number;
}

export interface PositionTopCompany {
  name: string;
  slug: string;
  overall: number | null;
  ratings_count: number;
}

export interface PositionCompanyEntry extends CountEntry {
  slug: string;
}

export interface PositionStats {
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
  companies: PositionCompanyEntry[];
  workplace: WorkplaceStats | null;
  topCompaniesByRating: PositionTopCompany[];
}

interface RawCountEntry {
  key: string;
  count: number;
}

interface RawCompanyEntry extends RawCountEntry {
  slug: string;
}

interface RawTopCompanyByRating {
  name: string;
  slug: string;
  overall: number | string | null;
  ratings_count: number;
}

export interface RawPositionStatsPayload {
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
  companies: RawCompanyEntry[];
  workplace: RawWorkplacePayload | null;
  top_companies_by_rating: RawTopCompanyByRating[];
}

export interface PositionStatsResponse {
  position: PositionInfo | null;
  stats: PositionStats | null;
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

/**
 * Mirror of the SQL slug used by `get_position_stats`:
 *   lower(regexp_replace(trim(position), '\s+', '-', 'g'))
 *
 * We intentionally do NOT strip accents to stay byte-for-byte aligned with the
 * SQL expression and the functional index. Use this whenever building a link
 * to /cargos/[slug].
 */
export function slugifyPosition(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

export function buildPositionStats(raw: RawPositionStatsPayload): PositionStats {
  const total = raw.total;

  return {
    total,
    results: countsByOrder(raw.results, RESULT_STATS_ORDER, total),
    responseTimes: countsByOrder(raw.response_times, RESPONSE_TIME_OPTIONS, total),
    stages: {
      average: Number(raw.stages.average),
      min: raw.stages.min,
      max: raw.stages.max,
    },
    lastStages: countsWithPercent(raw.last_stages, total),
    industries: countsWithPercent(raw.industries, total),
    companies: raw.companies.map(({ key, count, slug }) => ({
      key,
      count,
      slug,
      percent: total > 0 ? Math.round((count / total) * 100) : 0,
    })),
    workplace: buildWorkplaceStats(raw.workplace),
    topCompaniesByRating: raw.top_companies_by_rating.map((entry) => ({
      name: entry.name,
      slug: entry.slug,
      overall: toNum(entry.overall),
      ratings_count: entry.ratings_count,
    })),
  };
}
