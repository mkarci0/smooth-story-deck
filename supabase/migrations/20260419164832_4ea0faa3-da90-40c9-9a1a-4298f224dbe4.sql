ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS footer_tagline text NOT NULL DEFAULT 'Let''s build something together.',
  ADD COLUMN IF NOT EXISTS footer_email text NOT NULL DEFAULT 'hello@muratkarci.design',
  ADD COLUMN IF NOT EXISTS footer_copyright text NOT NULL DEFAULT '© Murat Karcı. Designed & built with care.',
  ADD COLUMN IF NOT EXISTS footer_credit text NOT NULL DEFAULT 'Crafted in warm cream and coral.';