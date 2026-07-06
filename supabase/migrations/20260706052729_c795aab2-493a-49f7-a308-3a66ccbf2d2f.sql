-- Deduplicate any existing duplicates first, keeping the earliest row per (email, sequence_type, day_number)
DELETE FROM public.email_sequence_log a
USING public.email_sequence_log b
WHERE a.ctid > b.ctid
  AND a.email = b.email
  AND a.sequence_type = b.sequence_type
  AND COALESCE(a.day_number, -1) = COALESCE(b.day_number, -1);

-- Enforce uniqueness so concurrent/duplicated sends fail fast
CREATE UNIQUE INDEX IF NOT EXISTS email_sequence_log_unique_send
  ON public.email_sequence_log (email, sequence_type, COALESCE(day_number, -1));