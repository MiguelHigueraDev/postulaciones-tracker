CREATE OR REPLACE FUNCTION public.get_global_stats()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY INVOKER
SET search_path TO 'public'
AS $$
DECLARE
  v_total int;
BEGIN
  SELECT count(*)::int INTO v_total
  FROM submissions;

  RETURN jsonb_build_object(
    'total', v_total,
    'results', (
      SELECT coalesce(jsonb_agg(
        jsonb_build_object('key', r.result, 'count', r.cnt)
      ), '[]'::jsonb)
      FROM (
        SELECT result, count(*)::int AS cnt
        FROM submissions
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
    ),
    'last_stages', (
      SELECT coalesce(jsonb_agg(
        jsonb_build_object('key', r.last_stage, 'count', r.cnt)
        ORDER BY r.cnt DESC, r.last_stage
      ), '[]'::jsonb)
      FROM (
        SELECT last_stage, count(*)::int AS cnt
        FROM submissions
        WHERE last_stage IS NOT NULL AND last_stage <> ''
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
        GROUP BY industry
      ) r
    ),
    'positions', (
      SELECT coalesce(jsonb_agg(row_to_json(r)), '[]'::jsonb)
      FROM (
        SELECT position AS key, count(*)::int AS count
        FROM submissions
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
          WHERE wp2.salary IS NOT NULL
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
            GROUP BY wp3.modality
          ) m
        )
      )
      FROM workplace_profiles wp
      JOIN submissions s ON s.id = wp.submission_id
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_global_stats() TO anon, authenticated;
