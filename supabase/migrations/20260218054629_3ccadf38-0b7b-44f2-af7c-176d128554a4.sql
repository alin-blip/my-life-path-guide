
-- Tribe Courses (created by coach for their tribe)
CREATE TABLE public.tribe_courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tribe_id UUID NOT NULL REFERENCES public.tribes(id) ON DELETE CASCADE,
  coach_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tribe Course Modules (lessons within a course)
CREATE TABLE public.tribe_course_modules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.tribe_courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content_type TEXT NOT NULL DEFAULT 'text', -- text, video, pdf
  content_text TEXT,
  video_url TEXT,
  pdf_url TEXT,
  position INT NOT NULL DEFAULT 0,
  is_free BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Member progress on modules
CREATE TABLE public.tribe_module_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  module_id UUID NOT NULL REFERENCES public.tribe_course_modules(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(module_id, user_id)
);

-- Enable RLS
ALTER TABLE public.tribe_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tribe_module_progress ENABLE ROW LEVEL SECURITY;

-- RLS for tribe_courses: members can view published, owners can manage
CREATE POLICY "Members can view published tribe courses"
  ON public.tribe_courses FOR SELECT
  USING (
    is_published = true AND public.is_tribe_member(auth.uid(), tribe_id)
  );

CREATE POLICY "Owners can manage tribe courses"
  ON public.tribe_courses FOR ALL
  USING (public.is_tribe_owner(auth.uid(), tribe_id))
  WITH CHECK (public.is_tribe_owner(auth.uid(), tribe_id));

-- RLS for tribe_course_modules: members can view if course published, owners manage
CREATE POLICY "Members can view modules of published courses"
  ON public.tribe_course_modules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_courses tc
      WHERE tc.id = course_id
        AND tc.is_published = true
        AND public.is_tribe_member(auth.uid(), tc.tribe_id)
    )
  );

CREATE POLICY "Owners can manage course modules"
  ON public.tribe_course_modules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.tribe_courses tc
      WHERE tc.id = course_id
        AND public.is_tribe_owner(auth.uid(), tc.tribe_id)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.tribe_courses tc
      WHERE tc.id = course_id
        AND public.is_tribe_owner(auth.uid(), tc.tribe_id)
    )
  );

-- RLS for tribe_module_progress: users manage their own progress
CREATE POLICY "Users can manage their own progress"
  ON public.tribe_module_progress FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_tribe_courses_updated_at
  BEFORE UPDATE ON public.tribe_courses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tribe_course_modules_updated_at
  BEFORE UPDATE ON public.tribe_course_modules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
