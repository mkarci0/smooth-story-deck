ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS section_order text[] NOT NULL DEFAULT ARRAY['overview','research','design_system','final_solution','outcome']::text[];