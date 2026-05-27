export type ResultKey =
  | "Oferta - Aceptada"
  | "Oferta - Rechazada"
  | "Rechazo formal"
  | "Ghost"
  | "Desistí";

/** Display order for stats charts: ghost → rechazo → desistí → oferta rechazada → oferta aceptada */
export const RESULT_STATS_ORDER: readonly ResultKey[] = [
  "Ghost",
  "Rechazo formal",
  "Desistí",
  "Oferta - Rechazada",
  "Oferta - Aceptada",
];

export interface ResultStyle {
  label: string;
  color: string;
  bg: string;
  border: string;
  dot: string;
}

export const RESULT_STYLES: Record<ResultKey, ResultStyle> = {
  "Oferta - Aceptada": {
    label: "Oferta aceptada",
    color: "var(--color-positive)",
    bg: "var(--color-positive-bg)",
    border: "var(--color-positive-border)",
    dot: "#34d399",
  },
  "Oferta - Rechazada": {
    label: "Oferta rechazada",
    color: "var(--color-yield)",
    bg: "var(--color-yield-bg)",
    border: "var(--color-yield-border)",
    dot: "#fb923c",
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

const LEGACY_ALIASES: Record<string, ResultKey> = {
  Oferta: "Oferta - Aceptada",
};

export function getResultStyle(result: string): ResultStyle {
  const key = LEGACY_ALIASES[result] ?? result;
  return (
    RESULT_STYLES[key as ResultKey] ?? {
      label: result,
      color: "var(--color-text-muted)",
      bg: "var(--color-surface-alt)",
      border: "var(--color-border)",
      dot: "var(--color-text-subtle)",
    }
  );
}
