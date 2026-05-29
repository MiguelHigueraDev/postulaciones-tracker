import { createError, defineEventHandler, getRequestIP, readBody } from "h3";
import { serverSupabaseServiceRole } from "#supabase/server";
import { feedbackSubmitSchema } from "~~/shared/schemas/feedback";
import { verifyTurnstileToken } from "~~/server/utils/verifyTurnstile";
import { invalidateCompaniesOverview } from "~~/server/utils/companiesOverviewCache";

const rateLimit = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimit.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimit.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS;
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? "unknown";

  if (isRateLimited(ip)) {
    throw createError({
      statusCode: 429,
      statusMessage: "Too Many Requests",
      message:
        "Has enviado demasiados feedbacks. Intenta de nuevo en un minuto.",
    });
  }

  const body = await readBody(event);
  const parsed = feedbackSubmitSchema.safeParse(body);

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    });
  }

  const { turnstileToken, _hp, p_include_profile: _, ...input } = parsed.data;

  if (_hp) {
    throw createError({
      statusCode: 400,
      message: "Datos inválidos",
    });
  }

  const config = useRuntimeConfig(event);
  const turnstileValid = await verifyTurnstileToken(
    config.turnstileSecretKey,
    turnstileToken,
    ip,
  );

  if (!turnstileValid) {
    throw createError({
      statusCode: 403,
      message: "No pudimos verificar el envío. Por favor intenta de nuevo.",
    });
  }

  const client = serverSupabaseServiceRole(event);

  const { data, error } = await client.rpc("submit_feedback", {
    p_company_name: input.p_company_name,
    p_industry: input.p_industry,
    p_position: input.p_position,
    p_application_month: input.p_application_month,
    p_response_time: input.p_response_time,
    p_stages_reached: input.p_stages_reached,
    p_last_stage: input.p_last_stage ?? undefined,
    p_result: input.p_result,
    p_comment: input.p_comment ?? undefined,
    p_salary: input.p_salary ?? undefined,
    p_good_things: input.p_good_things ?? undefined,
    p_bad_things: input.p_bad_things ?? undefined,
    p_benefits: input.p_benefits ?? undefined,
    p_modality: input.p_modality ?? undefined,
    p_rating_work_environment: input.p_rating_work_environment ?? undefined,
    p_rating_work_life_balance: input.p_rating_work_life_balance ?? undefined,
    p_rating_career_opportunities: input.p_rating_career_opportunities ?? undefined,
    p_rating_compensation_benefits: input.p_rating_compensation_benefits ?? undefined,
  });

  if (error) {
    throw createError({
      statusCode: 500,
      message: "Error al guardar el feedback.",
    });
  }

  await invalidateCompaniesOverview();

  return { id: data };
});
