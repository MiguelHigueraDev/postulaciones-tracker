-- Align DB comment limit with app validation (shared/schemas/feedback.ts MAX_COMMENT_LENGTH)
ALTER TABLE public.submissions
  DROP CONSTRAINT comment_max_length;

ALTER TABLE public.submissions
  ADD CONSTRAINT comment_max_length CHECK (char_length(comment) <= 1000);
