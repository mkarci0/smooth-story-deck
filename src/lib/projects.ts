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
export type SectionLayout = "side-by-side" | "stacked";

/**
 * Unified, fully-dynamic case-study section.
 * Every section — Overview, Research, Outcome and any author-defined block —
 * shares this shape. Heading, body, image and metrics are all optional, so a
 * section can be a paragraph, an image-led block, a metrics row, or a mix.
 */
export type SubSection = {
  id: string;
  body: string;
  image_url: string | null;
  image_orientation: Orientation | null;
};

export type UnifiedSection = {
  id: string;
  heading: string;
  body: string;
  image_url: string | null;
  image_orientation: Orientation | null;
  layout: SectionLayout;
  metrics: OutcomeItem[];
  subSections: SubSection[];
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
  isVisible: boolean;
  isPasswordProtected: boolean;
  passwordHash: string;
};

type AccessSettings = {
  isVisible: boolean;
  isPasswordProtected: boolean;
  passwordHash: string;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const normalizeSubSection = (s: any): SubSection => ({
  id: typeof s?.id === "string" && s.id ? s.id : uid(),
  body: typeof s?.body === "string" ? s.body : "",
  image_url: s?.image_url ?? null,
  image_orientation:
    s?.image_orientation === "portrait" || s?.image_orientation === "landscape"
      ? s.image_orientation
      : null,
});

const normalizeSection = (s: any): UnifiedSection => ({
  id: typeof s?.id === "string" && s.id ? s.id : uid(),
  heading: typeof s?.heading === "string" ? s.heading : "",
  body: typeof s?.body === "string" ? s.body : "",
  image_url: s?.image_url ?? null,
  image_orientation:
    s?.image_orientation === "portrait" || s?.image_orientation === "landscape"
      ? s.image_orientation
      : null,
  layout: s?.layout === "stacked" ? "stacked" : "side-by-side",
  metrics: Array.isArray(s?.metrics)
    ? s.metrics.map((m: any) => ({
        label: typeof m?.label === "string" ? m.label : "",
        value: typeof m?.value === "string" ? m.value : "",
      }))
    : [],
  subSections: Array.isArray(s?.subSections)
    ? s.subSections.map(normalizeSubSection)
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
  const designSystem = row.design_system && typeof row.design_system === "object"
    ? row.design_system
    : {};
  const access = (designSystem.access && typeof designSystem.access === "object"
    ? designSystem.access
    : {}) as Partial<AccessSettings>;
  const parsedAccess: AccessSettings = {
    isVisible: access.isVisible ?? true,
    isPasswordProtected: access.isPasswordProtected ?? false,
    passwordHash: access.passwordHash ?? "",
  };
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
    isVisible: parsedAccess.isVisible,
    isPasswordProtected: parsedAccess.isPasswordProtected,
    passwordHash: parsedAccess.passwordHash,
  };
};

function withAccessSettings(project: Project, row: any): any {
  const designSystem = row.design_system && typeof row.design_system === "object"
    ? row.design_system
    : {};
  return {
    ...row,
    design_system: {
      ...designSystem,
      access: {
        isVisible: project.isVisible,
        isPasswordProtected: project.isPasswordProtected,
        passwordHash: project.passwordHash,
      },
    },
  };
}

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("published", true)
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalize).filter((project) => project.isVisible);
}

export async function fetchAllProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("position", { ascending: true });
  if (error) throw error;
  return (data ?? []).map(normalize);
}

export async function fetchProjectBySlug(
  slug: string,
  options?: { includeHidden?: boolean }
): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const normalized = normalize(data);
  if (!options?.includeHidden && !normalized.isVisible) return null;
  return normalized;
}

export async function fetchProjectAccessBySlug(
  slug: string
): Promise<Pick<Project, "id" | "slug" | "title" | "tagline" | "cover_url" | "isVisible" | "isPasswordProtected" | "passwordHash"> | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const normalized = normalize(data);
  return {
    id: normalized.id,
    slug: normalized.slug,
    title: normalized.title,
    tagline: normalized.tagline,
    cover_url: normalized.cover_url,
    isVisible: normalized.isVisible,
    isPasswordProtected: normalized.isPasswordProtected,
    passwordHash: normalized.passwordHash,
  };
}

export async function hashPassword(password: string): Promise<string> {
  const encoded = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function saveProject(project: Project): Promise<void> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", project.id)
    .single();
  if (error) throw error;
  const row = withAccessSettings(project, data);
  const { error: updateError } = await supabase
    .from("projects")
    .update({
      slug: project.slug,
      title: project.title,
      tagline: project.tagline,
      category: project.category,
      year: project.year,
      cover_url: project.cover_url,
      accent: project.accent,
      role: project.role,
      timeline: project.timeline,
      team: project.team,
      tools: project.tools,
      gallery: project.gallery,
      position: project.position,
      published: project.published,
      unified_sections: project.sections,
      gallery_meta: project.gallery_meta,
      design_system: row.design_system,
    } as never)
    .eq("id", project.id);
  if (updateError) throw updateError;
}

export const newSection = (heading = ""): UnifiedSection => ({
  id: uid(),
  heading,
  body: "",
  image_url: null,
  image_orientation: null,
  layout: "side-by-side",
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
