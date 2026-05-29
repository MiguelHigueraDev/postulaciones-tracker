-- Admin moderation: company logos + updated overview/stats RPCs

ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Public read-only bucket; writes happen via service_role in server routes.
INSERT INTO storage.buckets (id, name, public)
VALUES ('company-logos', 'company-logos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read company logos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'company-logos');

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
  ORDER BY count(s.id) DESC, c.name
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.get_company_stats(p_name_normalized text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_company record;
  v_total int;
BEGIN
  SELECT id, name, name_normalized, logo_url
  INTO v_company
  FROM companies
  WHERE name_normalized = p_name_normalized;

  IF v_company.id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int INTO v_total
  FROM submissions
  WHERE company_id = v_company.id;

  RETURN jsonb_build_object(
    'company', jsonb_build_object(
      'id', v_company.id,
      'name', v_company.name,
      'name_normalized', v_company.name_normalized,
      'logo_url', v_company.logo_url
    ),
    'stats', jsonb_build_object(
      'total', v_total,
      'results', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.result, 'count', r.cnt)
        ), '[]'::jsonb)
        FROM (
          SELECT result, count(*)::int AS cnt
          FROM submissions
          WHERE company_id = v_company.id
          GROUP BY result
        ) r
      ),
      'response_times', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.response_time, 'count', r.cnt)
        ), '[]'::jsonb)
        FROM (
          SELECT response_time, count(*)::int AS cnt
          FROM submissions
          WHERE company_id = v_company.id
          GROUP BY response_time
        ) r
      ),
      'stages', (
        SELECT jsonb_build_object(
          'average', coalesce(round(avg(stages_reached)::numeric, 1), 0),
          'min', coalesce(min(stages_reached), 0),
          'max', coalesce(max(stages_reached), 0)
        )
        FROM submissions
        WHERE company_id = v_company.id
      ),
      'last_stages', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.last_stage, 'count', r.cnt)
          ORDER BY r.cnt DESC, r.last_stage
        ), '[]'::jsonb)
        FROM (
          SELECT last_stage, count(*)::int AS cnt
          FROM submissions
          WHERE company_id = v_company.id
            AND last_stage IS NOT NULL AND last_stage <> ''
          GROUP BY last_stage
        ) r
      ),
      'industries', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.industry, 'count', r.cnt)
          ORDER BY r.cnt DESC, r.industry
        ), '[]'::jsonb)
        FROM (
          SELECT industry, count(*)::int AS cnt
          FROM submissions
          WHERE company_id = v_company.id
          GROUP BY industry
        ) r
      ),
      'positions', (
        SELECT coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb)
        FROM (
          SELECT position AS key, count(*)::int AS count
          FROM submissions
          WHERE company_id = v_company.id
          GROUP BY position
          ORDER BY count(*) DESC, position
          LIMIT 12
        ) r
      ),
      'workplace', (
        SELECT jsonb_build_object(
          'count', coalesce(count(*)::int, 0),
          'salary_avg', round(avg(wp.salary)::numeric),
          'salary_min', min(wp.salary),
          'salary_max', max(wp.salary),
          'salary_median', (
            SELECT percentile_cont(0.5) WITHIN GROUP (ORDER BY wp2.salary)
            FROM workplace_profiles wp2
            JOIN submissions s2 ON s2.id = wp2.submission_id
            WHERE s2.company_id = v_company.id AND wp2.salary IS NOT NULL
          ),
          'salary_count', count(wp.salary)::int,
          'avg_work_environment', round(avg(wp.rating_work_environment)::numeric, 1),
          'avg_work_life_balance', round(avg(wp.rating_work_life_balance)::numeric, 1),
          'avg_career_opportunities', round(avg(wp.rating_career_opportunities)::numeric, 1),
          'avg_compensation_benefits', round(avg(wp.rating_compensation_benefits)::numeric, 1),
          'ratings_count', count(wp.rating_work_environment)::int,
          'modalities', (
            SELECT coalesce(jsonb_agg(
              jsonb_build_object('key', m.modality, 'count', m.cnt)
              ORDER BY m.cnt DESC
            ), '[]'::jsonb)
            FROM (
              SELECT wp3.modality, count(*)::int AS cnt
              FROM workplace_profiles wp3
              JOIN submissions s3 ON s3.id = wp3.submission_id
              WHERE s3.company_id = v_company.id
                AND wp3.modality IS NOT NULL
              GROUP BY wp3.modality
            ) m
          )
        )
        FROM workplace_profiles wp
        JOIN submissions s ON s.id = wp.submission_id
        WHERE s.company_id = v_company.id
      )
    )
  );
END;
$$;
