-- Rename última etapa label for existing submissions
UPDATE public.submissions
SET last_stage = 'Después de entrevista'
WHERE last_stage = 'Después de entrevista técnica';
