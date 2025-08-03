-- Create tables for coaching sessions and app data

-- Table for Divine Coaching Sessions (Sesiuni de Coaching Divin)
CREATE TABLE public.divine_coaching_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for Anger Stack Sessions (Sesiuni Stack de Furie)
CREATE TABLE public.anger_stack_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  session_id text NOT NULL,
  answers jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for Stack Library (Biblioteca de Coaching)
CREATE TABLE public.stack_library (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  type text NOT NULL, -- 'divine_coaching' or 'anger_stack'
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for Notes (Notițe Sacre)
CREATE TABLE public.notes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  content text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for Hot List Items (Lista Fierbinte)
CREATE TABLE public.hot_list_items (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  priority integer DEFAULT 1,
  completed boolean NOT NULL DEFAULT false,
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Table for Daily Progress (Progres Zilnic)
CREATE TABLE public.daily_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  date date NOT NULL,
  tasks_completed integer DEFAULT 0,
  total_tasks integer DEFAULT 0,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.divine_coaching_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anger_stack_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stack_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hot_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for divine_coaching_sessions
CREATE POLICY "Users can view their own divine coaching sessions" 
ON public.divine_coaching_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own divine coaching sessions" 
ON public.divine_coaching_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own divine coaching sessions" 
ON public.divine_coaching_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own divine coaching sessions" 
ON public.divine_coaching_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for anger_stack_sessions
CREATE POLICY "Users can view their own anger stack sessions" 
ON public.anger_stack_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own anger stack sessions" 
ON public.anger_stack_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own anger stack sessions" 
ON public.anger_stack_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own anger stack sessions" 
ON public.anger_stack_sessions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for stack_library
CREATE POLICY "Users can view their own stack library" 
ON public.stack_library 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stack library entries" 
ON public.stack_library 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stack library entries" 
ON public.stack_library 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stack library entries" 
ON public.stack_library 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can view their own notes" 
ON public.notes 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" 
ON public.notes 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" 
ON public.notes 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" 
ON public.notes 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for hot_list_items
CREATE POLICY "Users can view their own hot list items" 
ON public.hot_list_items 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own hot list items" 
ON public.hot_list_items 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own hot list items" 
ON public.hot_list_items 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own hot list items" 
ON public.hot_list_items 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for daily_progress
CREATE POLICY "Users can view their own daily progress" 
ON public.daily_progress 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily progress" 
ON public.daily_progress 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily progress" 
ON public.daily_progress 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily progress" 
ON public.daily_progress 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_divine_coaching_sessions_updated_at
BEFORE UPDATE ON public.divine_coaching_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_anger_stack_sessions_updated_at
BEFORE UPDATE ON public.anger_stack_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stack_library_updated_at
BEFORE UPDATE ON public.stack_library
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON public.notes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hot_list_items_updated_at
BEFORE UPDATE ON public.hot_list_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_progress_updated_at
BEFORE UPDATE ON public.daily_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();