-- Curățare duplicate din user_tasks
-- Păstrăm doar primul task (cel mai vechi) pentru fiecare combinație unică
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, week_key, task_type, title, COALESCE(day_of_week, 'null')
      ORDER BY created_at ASC, id ASC
    ) as row_num
  FROM user_tasks
  WHERE task_type IN ('hit', 'do', 'hot')
)
DELETE FROM user_tasks
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Creare index pentru performanță îmbunătățită la real-time queries
CREATE INDEX IF NOT EXISTS idx_user_tasks_user_week 
ON user_tasks(user_id, week_key, task_type);

CREATE INDEX IF NOT EXISTS idx_user_tasks_realtime 
ON user_tasks(user_id, updated_at DESC);