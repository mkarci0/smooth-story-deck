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
export type SectionItem = { heading: string; body: string; image_url?: string | null };
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

// Demo placeholder copy used when a section is empty — lets you preview the
// full case-study layout before authoring real content per project.
const DEMO_COPY: Record<"research" | "design_system" | "final_solution", string> = {
  research:
    "We started by interviewing 12 power users across three regions. Patterns surfaced quickly: people wanted clarity, not more features. Synthesizing the insights into a single insight wall helped the team align on the few problems worth solving.",
  design_system:
    "A small but opinionated system: one display face, one neutral text face, an 8-pt spacing rhythm, and a four-color semantic palette. Components were built atomically so engineers could compose screens in hours, not days.",
  final_solution:
    "The shipped experience replaces a noisy dashboard with a calm, focused home. Primary actions sit one tap away, secondary surfaces fade into the background, and motion is used sparingly to confirm — never to decorate.",
};

const DEMO_OUTCOME: OutcomeItem[] = [
  { label: "Activation lift", value: "+38%" },
  { label: "Time on task", value: "−42%" },
  { label: "NPS after redesign", value: "67" },
];

const withDemo = (block: SectionBlock, kind: keyof typeof DEMO_COPY, fallbackImage: string | null): SectionBlock => ({
  body: block.body || DEMO_COPY[kind],
  image_url: block.image_url || fallbackImage,
});

const normalizeSection = (s: any): SectionItem => ({
  heading: typeof s?.heading === "string" ? s.heading : "",
  body: typeof s?.body === "string" ? s.body : "",
  image_url: s?.image_url ?? null,
});

const normalize = (row: any): Project => {
  const cover = row.cover_url ?? null;
  const research = normalizeBlock(row.research);
  const design_system = normalizeBlock(row.design_system);
  const final_solution = normalizeBlock(row.final_solution);
  const outcome = Array.isArray(row.outcome) && row.outcome.length > 0 ? row.outcome : DEMO_OUTCOME;
  return {
    ...row,
    outcome,
    sections: Array.isArray(row.sections) ? row.sections.map(normalizeSection) : [],
    tools: row.tools ?? [],
    gallery: row.gallery ?? [],
    overview:
      row.overview ||
      "A short, opinionated overview of the project — the product, the users, and the wedge that made the work worth doing.",
    research: withDemo(research, "research", cover),
    design_system: withDemo(design_system, "design_system", cover),
    final_solution: withDemo(final_solution, "final_solution", cover),
  };
};

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
