import { supabase } from "@/integrations/supabase/client";

export type ExperienceItem = { role: string; company: string; years: string; description: string };
export type WhatIDoItem = { title: string; description: string };
export type AboutToolItem = { name: string; logo_url: string };

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
const ABOUT_TOOLS_REGEX = /<!--about_tools:([^>]*)-->/;

export function parseAboutContent(rawBody: string): { body: string; albumUrls: string[]; tools: AboutToolItem[] } {
  const albumMatch = rawBody.match(ABOUT_ALBUM_REGEX);
  const toolsMatch = rawBody.match(ABOUT_TOOLS_REGEX);

  let albumUrls: string[] = [];
  if (albumMatch) {
    try {
      const parsed = JSON.parse(decodeURIComponent(albumMatch[1] ?? ""));
      if (Array.isArray(parsed)) {
        albumUrls = parsed.filter((item): item is string => typeof item === "string");
      }
    } catch {
      albumUrls = [];
    }
  }

  let tools: AboutToolItem[] = [];
  if (toolsMatch) {
    try {
      const parsed = JSON.parse(decodeURIComponent(toolsMatch[1] ?? ""));
      if (Array.isArray(parsed)) {
        tools = parsed
          .filter((item): item is { name?: string; logo_url?: string } => typeof item === "object" && item !== null)
          .map((item) => ({
            name: String(item.name ?? ""),
            logo_url: item.logo_url ? String(item.logo_url) : "",
          }));
      }
    } catch {
      tools = [];
    }
  }

  const body = rawBody
    .replace(albumMatch?.[0] ?? "", "")
    .replace(toolsMatch?.[0] ?? "", "")
    .trim();
  return { body, albumUrls, tools };
}

export function serializeAboutContent(body: string, albumUrls: string[], tools: AboutToolItem[]): string {
  const cleanBody = body.trim();
  const cleanAlbumUrls = albumUrls.filter(Boolean);
  const cleanTools = tools.map((tool) => ({
    name: String(tool.name ?? ""),
    logo_url: String(tool.logo_url ?? ""),
  }));

  const markers: string[] = [];
  if (cleanAlbumUrls.length > 0) {
    markers.push(`<!--about_album:${encodeURIComponent(JSON.stringify(cleanAlbumUrls))}-->`);
  }
  if (cleanTools.length > 0) {
    markers.push(`<!--about_tools:${encodeURIComponent(JSON.stringify(cleanTools))}-->`);
  }
  if (markers.length === 0) return cleanBody;
  return cleanBody ? `${cleanBody}\n\n${markers.join("\n")}` : markers.join("\n");
}

const normalize = (row: any): SiteSettings => ({
  ...row,
  experience_items: Array.isArray(row.experience_items) ? row.experience_items : [],
  what_i_do_items: Array.isArray(row.what_i_do_items) ? row.what_i_do_items : [],
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
