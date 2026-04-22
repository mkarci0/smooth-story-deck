-- Add tools_technologies column to site_settings
ALTER TABLE public.site_settings
ADD COLUMN IF NOT EXISTS tools_technologies jsonb DEFAULT '[]'::jsonb;

-- Add index for faster querying
CREATE INDEX IF NOT EXISTS idx_site_settings_tools
ON public.site_settings USING GIN(tools_technologies);
