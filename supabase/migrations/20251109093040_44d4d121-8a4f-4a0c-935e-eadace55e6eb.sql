-- Add upload_date to knowledge_base_files (alias for created_at for backward compatibility)
ALTER TABLE public.knowledge_base_files ADD COLUMN upload_date TIMESTAMPTZ DEFAULT now();

-- Update existing rows
UPDATE public.knowledge_base_files SET upload_date = created_at WHERE upload_date IS NULL;

-- Fix hot_list_items - rename 'text' to 'title' and add missing columns
ALTER TABLE public.hot_list_items RENAME COLUMN text TO title;
ALTER TABLE public.hot_list_items ADD COLUMN day_of_week TEXT;

-- Update day_of_week from day column
UPDATE public.hot_list_items SET day_of_week = day WHERE day IS NOT NULL;

-- Fix user_tasks - rename 'text' to 'title' and add missing columns  
ALTER TABLE public.user_tasks RENAME COLUMN text TO title;
ALTER TABLE public.user_tasks ADD COLUMN day_of_week TEXT;

-- Update day_of_week from day column
UPDATE public.user_tasks SET day_of_week = day WHERE day IS NOT NULL;

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT,
  difficulty_level TEXT,
  duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own courses"
ON public.courses FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all courses
CREATE POLICY "Admins can view all courses"
ON public.courses FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create course_modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration TEXT,
  video_url TEXT,
  text_content TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage modules of their courses"
ON public.course_modules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.user_id = auth.uid()
  )
);

-- Admins can view all modules
CREATE POLICY "Admins can view all modules"
ON public.course_modules FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Create course_submodules table
CREATE TABLE public.course_submodules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration TEXT,
  video_url TEXT,
  text_content TEXT,
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.course_submodules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage submodules of their courses"
ON public.course_submodules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.course_modules
    JOIN public.courses ON courses.id = course_modules.course_id
    WHERE course_modules.id = course_submodules.module_id
    AND courses.user_id = auth.uid()
  )
);

-- Admins can view all submodules
CREATE POLICY "Admins can view all submodules"
ON public.course_submodules FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Add update triggers for courses
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at BEFORE UPDATE ON public.course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_submodules_updated_at BEFORE UPDATE ON public.course_submodules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes
CREATE INDEX idx_courses_user_id ON public.courses(user_id);
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_submodules_module_id ON public.course_submodules(module_id);