-- Permitem ca week_key să fie NULL pentru taskurile globale (hot)
ALTER TABLE user_tasks 
ALTER COLUMN week_key DROP NOT NULL;

-- Acum setăm week_key = NULL pentru toate taskurile HOT (TODO List global)
UPDATE user_tasks 
SET week_key = NULL 
WHERE task_type = 'hot';

-- Comentariu: Taskurile de tip 'hot' reprezintă TODO-ul global al utilizatorului
-- și trebuie să fie accesibile independent de week_key pentru a fi vizibile permanent