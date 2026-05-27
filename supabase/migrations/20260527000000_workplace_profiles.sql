-- Workplace profiles: optional data collected when result = 'Oferta - Aceptada'
CREATE TABLE public.workplace_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id uuid NOT NULL UNIQUE REFERENCES public.submissions(id) ON DELETE CASCADE,
  salary integer CHECK (salary >= 0 AND salary <= 100000000),
  good_things text,
  bad_things text,
  benefits text,
  rating_work_environment smallint CHECK (rating_work_environment BETWEEN 1 AND 5),
  rating_work_life_balance smallint CHECK (rating_work_life_balance BETWEEN 1 AND 5),
  rating_career_opportunities smallint CHECK (rating_career_opportunities BETWEEN 1 AND 5),
  rating_compensation_benefits smallint CHECK (rating_compensation_benefits BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workplace_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read" ON public.workplace_profiles
  FOR SELECT TO anon, authenticated USING (true);

-- Update submit_feedback to accept optional workplace profile fields
CREATE OR REPLACE FUNCTION public.submit_feedback(
  p_company_name text,
  p_industry text,
  p_position text,
  p_application_month text,
  p_response_time text,
  p_stages_reached int DEFAULT 0,
  p_last_stage text DEFAULT NULL,
  p_result text DEFAULT 'Ghost',
  p_comment text DEFAULT NULL,
  p_salary int DEFAULT NULL,
  p_good_things text DEFAULT NULL,
  p_bad_things text DEFAULT NULL,
  p_benefits text DEFAULT NULL,
  p_rating_work_environment smallint DEFAULT NULL,
  p_rating_work_life_balance smallint DEFAULT NULL,
  p_rating_career_opportunities smallint DEFAULT NULL,
  p_rating_compensation_benefits smallint DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_company_id uuid;
  v_name_normalized text;
  v_submission_id uuid;
  v_has_profile boolean;
BEGIN
  v_name_normalized := lower(regexp_replace(trim(p_company_name), '\s+', '-', 'g'));

  INSERT INTO companies (name, name_normalized)
  VALUES (trim(p_company_name), v_name_normalized)
  ON CONFLICT (name_normalized) DO UPDATE SET name = EXCLUDED.name
  RETURNING id INTO v_company_id;

  INSERT INTO submissions (
    company_id, industry, position, application_month,
    response_time, stages_reached, last_stage, result, comment
  ) VALUES (
    v_company_id, p_industry, p_position, p_application_month,
    p_response_time, p_stages_reached, p_last_stage, p_result, p_comment
  )
  RETURNING id INTO v_submission_id;

  v_has_profile := p_salary IS NOT NULL
    OR p_good_things IS NOT NULL
    OR p_bad_things IS NOT NULL
    OR p_benefits IS NOT NULL
    OR p_rating_work_environment IS NOT NULL
    OR p_rating_work_life_balance IS NOT NULL
    OR p_rating_career_opportunities IS NOT NULL
    OR p_rating_compensation_benefits IS NOT NULL;

  IF v_has_profile AND p_result = 'Oferta - Aceptada' THEN
    INSERT INTO workplace_profiles (
      submission_id, salary, good_things, bad_things, benefits,
      rating_work_environment, rating_work_life_balance,
      rating_career_opportunities, rating_compensation_benefits
    ) VALUES (
      v_submission_id, p_salary, p_good_things, p_bad_things, p_benefits,
      p_rating_work_environment, p_rating_work_life_balance,
      p_rating_career_opportunities, p_rating_compensation_benefits
    );
  END IF;

  RETURN v_submission_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_feedback(
  text, text, text, text, text, int, text, text, text,
  int, text, text, text, smallint, smallint, smallint, smallint
) TO authenticated, service_role;
