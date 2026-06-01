function formatDecimal(value: number, decimals: number): string {
  if (value % 1 === 0) return String(value);
  return value.toFixed(decimals);
}

/** Compact Spanish label for weighted average response time in days. */
export function formatAvgResponseDays(days: number | null): string | null {
  if (days == null || Number.isNaN(days)) return null;

  if (days < 7) {
    const rounded = Math.round(days);
    return `≈ ${rounded} ${rounded === 1 ? "día" : "días"}`;
  }

  const weeks = days / 7;
  return `≈ ${formatDecimal(weeks, 1)} sem`;
}
