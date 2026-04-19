import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Trash2, Plus, Save, ArrowLeft, X, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchProjectBySlug,
  resolveImage,
  type Project,
  type SectionBlock,
  type SectionItem,
  type SectionOrderId,
} from "@/lib/projects";

export const Route = createFileRoute("/admin/edit/$slug")({
  component: EditProject,
});

type BlockKey = "research" | "design_system" | "final_solution";

const BLOCK_META: Record<BlockKey, { label: string; description: string }> = {
  research: { label: "Research", description: "Discovery, user interviews, audit findings." },
  design_system: { label: "Design System", description: "Tokens, components, type & color decisions." },
  final_solution: { label: "Final Solution", description: "The shipped experience and key flows." },
};

const FIXED_LABELS: Record<"overview" | "outcome" | BlockKey, string> = {
  overview: "Overview",
  research: "Research",
  design_system: "Design System",
  final_solution: "Final Solution",
  outcome: "Outcome",
};

function EditProject() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectBySlug(slug).then(setP).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!p) return <p>Not found.</p>;

  const update = (patch: Partial<Project>) => setP({ ...p, ...patch });
  const updateBlock = (key: BlockKey, patch: Partial<SectionBlock>) =>
    setP({ ...p, [key]: { ...p[key], ...patch } });

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("projects").update({
      slug: p.slug, title: p.title, tagline: p.tagline, category: p.category, year: p.year,
      cover_url: p.cover_url, accent: p.accent, role: p.role, timeline: p.timeline,
      team: p.team, tools: p.tools, overview: p.overview,
      research: p.research, design_system: p.design_system, final_solution: p.final_solution,
      sections: p.sections,
      outcome: p.outcome, gallery: p.gallery, position: p.position, published: p.published,
      section_order: p.section_order,
    } as never).eq("id", p.id);
    setSaving(false);
    if (error) return alert(error.message);
    if (p.slug !== slug) navigate({ to: "/admin/edit/$slug", params: { slug: p.slug } });
    else alert("Saved!");
  };

  const upload = async (
    file: File,
    target: "cover" | "gallery" | BlockKey | { kind: "section"; index: number }
  ) => {
    const targetKey = typeof target === "string" ? target : `section-${target.index}`;
    setUploading(targetKey);
    const ext = file.name.split(".").pop();
    const path = `${p.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file);
    if (error) { setUploading(null); return alert(error.message); }
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    if (target === "cover") update({ cover_url: data.publicUrl });
    else if (target === "gallery") update({ gallery: [...p.gallery, data.publicUrl] });
    else if (typeof target === "object" && target.kind === "section") {
      const next = [...p.sections];
      next[target.index] = { ...next[target.index], image_url: data.publicUrl };
      update({ sections: next });
    } else updateBlock(target as BlockKey, { image_url: data.publicUrl });
    setUploading(null);
  };

  // Custom section helpers — keep section_order in sync
  const addSection = () => {
    const nextSections = [...p.sections, { heading: "", body: "", image_url: null }];
    const newId = `custom-${nextSections.length - 1}` as SectionOrderId;
    update({ sections: nextSections, section_order: [...p.section_order, newId] });
  };
  const updateSection = (i: number, patch: Partial<SectionItem>) => {
    const next = [...p.sections];
    next[i] = { ...next[i], ...patch };
    update({ sections: next });
  };
  const removeSection = (i: number) => {
    // Drop the section, then re-index custom-N IDs in section_order.
    const remaining = p.sections.filter((_, j) => j !== i);
    const remap = new Map<string, string>();
    let cursor = 0;
    p.sections.forEach((_, j) => {
      if (j === i) return;
      remap.set(`custom-${j}`, `custom-${cursor++}`);
    });
    const nextOrder = p.section_order
      .filter((id) => id !== `custom-${i}`)
      .map((id) => (remap.get(id) ?? id) as SectionOrderId);
    update({ sections: remaining, section_order: nextOrder });
  };

  // Unified section ordering (all 5 fixed + N custom)
  const moveOrder = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.section_order.length) return;
    const next = [...p.section_order];
    [next[i], next[j]] = [next[j], next[i]];
    update({ section_order: next });
  };

  // Gallery reorder
  const moveGallery = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.gallery.length) return;
    const next = [...p.gallery];
    [next[i], next[j]] = [next[j], next[i]];
    update({ gallery: next });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Link to="/admin" className="inline-flex items-center gap-2 story-link text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> all projects
        </Link>
        <button
          onClick={save} disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2 text-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saving…" : "Save changes"}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-6">
          <Field label="Title">
            <input className={inp} value={p.title} onChange={(e) => update({ title: e.target.value })} />
          </Field>
          <Field label="Tagline">
            <input className={inp} value={p.tagline} onChange={(e) => update({ tagline: e.target.value })} />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Category"><input className={inp} value={p.category} onChange={(e) => update({ category: e.target.value })} /></Field>
            <Field label="Year"><input className={inp} value={p.year} onChange={(e) => update({ year: e.target.value })} /></Field>
            <Field label="Slug"><input className={inp} value={p.slug} onChange={(e) => update({ slug: e.target.value })} /></Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Role"><input className={inp} value={p.role} onChange={(e) => update({ role: e.target.value })} /></Field>
            <Field label="Timeline"><input className={inp} value={p.timeline} onChange={(e) => update({ timeline: e.target.value })} /></Field>
            <Field label="Team"><input className={inp} value={p.team} onChange={(e) => update({ team: e.target.value })} /></Field>
          </div>
          <Field label="Tools (comma-separated)">
            <input className={inp} value={p.tools.join(", ")}
              onChange={(e) => update({ tools: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
          </Field>

          {/* CASE STUDY STRUCTURE — unified, ordered list */}
          <div className="border-t border-border pt-6">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="font-display text-xl">Case study sections</h3>
              <button
                onClick={addSection}
                className="text-xs story-link inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> add custom section
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              All sections — fixed (Overview, Research, Design System, Final Solution, Outcome) and custom — render in the order below. Use the arrows to reorder. Custom sections can also be removed.
            </p>

            <ul className="space-y-4">
              {p.section_order.map((id, i) => {
                const isCustom = id.startsWith("custom-");
                const customIdx = isCustom ? Number(id.slice("custom-".length)) : -1;
                const labelText = isCustom
                  ? p.sections[customIdx]?.heading || `Custom section`
                  : FIXED_LABELS[id as keyof typeof FIXED_LABELS];
                const indexLabel = String(i + 1).padStart(2, "0");

                return (
                  <li key={id} className="rounded-2xl border border-border bg-muted/20 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        <GripVertical className="w-3.5 h-3.5" />
                        <span className="tabular-nums">{indexLabel}</span>
                        <span className="text-foreground font-medium normal-case tracking-normal">
                          {labelText}
                        </span>
                        {isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent normal-case tracking-normal">
                            custom
                          </span>
                        )}
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => moveOrder(i, -1)}
                          disabled={i === 0}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveOrder(i, 1)}
                          disabled={i === p.section_order.length - 1}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        {isCustom && (
                          <button
                            onClick={() => removeSection(customIdx)}
                            className="p-1.5 text-muted-foreground hover:text-destructive"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Per-section editor */}
                    {id === "overview" && (
                      <textarea
                        rows={3}
                        className={inp}
                        placeholder="Short context paragraph at the top of the case study."
                        value={p.overview}
                        onChange={(e) => update({ overview: e.target.value })}
                      />
                    )}

                    {(id === "research" || id === "design_system" || id === "final_solution") && (
                      <BlockEditor
                        block={p[id as BlockKey]}
                        meta={BLOCK_META[id as BlockKey]}
                        uploading={uploading === id}
                        onChange={(patch) => updateBlock(id as BlockKey, patch)}
                        onUpload={(file) => upload(file, id as BlockKey)}
                      />
                    )}

                    {id === "outcome" && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Metrics</span>
                          <button onClick={() => update({ outcome: [...p.outcome, { label: "", value: "" }] })} className="text-xs story-link">
                            <Plus className="inline w-3 h-3" /> add metric
                          </button>
                        </div>
                        <div className="space-y-2">
                          {p.outcome.map((o, idx) => (
                            <div key={idx} className="flex gap-2">
                              <input className={inp} placeholder="Label (e.g. Onboarding completion)" value={o.label}
                                onChange={(e) => { const x = [...p.outcome]; x[idx] = { ...o, label: e.target.value }; update({ outcome: x }); }} />
                              <input className={inp + " max-w-[140px]"} placeholder="+38%" value={o.value}
                                onChange={(e) => { const x = [...p.outcome]; x[idx] = { ...o, value: e.target.value }; update({ outcome: x }); }} />
                              <button onClick={() => update({ outcome: p.outcome.filter((_, j) => j !== idx) })} className="p-2 text-muted-foreground hover:text-destructive">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          {p.outcome.length === 0 && (
                            <p className="text-xs text-muted-foreground italic">No metrics yet — add at least one to populate the Outcome section.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {isCustom && p.sections[customIdx] && (
                      <CustomSectionEditor
                        section={p.sections[customIdx]}
                        uploading={uploading === `section-${customIdx}`}
                        onChange={(patch) => updateSection(customIdx, patch)}
                        onUpload={(file) => upload(file, { kind: "section", index: customIdx })}
                      />
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border p-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Cover image</label>
            <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3]" style={{ backgroundColor: p.accent }}>
              {p.cover_url && <img src={resolveImage(p.cover_url)} alt="" className="w-full h-full object-cover"/>}
            </div>
            <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-sm story-link">
              <Upload className="w-4 h-4" /> {uploading === "cover" ? "Uploading…" : "Upload new cover"}
              <input type="file" accept="image/*" className="hidden"
                onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "cover")} />
            </label>
          </div>

          <div className="rounded-2xl border border-border p-4 space-y-3">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Settings</label>
            <Field label="Accent color (CSS)">
              <input className={inp} value={p.accent} onChange={(e) => update({ accent: e.target.value })} />
            </Field>
            <p className="text-[11px] text-muted-foreground -mt-1">
              Position is set by drag &amp; drop in the Projects list.
            </p>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.published} onChange={(e) => update({ published: e.target.checked })} />
              Published (visible on site)
            </label>
          </div>

          <div className="rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs uppercase tracking-widest text-muted-foreground">Gallery</label>
              <label className="cursor-pointer text-xs story-link">
                <Upload className="inline w-3 h-3" /> {uploading === "gallery" ? "..." : "add"}
                <input type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], "gallery")} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {p.gallery.map((g, i) => (
                <div key={i} className="relative group">
                  <img src={resolveImage(g)} alt="" className="w-full aspect-square object-cover rounded-lg" />
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between p-1.5 opacity-0 group-hover:opacity-100 bg-gradient-to-t from-foreground/70 to-transparent rounded-b-lg">
                    <div className="flex gap-0.5">
                      <button
                        onClick={() => moveGallery(i, -1)}
                        disabled={i === 0}
                        className="p-1 rounded-full bg-background/90 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move left"
                      >
                        <ArrowUp className="w-3 h-3 -rotate-90" />
                      </button>
                      <button
                        onClick={() => moveGallery(i, 1)}
                        disabled={i === p.gallery.length - 1}
                        className="p-1 rounded-full bg-background/90 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move right"
                      >
                        <ArrowDown className="w-3 h-3 -rotate-90" />
                      </button>
                    </div>
                    <button
                      onClick={() => update({ gallery: p.gallery.filter((_, j) => j !== i) })}
                      className="p-1 rounded-full bg-background/90 hover:text-destructive"
                      title="Remove"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {p.gallery.length === 0 && (
                <p className="col-span-2 text-[11px] text-muted-foreground italic text-center py-3">
                  No images yet. 1 → hero · 2 → grid · 3+ → swipeable carousel. Portrait & landscape both supported.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function BlockEditor({
  block,
  meta,
  uploading,
  onChange,
  onUpload,
}: {
  block: SectionBlock;
  meta: { label: string; description: string };
  uploading: boolean;
  onChange: (patch: Partial<SectionBlock>) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-2">{meta.description}</p>
      <textarea
        rows={4}
        className={inp}
        placeholder={`${meta.label} body…`}
        value={block.body}
        onChange={(e) => onChange({ body: e.target.value })}
      />
      <div className="mt-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Image (optional)</label>
        <ImagePicker
          imageUrl={block.image_url}
          uploading={uploading}
          onClear={() => onChange({ image_url: null })}
          onUpload={onUpload}
        />
      </div>
    </div>
  );
}

function CustomSectionEditor({
  section,
  uploading,
  onChange,
  onUpload,
}: {
  section: SectionItem;
  uploading: boolean;
  onChange: (patch: Partial<SectionItem>) => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div>
      <input
        className={inp + " mb-2"}
        placeholder="Heading (e.g. Mapping the journey)"
        value={section.heading}
        onChange={(e) => onChange({ heading: e.target.value })}
      />
      <textarea
        rows={4}
        className={inp}
        placeholder="Body copy…"
        value={section.body}
        onChange={(e) => onChange({ body: e.target.value })}
      />
      <div className="mt-3">
        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Image (optional)</label>
        <ImagePicker
          imageUrl={section.image_url ?? null}
          uploading={uploading}
          onClear={() => onChange({ image_url: null })}
          onUpload={onUpload}
        />
      </div>
    </div>
  );
}

function ImagePicker({
  imageUrl,
  uploading,
  onClear,
  onUpload,
}: {
  imageUrl: string | null;
  uploading: boolean;
  onClear: () => void;
  onUpload: (file: File) => void;
}) {
  return (
    <div className="mt-1.5 flex items-center gap-3">
      {imageUrl ? (
        <div className="relative">
          <img src={resolveImage(imageUrl)} alt="" className="w-32 h-20 object-cover rounded-lg border border-border" />
          <button
            onClick={onClear}
            className="absolute -top-2 -right-2 p-1 rounded-full bg-background border border-border hover:text-destructive"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-20 rounded-lg border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground">
          No image
        </div>
      )}
      <label className="cursor-pointer text-xs story-link inline-flex items-center gap-1.5">
        <Upload className="w-3.5 h-3.5" />
        {uploading ? "Uploading…" : (imageUrl ? "Replace" : "Upload")}
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </label>
    </div>
  );
}
