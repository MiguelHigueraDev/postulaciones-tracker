-- Workplace stats with optional company and position filters
CREATE OR REPLACE FUNCTION public.get_workplace_stats(
  p_name_normalized text DEFAULT NULL,
  p_position text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
BEGIN
  IF p_name_normalized IS NOT NULL THEN
    SELECT id INTO v_company_id
    FROM companies
    WHERE name_normalized = p_name_normalized;

    IF v_company_id IS NULL THEN
      RETURN NULL;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'positions', (
      SELECT coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb)
      FROM (
        SELECT s.position AS key, count(*)::int AS count
        FROM submissions s
        WHERE (v_company_id IS NULL OR s.company_id = v_company_id)
        GROUP BY s.position
        ORDER BY count(*) DESC, s.position
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
            AND (v_company_id IS NULL OR s2.company_id = v_company_id)
            AND (p_position IS NULL OR s2.position = p_position)
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
              AND (v_company_id IS NULL OR s3.company_id = v_company_id)
              AND (p_position IS NULL OR s3.position = p_position)
            GROUP BY wp3.modality
          ) m
        )
      )
      FROM workplace_profiles wp
      JOIN submissions s ON s.id = wp.submission_id
      WHERE (v_company_id IS NULL OR s.company_id = v_company_id)
        AND (p_position IS NULL OR s.position = p_position)
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_workplace_stats(text, text) TO anon, authenticated;
