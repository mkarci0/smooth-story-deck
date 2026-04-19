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

export type Orientation = "landscape" | "portrait";

export type OutcomeItem = { label: string; value: string };

/**
 * Unified, fully-dynamic case-study section.
 * Every section — Overview, Research, Outcome and any author-defined block —
 * shares this shape. Heading, body, image and metrics are all optional, so a
 * section can be a paragraph, an image-led block, a metrics row, or a mix.
 */
export type UnifiedSection = {
  id: string;
  heading: string;
  body: string;
  image_url: string | null;
  image_orientation: Orientation | null;
  metrics: OutcomeItem[];
};

export type GalleryMeta = { orientation: Orientation };

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
  sections: UnifiedSection[];
  gallery: string[];
  gallery_meta: GalleryMeta[];
  position: number;
  published: boolean;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const normalizeSection = (s: any): UnifiedSection => ({
  id: typeof s?.id === "string" && s.id ? s.id : uid(),
  heading: typeof s?.heading === "string" ? s.heading : "",
  body: typeof s?.body === "string" ? s.body : "",
  image_url: s?.image_url ?? null,
  image_orientation:
    s?.image_orientation === "portrait" || s?.image_orientation === "landscape"
      ? s.image_orientation
      : null,
  metrics: Array.isArray(s?.metrics)
    ? s.metrics.map((m: any) => ({
        label: typeof m?.label === "string" ? m.label : "",
        value: typeof m?.value === "string" ? m.value : "",
      }))
    : [],
});

const normalizeGalleryMeta = (raw: any, count: number): GalleryMeta[] => {
  const arr: GalleryMeta[] = Array.isArray(raw)
    ? raw.map((m: any) => ({
        orientation: m?.orientation === "portrait" ? "portrait" : "landscape",
      }))
    : [];
  // Pad with landscape defaults so the array always matches gallery length.
  while (arr.length < count) arr.push({ orientation: "landscape" });
  return arr.slice(0, count);
};

const normalize = (row: any): Project => {
  const gallery: string[] = row.gallery ?? [];
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline ?? "",
    category: row.category ?? "",
    year: row.year ?? "",
    cover_url: row.cover_url ?? null,
    accent: row.accent ?? "oklch(0.92 0.06 45)",
    role: row.role ?? "",
    timeline: row.timeline ?? "",
    team: row.team ?? "",
    tools: row.tools ?? [],
    sections: Array.isArray(row.unified_sections)
      ? row.unified_sections.map(normalizeSection)
      : [],
    gallery,
    gallery_meta: normalizeGalleryMeta(row.gallery_meta, gallery.length),
    position: row.position ?? 0,
    published: row.published ?? true,
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

export const newSection = (heading = ""): UnifiedSection => ({
  id: uid(),
  heading,
  body: "",
  image_url: null,
  image_orientation: null,
  metrics: [],
});

/** Detect orientation from a File by reading its intrinsic dimensions. */
export const detectOrientation = (file: File): Promise<Orientation> =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img.naturalHeight > img.naturalWidth ? "portrait" : "landscape");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve("landscape");
    };
    img.src = url;
  });
