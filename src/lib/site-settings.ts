import { supabase } from "@/integrations/supabase/client";

export type ExperienceItem = { role: string; company: string; years: string; description: string };
export type WhatIDoItem = { title: string; description: string };

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
  booking_banner_enabled: boolean;
  booking_banner_text: string;
  experience_title: string;
  experience_items: ExperienceItem[];
  what_i_do_title: string;
  what_i_do_items: WhatIDoItem[];
  recommendations_title: string;
};

const normalize = (row: any): SiteSettings => ({
  ...row,
  experience_items: Array.isArray(row.experience_items) ? row.experience_items : [],
  what_i_do_items: Array.isArray(row.what_i_do_items) ? row.what_i_do_items : [],
});

export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  const { data, error } = await supabase
    .from("site_settings")
    .select("*")
    .eq("singleton", true)
    .maybeSingle();
  if (error) {
    console.error("fetchSiteSettings error", error);
    return null;
  }
  return data ? normalize(data) : null;
}
