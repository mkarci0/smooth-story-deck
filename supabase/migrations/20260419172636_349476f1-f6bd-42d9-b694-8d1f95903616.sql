ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS logo_variant text NOT NULL DEFAULT 'wordmark';