export function parseSubmissionsPage(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

export function parseSubmissionsSearch(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function shouldShowSubmissionsTable(
  query: Record<string, unknown>,
): boolean {
  if (query.tabla === "1" || query.tabla === "") return true;
  if (parseSubmissionsSearch(query.q).trim()) return true;
  return parseSubmissionsPage(query.page) > 1;
}

export function patchRouteQuery(
  current: Record<string, unknown>,
  patch: Record<string, string | undefined>,
): Record<string, string> | null {
  const query = { ...current } as Record<string, string>;
  let changed = false;

  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === "") {
      if (key in query) {
        delete query[key];
        changed = true;
      }
      continue;
    }

    if (query[key] !== value) {
      query[key] = value;
      changed = true;
    }
  }

  return changed ? query : null;
}
