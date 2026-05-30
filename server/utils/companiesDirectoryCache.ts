import { createError, type H3Event } from "h3";
import { serverSupabaseClient } from "#supabase/server";
import type { CompanyOverviewItem } from "~~/shared/types/company";

const CACHE_KEY = "companies:directory";
const TTL_MS = 60 * 60 * 1000;

interface CacheEntry {
  data: CompanyOverviewItem[];
  cachedAt: number;
}

interface RawDirectoryRow {
  id: string;
  name: string;
  name_normalized: string;
  logo_url: string | null;
  review_count: number | string | null;
  avg_rating: number | string | null;
  accept_rate: number | string | null;
  ghost_rate: number | string | null;
}

function toNumberOrNull(value: number | string | null): number | null {
  return value === null ? null : Number(value);
}

function normalizeRows(rows: RawDirectoryRow[]): CompanyOverviewItem[] {
  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    name_normalized: row.name_normalized,
    logo_url: row.logo_url,
    review_count: Number(row.review_count ?? 0),
    avg_rating: toNumberOrNull(row.avg_rating),
    accept_rate: toNumberOrNull(row.accept_rate),
    ghost_rate: toNumberOrNull(row.ghost_rate),
  }));
}

async function fetchDirectory(event: H3Event): Promise<CompanyOverviewItem[]> {
  const supabase = await serverSupabaseClient(event);
  const { data, error } = await supabase.rpc("get_companies_directory");

  if (error) {
    throw createError({
      statusCode: 500,
      message: "No pudimos obtener las empresas.",
    });
  }

  return normalizeRows((data ?? []) as RawDirectoryRow[]);
}

export async function getCompaniesDirectory(
  event: H3Event,
): Promise<CompanyOverviewItem[]> {
  const storage = useStorage("cache");
  const cached = await storage.getItem<CacheEntry>(CACHE_KEY);

  if (cached && Date.now() - cached.cachedAt < TTL_MS) {
    return cached.data;
  }

  const data = await fetchDirectory(event);
  await storage.setItem<CacheEntry>(CACHE_KEY, { data, cachedAt: Date.now() });
  return data;
}

export async function invalidateCompaniesDirectory(): Promise<void> {
  await useStorage("cache").removeItem(CACHE_KEY);
}
