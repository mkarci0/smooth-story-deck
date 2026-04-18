-- Site settings singleton table
CREATE TABLE public.site_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  singleton boolean NOT NULL DEFAULT true UNIQUE,
  hero_eyebrow text NOT NULL DEFAULT 'Available for select projects · 2025',
  hero_title text NOT NULL DEFAULT 'Hi, I''m Murat. I design calm software.',
  hero_subtitle text NOT NULL DEFAULT 'Independent product designer working with founders and product teams on mobile, web and brand.',
  about_title text NOT NULL DEFAULT 'About Me',
  about_intro text NOT NULL DEFAULT 'I help teams ship software people actually want to use.',
  about_body text NOT NULL DEFAULT 'I''m Murat — a product designer with years of experience across consumer apps, B2B platforms and small brands.',
  about_image_url text,
  resume_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton_check CHECK (singleton = true)
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site settings"
ON public.site_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can insert site settings"
ON public.site_settings FOR INSERT
TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site settings"
ON public.site_settings FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insert the default singleton row
INSERT INTO public.site_settings (singleton) VALUES (true);

-- Storage bucket for site assets (resume PDF, about photo)
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-assets', 'site-assets', true);

CREATE POLICY "Site assets are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update site assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete site assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-assets' AND has_role(auth.uid(), 'admin'::app_role));