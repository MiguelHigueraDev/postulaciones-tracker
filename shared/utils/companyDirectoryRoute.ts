export const COMPANY_DIRECTORY_SORTS = [
  "reviews",
  "name",
  "ghost",
  "accept",
  "rating",
] as const;

export type CompanyDirectorySort = (typeof COMPANY_DIRECTORY_SORTS)[number];

export function parseCompanyDirectorySearch(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function parseCompanyDirectorySort(value: unknown): CompanyDirectorySort {
  if (
    typeof value === "string" &&
    (COMPANY_DIRECTORY_SORTS as readonly string[]).includes(value)
  ) {
    return value as CompanyDirectorySort;
  }
  return "reviews";
}
