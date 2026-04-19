ALTER TABLE public.site_settings DROP COLUMN IF EXISTS logo_variant;
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS logo_svg_url text;