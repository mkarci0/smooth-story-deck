import { supabase } from "@/integrations/supabase/client";
import kuma from "@/assets/project-kuma.jpg";
import pulse from "@/assets/project-pulse.jpg";
import loom from "@/assets/project-loom.jpg";
import brew from "@/assets/project-brew.jpg";

// Fallback bundled images for the seeded /src-asset/* placeholders
const bundledMap: Record<string, string> = {
  "/src-asset/project-kuma.jpg": kuma,
  "/src-asset/project-pulse.jpg": pulse,
  "/src-asset/project-loom.jpg": loom,
  "/src-asset/project-brew.jpg": brew,
};

export const resolveImage = (url: string | null | undefined): string => {
  if (!url) return kuma;
  if (bundledMap[url]) return bundledMap[url];
  return url;
};

export type OutcomeItem = { label: string; value: string };
export type SectionItem = { heading: string; body: string };
export type SectionBlock = { body: string; image_url: string | null };

export type Project = {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  category: string;
  year: string;
  cover_url: string | null;
  accent: string;
  role: string;
  timeline: string;
  team: string;
  tools: string[];
  overview: string;
  // Legacy free-form (kept for backward compatibility)
  problem: string;
  solution: string;
  sections: SectionItem[];
  // Fixed case-study blocks
  research: SectionBlock;
  design_system: SectionBlock;
  final_solution: SectionBlock;
  outcome: OutcomeItem[];
  gallery: string[];
  position: number;
  published: boolean;
};

const emptyBlock = (): SectionBlock => ({ body: "", image_url: null });

const normalizeBlock = (v: any): SectionBlock => {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return { body: typeof v.body === "string" ? v.body : "", image_url: v.image_url ?? null };
  }
  return emptyBlock();
};

const normalize = (row: any): Project => ({
  ...row,
  outcome: Array.isArray(row.outcome) ? row.outcome : [],
  sections: Array.isArray(row.sections) ? row.sections : [],
  tools: row.tools ?? [],
  gallery: row.gallery ?? [],
  research: normalizeBlock(row.research),
  design_system: normalizeBlock(row.design_system),
  final_solution: normalizeBlock(row.final_solution),
});

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchProjectBySlug(slug: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  return data ? normalize(data) : null;
}
