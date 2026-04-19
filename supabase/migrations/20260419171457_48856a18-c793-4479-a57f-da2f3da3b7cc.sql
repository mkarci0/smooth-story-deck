-- New unified, fully-dynamic sections structure
ALTER TABLE public.projects
  ADD COLUMN IF NOT EXISTS unified_sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS gallery_meta jsonb NOT NULL DEFAULT '[]'::jsonb;

-- One-time migration: convert legacy fixed sections + custom sections + outcome
-- into the new unified_sections array. Only runs for rows that don't have any
-- unified_sections yet (idempotent).
UPDATE public.projects
SET unified_sections = (
  WITH ordered_ids AS (
    SELECT unnest(
      COALESCE(
        section_order,
        ARRAY['overview','research','design_system','final_solution','outcome']::text[]
      )
    ) AS sid,
    generate_subscripts(
      COALESCE(
        section_order,
        ARRAY['overview','research','design_system','final_solution','outcome']::text[]
      ),
      1
    ) AS pos
  ),
  built AS (
    SELECT
      pos,
      sid,
      CASE
        WHEN sid = 'overview' THEN
          jsonb_build_object(
            'id', gen_random_uuid()::text,
            'heading', 'Overview',
            'body', COALESCE(overview, ''),
            'image_url', NULL,
            'image_orientation', NULL,
            'metrics', '[]'::jsonb
          )
        WHEN sid = 'research' THEN
          jsonb_build_object(
            'id', gen_random_uuid()::text,
            'heading', 'Research',
            'body', COALESCE(research->>'body', ''),
            'image_url', research->>'image_url',
            'image_orientation', NULL,
            'metrics', '[]'::jsonb
          )
        WHEN sid = 'design_system' THEN
          jsonb_build_object(
            'id', gen_random_uuid()::text,
            'heading', 'Design System',
            'body', COALESCE(design_system->>'body', ''),
            'image_url', design_system->>'image_url',
            'image_orientation', NULL,
            'metrics', '[]'::jsonb
          )
        WHEN sid = 'final_solution' THEN
          jsonb_build_object(
            'id', gen_random_uuid()::text,
            'heading', 'Final Solution',
            'body', COALESCE(final_solution->>'body', ''),
            'image_url', final_solution->>'image_url',
            'image_orientation', NULL,
            'metrics', '[]'::jsonb
          )
        WHEN sid = 'outcome' THEN
          jsonb_build_object(
            'id', gen_random_uuid()::text,
            'heading', 'Outcome',
            'body', '',
            'image_url', NULL,
            'image_orientation', NULL,
            'metrics', COALESCE(outcome, '[]'::jsonb)
          )
        WHEN sid LIKE 'custom-%' THEN
          (
            SELECT jsonb_build_object(
              'id', gen_random_uuid()::text,
              'heading', COALESCE(s->>'heading', ''),
              'body', COALESCE(s->>'body', ''),
              'image_url', s->>'image_url',
              'image_orientation', NULL,
              'metrics', '[]'::jsonb
            )
            FROM jsonb_array_elements(COALESCE(sections, '[]'::jsonb)) WITH ORDINALITY AS t(s, idx)
            WHERE idx - 1 = (regexp_replace(sid, '^custom-', ''))::int
          )
        ELSE NULL
      END AS section
    FROM ordered_ids
  )
  SELECT COALESCE(jsonb_agg(section ORDER BY pos), '[]'::jsonb)
  FROM built
  WHERE section IS NOT NULL
)
WHERE unified_sections = '[]'::jsonb;

-- Initialize gallery_meta with 'landscape' for any existing gallery items
UPDATE public.projects
SET gallery_meta = (
  SELECT COALESCE(jsonb_agg(jsonb_build_object('orientation', 'landscape')), '[]'::jsonb)
  FROM unnest(gallery)
)
WHERE jsonb_array_length(gallery_meta) = 0
  AND array_length(gallery, 1) > 0;