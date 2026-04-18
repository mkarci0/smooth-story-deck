import { supabase } from "@/integrations/supabase/client";

export type SiteSettings = {
  id: string;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  about_title: string;
  about_intro: string;
  about_body: string;
  about_image_url: string | null;
  resume_url: string | null;
};

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("id, hero_eyebrow, hero_title, hero_subtitle, about_title, about_intro, about_body, about_image_url, resume_url")
    .eq("singleton", true)
    .maybeSingle();
  if (error) {
    console.error("fetchSiteSettings error", error);
    return null;
  }
  return data;
}
