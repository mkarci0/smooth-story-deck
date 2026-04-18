-- Restrict storage object listing on public buckets.
-- Files remain publicly readable via direct CDN URLs (the buckets are public),
-- but only admins can LIST/enumerate the bucket via the storage API.

DROP POLICY IF EXISTS "Public can view project images" ON storage.objects;
DROP POLICY IF EXISTS "Site assets are publicly readable" ON storage.objects;

CREATE POLICY "Admins can list project images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-images'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Admins can list site assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'site-assets'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);