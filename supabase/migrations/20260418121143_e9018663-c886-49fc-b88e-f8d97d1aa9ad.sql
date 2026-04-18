-- Add new fields to site_settings
ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS booking_banner_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS booking_banner_text text NOT NULL DEFAULT 'Currently booking projects for Q2 2025',
  ADD COLUMN IF NOT EXISTS experience_title text NOT NULL DEFAULT 'Experience',
  ADD COLUMN IF NOT EXISTS experience_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS what_i_do_title text NOT NULL DEFAULT 'What I Do',
  ADD COLUMN IF NOT EXISTS what_i_do_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS recommendations_title text NOT NULL DEFAULT 'What people say';

-- Recommendations table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT '',
  company text NOT NULL DEFAULT '',
  quote text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published recommendations"
  ON public.recommendations FOR SELECT
  USING (published = true);

CREATE POLICY "Admins can view all recommendations"
  ON public.recommendations FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert recommendations"
  ON public.recommendations FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update recommendations"
  ON public.recommendations FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete recommendations"
  ON public.recommendations FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER set_recommendations_updated_at
  BEFORE UPDATE ON public.recommendations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();