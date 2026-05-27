-- PostgREST cannot resolve submit_feedback when both the legacy 9-arg
-- and the extended 18-arg overloads exist (HTTP 300 / app 500).
DROP FUNCTION IF EXISTS public.submit_feedback(
  text, text, text, text, text, int, text, text, text
);
