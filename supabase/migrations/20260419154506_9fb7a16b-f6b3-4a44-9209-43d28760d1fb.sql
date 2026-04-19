
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS booking_banner_cta_label text NOT NULL DEFAULT 'hello@muratkarci.design',
  ADD COLUMN IF NOT EXISTS booking_banner_cta_email text NOT NULL DEFAULT 'hello@muratkarci.design',
  ADD COLUMN IF NOT EXISTS linkedin_url text;
