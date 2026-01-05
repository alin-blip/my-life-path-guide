-- Normalize existing week_key entries from YYYY-Www format to door-week-YYYY-ww format
UPDATE weekly_planning 
SET week_key = 'door-week-' || SUBSTRING(week_key, 1, 4) || '-' || SUBSTRING(week_key, 7, 2)
WHERE week_key ~ '^\d{4}-W\d{2}$';