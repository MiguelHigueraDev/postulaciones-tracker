import { z } from "zod/v4";

export const INDUSTRY_OPTIONS = [
  "Tech",
  "Finanzas",
  "Retail",
  "Industrial",
  "Salud",
  "Educación",
  "Otro",
] as const;

export const RESPONSE_TIME_OPTIONS = [
  "Sí - en menos de 1 semana",
  "Sí - en 1-2 semanas",
  "Sí - en más de 2 semanas",
  "Nunca (ghost)",
] as const;

export const LAST_STAGE_OPTIONS = [
  "Después de filtro RRHH",
  "Después de prueba o assessment",
  "Después de entrevista técnica",
  "Después de entrevista final",
  "Tuve respuesta hasta el final",
] as const;

export const RESULT_OPTIONS = [
  "Ghost",
  "Rechazo formal",
  "Oferta",
  "Desistí",
] as const;

export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
] as const;

export const feedbackSchema = z.object({
  p_company_name: z.string().trim().min(1, "El nombre de empresa es requerido"),
  p_industry: z.enum(INDUSTRY_OPTIONS),
  p_position: z.string().trim().min(1, "El cargo es requerido"),
  p_application_month: z.string().trim().min(1, "El mes de postulación es requerido"),
  p_response_time: z.enum(RESPONSE_TIME_OPTIONS),
  p_stages_reached: z.number().int().min(0).max(20).default(0),
  p_last_stage: z.enum(LAST_STAGE_OPTIONS).nullable().default(null),
  p_result: z.enum(RESULT_OPTIONS),
  p_comment: z
    .string()
    .trim()
    .max(280, "El comentario no puede exceder 280 caracteres")
    .nullable()
    .default(null),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
