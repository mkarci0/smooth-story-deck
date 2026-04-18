-- Add fixed case-study section columns: Research, Design System, Final Solution
-- Each is a JSONB { body: text, image_url: text|null }
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS research jsonb NOT NULL DEFAULT '{"body":"","image_url":null}'::jsonb,
  ADD COLUMN IF NOT EXISTS design_system jsonb NOT NULL DEFAULT '{"body":"","image_url":null}'::jsonb,
  ADD COLUMN IF NOT EXISTS final_solution jsonb NOT NULL DEFAULT '{"body":"","image_url":null}'::jsonb;

-- Backfill: if a project has legacy problem/solution text, seed research/final_solution from them
UPDATE public.projects
SET research = jsonb_build_object('body', problem, 'image_url', null)
WHERE problem IS NOT NULL AND problem <> '' AND (research->>'body') = '';

UPDATE public.projects
SET final_solution = jsonb_build_object('body', solution, 'image_url', null)
WHERE solution IS NOT NULL AND solution <> '' AND (final_solution->>'body') = '';