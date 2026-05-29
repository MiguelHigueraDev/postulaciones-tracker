-- Admin routes use serverSupabaseServiceRole (secret key → service_role).
-- These tables were only granted to anon/authenticated; service_role needs explicit grants.

GRANT SELECT, DELETE ON public.submissions TO service_role;
GRANT SELECT, UPDATE ON public.companies TO service_role;
