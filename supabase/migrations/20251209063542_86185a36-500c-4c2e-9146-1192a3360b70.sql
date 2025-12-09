-- Add unique constraint on stack_sessions for (session_id, stack_type) to enable upsert
-- First, delete any duplicates keeping only the most recent entry
WITH duplicates AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY session_id, stack_type ORDER BY updated_at DESC NULLS LAST, created_at DESC NULLS LAST) as rn
  FROM stack_sessions
)
DELETE FROM stack_sessions
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);

-- Now add the unique constraint
ALTER TABLE stack_sessions 
ADD CONSTRAINT stack_sessions_session_id_stack_type_key 
UNIQUE (session_id, stack_type);