export type ResultKey = "Oferta" | "Rechazo formal" | "Ghost" | "Desistí";

/** Display order for stats charts: ghost → rechazo → desistí → oferta */
export const RESULT_STATS_ORDER: readonly ResultKey[] = [
  "Ghost",
  "Rechazo formal",
  "Desistí",
  "Oferta",
];

export interface ResultStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

export const RESULT_STYLES: Record<ResultKey, ResultStyle> = {
  Oferta: {
    label: "Oferta",
    color: "var(--color-positive)",
    bg: "var(--color-positive-bg)",
    border: "var(--color-positive-border)",
    dot: "#34d399",
  },
  "Rechazo formal": {
    label: "Rechazo",
    color: "var(--color-negative)",
    bg: "var(--color-negative-bg)",
    border: "var(--color-negative-border)",
    dot: "#f87171",
  },
  Ghost: {
    label: "Ghost",
    color: "var(--color-ghost)",
    bg: "var(--color-ghost-bg)",
    border: "var(--color-ghost-border)",
    dot: "#94a3b8",
  },
  Desistí: {
    label: "Desistí",
    color: "var(--color-yield)",
    bg: "var(--color-yield-bg)",
    border: "var(--color-yield-border)",
    dot: "#fbbf24",
  },
};

export function getResultStyle(result: string): ResultStyle {
  return (
    RESULT_STYLES[result as ResultKey] ?? {
      label: result,
      color: "var(--color-text-muted)",
      bg: "var(--color-surface-alt)",
      border: "var(--color-border)",
      dot: "var(--color-text-subtle)",
    }
  );
}
