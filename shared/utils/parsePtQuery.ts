export function parsePtQueryCommand(
  input: string,
): { company: string } | null {
  const trimmed = input.trim();
  const match = trimmed.match(
    /^pt\s+query\s+--company\s+(?:"([^"]*)"|'([^']*)'|(\S+))\s*$/i,
  );
  if (!match) return null;

  const company = (match[1] ?? match[2] ?? match[3] ?? "").trim();
  if (!company) return null;

  return { company: company.toLowerCase() };
}
