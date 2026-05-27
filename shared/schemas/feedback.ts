import { z } from "zod/v4";
import {
  sanitizeComment,
  sanitizePlainText,
} from "~~/shared/utils/sanitizeInput";

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
  "Desistí",
  "Oferta - Aceptada",
  "Oferta - Rechazada",
] as const;

export const MODALITY_OPTIONS = ["Remoto", "Híbrido", "Presencial"] as const;

export const POSITION_OPTIONS = [
  "Android Developer",
  "Analista de datos",
  "Arquitecto de Software",
  "Arquitecto de Soluciones",
  "Backend Developer",
  "Científico de datos",
  "Ciberseguridad",
  "Cloud Engineer",
  "Data Engineer",
  "DevOps Engineer",
  "Embedded Developer",
  "Engineering Manager",
  "Frontend Developer",
  "Full-stack Developer",
  "iOS Developer",
  "Ingeniero de Machine Learning",
  "Ingeniero de Software",
  "Ingeniero QA",
  "Mobile Developer",
  "Product Manager",
  "Product Owner",
  "QA Engineer",
  "Scrum Master",
  "Site Reliability Engineer",
  "Software Engineer",
  "Tech Lead",
  "UI Designer",
  "UX Designer",
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

export const MIN_APPLICATION_YEAR = 2000;

export const MAX_COMPANY_NAME_LENGTH = 120;
export const MAX_POSITION_LENGTH = 120;
export const MAX_COMMENT_LENGTH = 1000;
export const MAX_SALARY_VALUE = 100_000_000;
export const MAX_PROFILE_TEXT_LENGTH = 500;
export const COMMENT_LENGTH_WARNING_OFFSET = 40;

function maxLengthMessage(label: string, max: number) {
  return `El ${label} no puede exceder ${max} caracteres`;
}

const monthPattern = MONTHS.map((m) =>
  m.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
).join("|");

const APPLICATION_MONTH_REGEX = new RegExp(`^(${monthPattern}) (20\\d{2})$`);

function sanitizedPlainText(
  max: number,
  requiredMessage: string,
  label: string,
) {
  return z
    .string()
    .transform(sanitizePlainText)
    .pipe(
      z.string().min(1, requiredMessage).max(max, maxLengthMessage(label, max)),
    );
}

const applicationMonthSchema = z
  .string()
  .transform(sanitizePlainText)
  .pipe(
    z
      .string()
      .regex(APPLICATION_MONTH_REGEX, "El mes de postulación es inválido")
      .refine((val) => {
        const year = Number(val.split(" ").pop());
        const current = new Date().getFullYear();
        return year >= MIN_APPLICATION_YEAR && year <= current;
      }, "El año de postulación es inválido"),
  );

const commentSchema = z
  .union([z.string(), z.null()])
  .transform((val) => {
    if (val === null || val === "") return null;
    const cleaned = sanitizeComment(val);
    return cleaned === "" ? null : cleaned;
  })
  .pipe(
    z.union([
      z.null(),
      z
        .string()
        .max(
          MAX_COMMENT_LENGTH,
          maxLengthMessage("comentario", MAX_COMMENT_LENGTH),
        ),
    ]),
  )
  .default(null);

const optionalSanitizedText = (max: number, label: string) =>
  z
    .union([z.string(), z.null()])
    .transform((val) => {
      if (val === null || val === "") return null;
      const cleaned = sanitizePlainText(val);
      return cleaned === "" ? null : cleaned;
    })
    .pipe(
      z.union([z.null(), z.string().max(max, maxLengthMessage(label, max))]),
    )
    .default(null);

const ratingSchema = z.number().int().min(1).max(5).nullable().default(null);

export const RATING_LABELS = {
  p_rating_work_environment: "Ambiente laboral",
  p_rating_work_life_balance: "Equilibrio vida-trabajo",
  p_rating_career_opportunities: "Oportunidades de carrera",
  p_rating_compensation_benefits: "Compensación y beneficios",
} as const;

export type RatingKey = keyof typeof RATING_LABELS;

const PROFILE_REQUIRED_MSG = "Este campo es requerido para el perfil laboral";

export const feedbackSchema = z
  .object({
    p_company_name: sanitizedPlainText(
      MAX_COMPANY_NAME_LENGTH,
      "El nombre de empresa es requerido",
      "nombre de empresa",
    ),
    p_industry: z.enum(INDUSTRY_OPTIONS),
    p_position: sanitizedPlainText(
      MAX_POSITION_LENGTH,
      "El cargo es requerido",
      "cargo",
    ),
    p_application_month: applicationMonthSchema,
    p_response_time: z.enum(RESPONSE_TIME_OPTIONS),
    p_stages_reached: z.number().int().min(0).max(20).default(0),
    p_last_stage: z.enum(LAST_STAGE_OPTIONS).nullable().default(null),
    p_result: z.enum(RESULT_OPTIONS),
    p_comment: commentSchema,
    p_include_profile: z.boolean().default(false),
    p_salary: z
      .number()
      .int()
      .min(0)
      .max(MAX_SALARY_VALUE)
      .nullable()
      .default(null),
    p_good_things: optionalSanitizedText(
      MAX_PROFILE_TEXT_LENGTH,
      "aspectos positivos",
    ),
    p_bad_things: optionalSanitizedText(
      MAX_PROFILE_TEXT_LENGTH,
      "aspectos negativos",
    ),
    p_benefits: optionalSanitizedText(MAX_PROFILE_TEXT_LENGTH, "beneficios"),
    p_modality: z.enum(MODALITY_OPTIONS).nullable().default(null),
    p_rating_work_environment: ratingSchema,
    p_rating_work_life_balance: ratingSchema,
    p_rating_career_opportunities: ratingSchema,
    p_rating_compensation_benefits: ratingSchema,
  })
  .check(
    z.refine((data) => {
      if (!data.p_include_profile) return true;
      return (
        data.p_salary != null &&
        data.p_good_things != null &&
        data.p_bad_things != null &&
        data.p_benefits != null &&
        data.p_modality != null &&
        data.p_rating_work_environment != null &&
        data.p_rating_work_life_balance != null &&
        data.p_rating_career_opportunities != null &&
        data.p_rating_compensation_benefits != null
      );
    }, PROFILE_REQUIRED_MSG),
  );

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const feedbackSubmitSchema = feedbackSchema.extend({
  turnstileToken: z.string().min(1).max(2048),
  _hp: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? "" : sanitizePlainText(val)))
    .pipe(z.string().max(0)),
  _formElapsedMs: z.number().int().min(2000).max(3_600_000),
});

export type FeedbackSubmitInput = z.infer<typeof feedbackSubmitSchema>;
