
-- Create courses table
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  duration TEXT,
  price DECIMAL(10,2) DEFAULT 0,
  url TEXT,
  image TEXT,
  type TEXT NOT NULL DEFAULT 'video',
  category TEXT NOT NULL,
  subcategory TEXT NOT NULL,
  access_level TEXT NOT NULL DEFAULT 'free',
  is_premium BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'approved',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_modules table
CREATE TABLE public.course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration TEXT,
  video_url TEXT,
  text_content TEXT,
  pdf_url TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course_submodules table
CREATE TABLE public.course_submodules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL,
  duration TEXT,
  video_url TEXT,
  text_content TEXT,
  pdf_url TEXT,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_submodules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for courses
CREATE POLICY "Users can view all approved courses" 
  ON public.courses 
  FOR SELECT 
  USING (status = 'approved' OR user_id = auth.uid());

CREATE POLICY "Users can create their own courses" 
  ON public.courses 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own courses" 
  ON public.courses 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own courses" 
  ON public.courses 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for course_modules
CREATE POLICY "Users can view modules of accessible courses" 
  ON public.course_modules 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_modules.course_id 
      AND (courses.status = 'approved' OR courses.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage modules of their own courses" 
  ON public.course_modules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.courses 
      WHERE courses.id = course_modules.course_id 
      AND courses.user_id = auth.uid()
    )
  );

-- Create RLS policies for course_submodules
CREATE POLICY "Users can view submodules of accessible courses" 
  ON public.course_submodules 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules 
      JOIN public.courses ON courses.id = course_modules.course_id
      WHERE course_modules.id = course_submodules.module_id 
      AND (courses.status = 'approved' OR courses.user_id = auth.uid())
    )
  );

CREATE POLICY "Users can manage submodules of their own courses" 
  ON public.course_submodules 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.course_modules 
      JOIN public.courses ON courses.id = course_modules.course_id
      WHERE course_modules.id = course_submodules.module_id 
      AND courses.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_courses_category_subcategory ON public.courses(category, subcategory);
CREATE INDEX idx_courses_user_id ON public.courses(user_id);
CREATE INDEX idx_course_modules_course_id ON public.course_modules(course_id);
CREATE INDEX idx_course_modules_order ON public.course_modules(course_id, order_index);
CREATE INDEX idx_course_submodules_module_id ON public.course_submodules(module_id);
CREATE INDEX idx_course_submodules_order ON public.course_submodules(module_id, order_index);
