-- Extend directory/overview RPCs with offer rate, process averages, and workplace aggregates.

DROP FUNCTION IF EXISTS public.get_companies_directory();

CREATE OR REPLACE FUNCTION public.get_companies_directory()
RETURNS TABLE (
  id uuid,
  name text,
  name_normalized text,
  logo_url text,
  review_count int,
  avg_rating numeric,
  accept_rate numeric,
  ghost_rate numeric,
  offer_rate numeric,
  avg_stages numeric,
  avg_response_days numeric,
  remote_rate numeric,
  avg_salary numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT
    c.id,
    c.name,
    c.name_normalized,
    c.logo_url,
    count(s.id)::int AS review_count,
    (
      SELECT round(avg(r)::numeric, 1)
      FROM workplace_profiles wp
      JOIN submissions s2 ON s2.id = wp.submission_id
      CROSS JOIN LATERAL unnest(ARRAY[
        wp.rating_work_environment,
        wp.rating_work_life_balance,
        wp.rating_career_opportunities,
        wp.rating_compensation_benefits
      ]) AS r
      WHERE s2.company_id = c.id
        AND r IS NOT NULL
    ) AS avg_rating,
    round(
      100.0 * count(*) FILTER (WHERE s.result = 'Oferta - Aceptada')
      / nullif(count(s.id), 0)
    ) AS accept_rate,
    round(
      100.0 * count(*) FILTER (WHERE s.result = 'Ghost')
      / nullif(count(s.id), 0)
    ) AS ghost_rate,
    round(
      100.0 * count(*) FILTER (
        WHERE s.result IN ('Oferta - Aceptada', 'Oferta - Rechazada')
      )
      / nullif(count(s.id), 0)
    ) AS offer_rate,
    (
      SELECT round(avg(s3.stages_reached)::numeric, 1)
      FROM submissions s3
      WHERE s3.company_id = c.id
    ) AS avg_stages,
    (
      SELECT round(avg(
        CASE s4.response_time
          WHEN 'Sí - en menos de 1 semana' THEN 3.5
          WHEN 'Sí - en 1-2 semanas' THEN 10.5
          WHEN 'Sí - en más de 2 semanas' THEN 21
        END
      )::numeric, 1)
      FROM submissions s4
      WHERE s4.company_id = c.id
        AND s4.response_time <> 'Nunca (ghost)'
    ) AS avg_response_days,
    (
      SELECT round(
        100.0 * count(*) FILTER (WHERE wp.modality = 'Remoto')
        / nullif(count(*) FILTER (WHERE wp.modality IS NOT NULL), 0)
      )
      FROM workplace_profiles wp
      JOIN submissions s5 ON s5.id = wp.submission_id
      WHERE s5.company_id = c.id
    ) AS remote_rate,
    (
      SELECT round(avg(wp.salary)::numeric)
      FROM workplace_profiles wp
      JOIN submissions s6 ON s6.id = wp.submission_id
      WHERE s6.company_id = c.id
        AND wp.salary IS NOT NULL
    ) AS avg_salary
  FROM companies c
  INNER JOIN submissions s ON s.company_id = c.id
  GROUP BY c.id, c.name, c.name_normalized, c.logo_url
  ORDER BY count(s.id) DESC, c.name;
$$;

DROP FUNCTION IF EXISTS public.get_companies_overview(integer);

CREATE OR REPLACE FUNCTION public.get_companies_overview(p_limit int DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  name_normalized text,
  logo_url text,
  review_count int,
  avg_rating numeric,
  accept_rate numeric,
  ghost_rate numeric,
  offer_rate numeric,
  avg_stages numeric,
  avg_response_days numeric,
  remote_rate numeric,
  avg_salary numeric
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
  SELECT *
  FROM get_companies_directory()
  LIMIT p_limit;
$$;
