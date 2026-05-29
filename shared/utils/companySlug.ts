/**
 * Mirror of the SQL slug used when upserting companies:
 *   lower(regexp_replace(trim(name), '\s+', '-', 'g'))
 */
export function slugifyCompanyName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}
