-- Per-position stats. Slug = lower(regexp_replace(trim(position), '\s+', '-', 'g'))
-- Mirrors the company name_normalized algorithm so we can match across spellings.

CREATE INDEX IF NOT EXISTS idx_submissions_position_slug
  ON public.submissions ((lower(regexp_replace(trim(position), '\s+', '-', 'g'))));

-- Index of all positions present in submissions, grouped by slug.
-- Label is the most frequent original spelling for that slug.
CREATE OR REPLACE FUNCTION public.get_positions_index()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN (
    SELECT coalesce(jsonb_agg(row_to_json(r) ORDER BY r.count DESC, r.label), '[]'::jsonb)
    FROM (
      SELECT
        slug,
        (
          SELECT s2.position
          FROM submissions s2
          WHERE lower(regexp_replace(trim(s2.position), '\s+', '-', 'g')) = g.slug
          GROUP BY s2.position
          ORDER BY count(*) DESC, s2.position
          LIMIT 1
        ) AS label,
        g.count
      FROM (
        SELECT
          lower(regexp_replace(trim(position), '\s+', '-', 'g')) AS slug,
          count(*)::int AS count
        FROM submissions
        WHERE position IS NOT NULL AND trim(position) <> ''
        GROUP BY slug
      ) g
      WHERE g.slug <> ''
    ) r
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_positions_index() TO anon, authenticated;

-- Aggregated stats for a single position slug.
CREATE OR REPLACE FUNCTION public.get_position_stats(p_slug text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_slug text;
  v_label text;
  v_total int;
BEGIN
  v_slug := lower(coalesce(p_slug, ''));

  IF v_slug = '' THEN
    RETURN NULL;
  END IF;

  SELECT s.position
  INTO v_label
  FROM submissions s
  WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
  GROUP BY s.position
  ORDER BY count(*) DESC, s.position
  LIMIT 1;

  IF v_label IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT count(*)::int INTO v_total
  FROM submissions s
  WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug;

  RETURN jsonb_build_object(
    'position', jsonb_build_object(
      'slug', v_slug,
      'label', v_label
    ),
    'stats', jsonb_build_object(
      'total', v_total,
      'results', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.result, 'count', r.cnt)
        ), '[]'::jsonb)
        FROM (
          SELECT result, count(*)::int AS cnt
          FROM submissions s
          WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
          GROUP BY result
        ) r
      ),
      'response_times', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.response_time, 'count', r.cnt)
        ), '[]'::jsonb)
        FROM (
          SELECT response_time, count(*)::int AS cnt
          FROM submissions s
          WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
          GROUP BY response_time
        ) r
      ),
      'stages', (
        SELECT jsonb_build_object(
          'average', coalesce(round(avg(stages_reached)::numeric, 1), 0),
          'min', coalesce(min(stages_reached), 0),
          'max', coalesce(max(stages_reached), 0)
        )
        FROM submissions s
        WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
      ),
      'last_stages', (
        SELECT coalesce(jsonb_agg(
          jsonb_build_object('key', r.last_stage, 'count', r.cnt)
          ORDER BY r.cnt DESC, r.last_stage
        ), '[]'::jsonb)
        FROM (
          SELECT last_stage, count(*)::int AS cnt
          FROM submissions s
          WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
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
          FROM submissions s
          WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
          GROUP BY industry
        ) r
      ),
      'companies', (
        SELECT coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb)
        FROM (
          SELECT
            c.name AS key,
            c.name_normalized AS slug,
            count(*)::int AS count
          FROM submissions s
          JOIN companies c ON c.id = s.company_id
          WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
          GROUP BY c.name, c.name_normalized
          ORDER BY count(*) DESC, c.name
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
            WHERE wp2.salary IS NOT NULL
              AND lower(regexp_replace(trim(s2.position), '\s+', '-', 'g')) = v_slug
          ),
          'salary_p25', (
            SELECT percentile_cont(0.25) WITHIN GROUP (ORDER BY wp2.salary)
            FROM workplace_profiles wp2
            JOIN submissions s2 ON s2.id = wp2.submission_id
            WHERE wp2.salary IS NOT NULL
              AND lower(regexp_replace(trim(s2.position), '\s+', '-', 'g')) = v_slug
          ),
          'salary_p75', (
            SELECT percentile_cont(0.75) WITHIN GROUP (ORDER BY wp2.salary)
            FROM workplace_profiles wp2
            JOIN submissions s2 ON s2.id = wp2.submission_id
            WHERE wp2.salary IS NOT NULL
              AND lower(regexp_replace(trim(s2.position), '\s+', '-', 'g')) = v_slug
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
              WHERE wp3.modality IS NOT NULL
                AND lower(regexp_replace(trim(s3.position), '\s+', '-', 'g')) = v_slug
              GROUP BY wp3.modality
            ) m
          )
        )
        FROM workplace_profiles wp
        JOIN submissions s ON s.id = wp.submission_id
        WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
      ),
      'top_companies_by_rating', (
        SELECT coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb)
        FROM (
          SELECT
            c.name AS name,
            c.name_normalized AS slug,
            round(
              avg(
                (
                  coalesce(wp.rating_work_environment, 0)
                  + coalesce(wp.rating_work_life_balance, 0)
                  + coalesce(wp.rating_career_opportunities, 0)
                  + coalesce(wp.rating_compensation_benefits, 0)
                )::numeric
                / nullif(
                  (CASE WHEN wp.rating_work_environment IS NOT NULL THEN 1 ELSE 0 END
                   + CASE WHEN wp.rating_work_life_balance IS NOT NULL THEN 1 ELSE 0 END
                   + CASE WHEN wp.rating_career_opportunities IS NOT NULL THEN 1 ELSE 0 END
                   + CASE WHEN wp.rating_compensation_benefits IS NOT NULL THEN 1 ELSE 0 END),
                  0
                )
              ),
              1
            ) AS overall,
            count(*)::int AS ratings_count
          FROM workplace_profiles wp
          JOIN submissions s ON s.id = wp.submission_id
          JOIN companies c ON c.id = s.company_id
          WHERE lower(regexp_replace(trim(s.position), '\s+', '-', 'g')) = v_slug
            AND (
              wp.rating_work_environment IS NOT NULL
              OR wp.rating_work_life_balance IS NOT NULL
              OR wp.rating_career_opportunities IS NOT NULL
              OR wp.rating_compensation_benefits IS NOT NULL
            )
          GROUP BY c.name, c.name_normalized
          HAVING count(*) >= 3
          ORDER BY overall DESC NULLS LAST, count(*) DESC, c.name
          LIMIT 5
        ) r
      )
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_position_stats(text) TO anon, authenticated;
