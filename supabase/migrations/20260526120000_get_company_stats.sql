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
  SELECT id, name, name_normalized
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
      'name_normalized', v_company.name_normalized
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
      )
    )
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_company_stats(text) TO anon, authenticated;
