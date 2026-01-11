-- Add "what_i_will_give" field for complete Napoleon Hill formula
ALTER TABLE challenge_day1_responses
ADD COLUMN IF NOT EXISTS what_i_will_give TEXT;

-- Add vision_declaration_read tracking to champion routine logs
ALTER TABLE champion_routine_logs
ADD COLUMN IF NOT EXISTS vision_declaration_read BOOLEAN DEFAULT false;