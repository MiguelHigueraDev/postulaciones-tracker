function formatDecimal(value: number, decimals: number): string {
  if (value % 1 === 0) return String(value);
  return value.toFixed(decimals);
}

/** Compact CLP display for stats cards (e.g. $1.8M, $850K). */
export function formatCompactSalary(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (abs >= 1_000_000) {
    return `${sign}$${formatDecimal(abs / 1_000_000, 1)}M`;
  }

  if (abs >= 10_000) {
    return `${sign}$${formatDecimal(abs / 1_000, 1)}K`;
  }

  return `${sign}$${abs.toLocaleString("es-CL")}`;
}
