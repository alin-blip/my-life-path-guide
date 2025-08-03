-- Create user roles enum and table
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin policies using the security definer function
CREATE POLICY "Admins can view all roles" 
ON public.user_roles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  estimated_duration INTEGER DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for courses
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

-- Courses are publicly viewable if published
CREATE POLICY "Published courses are viewable by everyone" 
ON public.courses 
FOR SELECT 
USING (is_published = true);

-- Only admins can manage courses
CREATE POLICY "Admins can manage all courses" 
ON public.courses 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create course modules table
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  video_url TEXT,
  text_content TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for course modules
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;

-- Course modules follow the same access pattern as courses
CREATE POLICY "Course modules are viewable with published courses" 
ON public.course_modules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_modules.course_id 
    AND courses.is_published = true
  )
);

CREATE POLICY "Admins can manage all course modules" 
ON public.course_modules 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create course submodules table
CREATE TABLE public.course_submodules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  duration TEXT,
  video_url TEXT,
  text_content TEXT,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for course submodules
ALTER TABLE public.course_submodules ENABLE ROW LEVEL SECURITY;

-- Course submodules follow the same access pattern
CREATE POLICY "Course submodules are viewable with published courses" 
ON public.course_submodules 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    JOIN public.course_modules ON courses.id = course_modules.course_id
    WHERE course_modules.id = course_submodules.module_id 
    AND courses.is_published = true
  )
);

CREATE POLICY "Admins can manage all course submodules" 
ON public.course_submodules 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at columns
CREATE TRIGGER update_user_roles_updated_at
BEFORE UPDATE ON public.user_roles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_modules_updated_at
BEFORE UPDATE ON public.course_modules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_submodules_updated_at
BEFORE UPDATE ON public.course_submodules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();