import { supabase } from "@/integrations/supabase/client";

export type ExperienceItem = { role: string; company: string; years: string; description: string };
export type WhatIDoItem = { title: string; description: string };
export type ToolItem = { name: string; logo_url: string };

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
  tools_technologies_title: string;
  tools_technologies: ToolItem[];
  recommendations_title: string;
  maintenance_enabled: boolean;
  maintenance_message: string;
  booking_banner_cta_label: string;
  booking_banner_cta_email: string;
  linkedin_url: string | null;
  footer_tagline: string;
  footer_email: string;
  footer_copyright: string;
  footer_credit: string;
  logo_svg_url: string | null;
};

const ABOUT_ALBUM_REGEX = /<!--about_album:([^>]*)-->/;

export function parseAboutContent(rawBody: string): { body: string; albumUrls: string[] } {
  const match = rawBody.match(ABOUT_ALBUM_REGEX);
  if (!match) {
    return { body: rawBody, albumUrls: [] };
  }

  const encodedJson = match[1] ?? "";
  let albumUrls: string[] = [];
  try {
    const parsed = JSON.parse(decodeURIComponent(encodedJson));
    if (Array.isArray(parsed)) {
      albumUrls = parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    albumUrls = [];
  }

  const body = rawBody.replace(match[0], "").trim();
  return { body, albumUrls };
}

export function serializeAboutContent(body: string, albumUrls: string[]): string {
  const cleanBody = body.trim();
  const cleanAlbumUrls = albumUrls.filter(Boolean);

  if (cleanAlbumUrls.length === 0) {
    return cleanBody;
  }

  const marker = `<!--about_album:${encodeURIComponent(JSON.stringify(cleanAlbumUrls))}-->`;
  return cleanBody ? `${cleanBody}\n\n${marker}` : marker;
}

const normalize = (row: any): SiteSettings => ({
  ...row,
  experience_items: Array.isArray(row.experience_items) ? row.experience_items : [],
  what_i_do_items: Array.isArray(row.what_i_do_items) ? row.what_i_do_items : [],
  tools_technologies_title: row.tools_technologies_title ?? "Tools & Technologies",
  tools_technologies: Array.isArray(row.tools_technologies) ? row.tools_technologies : [],
  footer_tagline: row.footer_tagline ?? "Let's build something together.",
  footer_email: row.footer_email ?? "hello@muratkarci.design",
  footer_copyright: row.footer_copyright ?? "© Murat Karcı. Designed & built with care.",
  footer_credit: row.footer_credit ?? "Crafted in warm cream and coral.",
  logo_svg_url: row.logo_svg_url ?? null,
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
