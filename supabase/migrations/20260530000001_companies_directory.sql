-- Speeds company-scoped submission filters in directory/overview avg_rating subqueries.
CREATE INDEX IF NOT EXISTS idx_submissions_company_id
  ON public.submissions (company_id);

-- Full company directory: same metrics as overview, only companies with reviews, no limit.
CREATE OR REPLACE FUNCTION public.get_companies_directory()
RETURNS TABLE (
  id uuid,
  name text,
  name_normalized text,
  logo_url text,
  review_count int,
  avg_rating numeric,
  accept_rate numeric,
  ghost_rate numeric
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
    ) AS ghost_rate
  FROM companies c
  LEFT JOIN submissions s ON s.company_id = c.id
  GROUP BY c.id, c.name, c.name_normalized, c.logo_url
  HAVING count(s.id) > 0
  ORDER BY count(s.id) DESC, c.name;
$$;
