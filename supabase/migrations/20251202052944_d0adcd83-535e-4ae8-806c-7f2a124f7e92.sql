-- Add project_id to knowledge_base_files for Napoleon Hill project association
ALTER TABLE public.knowledge_base_files
ADD COLUMN project_id uuid REFERENCES public.napoleon_hill_projects(id) ON DELETE CASCADE;

-- Add index for faster queries
CREATE INDEX idx_knowledge_base_files_project_id ON public.knowledge_base_files(project_id);