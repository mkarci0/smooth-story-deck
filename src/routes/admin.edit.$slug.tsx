import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Upload, Trash2, Plus, Save, ArrowLeft, X, ArrowUp, ArrowDown, GripVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchProjectBySlug, resolveImage, type Project, type SectionBlock, type SectionItem } from "@/lib/projects";

export const Route = createFileRoute("/admin/edit/$slug")({
  component: EditProject,
});

type BlockKey = "research" | "design_system" | "final_solution";

const BLOCK_META: { key: BlockKey; label: string; description: string }[] = [
  { key: "research", label: "Research", description: "Discovery, user interviews, audit findings." },
  { key: "design_system", label: "Design System", description: "Tokens, components, type & color decisions." },
  { key: "final_solution", label: "Final Solution", description: "The shipped experience and key flows." },
];

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
    }).eq("id", p.id);
    setSaving(false);
    if (error) return alert(error.message);
    if (p.slug !== slug) navigate({ to: "/admin/edit/$slug", params: { slug: p.slug } });
    else alert("Saved!");
  };

  const upload = async (
    file: File,
    target: "cover" | "gallery" | BlockKey
  ) => {
    setUploading(target);
    const ext = file.name.split(".").pop();
    const path = `${p.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file);
    if (error) { setUploading(null); return alert(error.message); }
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    if (target === "cover") update({ cover_url: data.publicUrl });
    else if (target === "gallery") update({ gallery: [...p.gallery, data.publicUrl] });
    else updateBlock(target, { image_url: data.publicUrl });
    setUploading(null);
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

          {/* CASE STUDY STRUCTURE — fixed 5 sections */}
          <div className="border-t border-border pt-6">
            <h3 className="font-display text-xl mb-1">Case study structure</h3>
            <p className="text-xs text-muted-foreground mb-5">
              Five fixed sections render in this order on the public page: Overview · Research · Design System · Final Solution · Outcome.
            </p>

            {/* 1 — Overview */}
            <SectionCard index={1} title="Overview" description="Short context paragraph at the top of the case study.">
              <textarea rows={3} className={inp} value={p.overview} onChange={(e) => update({ overview: e.target.value })} />
            </SectionCard>

            {/* 2,3,4 — Block sections */}
            {BLOCK_META.map((meta, i) => (
              <SectionCard
                key={meta.key}
                index={i + 2}
                title={meta.label}
                description={meta.description}
              >
                <textarea
                  rows={4}
                  className={inp}
                  placeholder={`${meta.label} body…`}
                  value={p[meta.key].body}
                  onChange={(e) => updateBlock(meta.key, { body: e.target.value })}
                />
                <div className="mt-3">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">Image (optional)</label>
                  <div className="mt-1.5 flex items-center gap-3">
                    {p[meta.key].image_url ? (
                      <div className="relative">
                        <img src={resolveImage(p[meta.key].image_url)} alt="" className="w-32 h-20 object-cover rounded-lg border border-border" />
                        <button
                          onClick={() => updateBlock(meta.key, { image_url: null })}
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
                      {uploading === meta.key ? "Uploading…" : (p[meta.key].image_url ? "Replace" : "Upload")}
                      <input type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files?.[0] && upload(e.target.files[0], meta.key)} />
                    </label>
                  </div>
                </div>
              </SectionCard>
            ))}

            {/* 5 — Outcome */}
            <SectionCard index={5} title="Outcome" description="Measurable results — show 1 to 6 metrics.">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Metrics</span>
                <button onClick={() => update({ outcome: [...p.outcome, { label: "", value: "" }] })} className="text-xs story-link">
                  <Plus className="inline w-3 h-3"/> add metric
                </button>
              </div>
              <div className="space-y-2">
                {p.outcome.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <input className={inp} placeholder="Label (e.g. Onboarding completion)" value={o.label}
                      onChange={(e) => { const x = [...p.outcome]; x[i] = { ...o, label: e.target.value }; update({ outcome: x }); }} />
                    <input className={inp + " max-w-[140px]"} placeholder="+38%" value={o.value}
                      onChange={(e) => { const x = [...p.outcome]; x[i] = { ...o, value: e.target.value }; update({ outcome: x }); }} />
                    <button onClick={() => update({ outcome: p.outcome.filter((_, j) => j !== i) })} className="p-2 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                ))}
                {p.outcome.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No metrics yet — add at least one to populate the Outcome section.</p>
                )}
              </div>
            </SectionCard>
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
                  <button onClick={() => update({ gallery: p.gallery.filter((_, j) => j !== i) })}
                    className="absolute top-1 right-1 p-1 rounded-full bg-background/90 opacity-0 group-hover:opacity-100">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
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

function SectionCard({
  index,
  title,
  description,
  children,
}: {
  index: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted/20 p-5 mb-4">
      <div className="flex items-baseline gap-3 mb-1">
        <span className="font-display text-xs text-muted-foreground tabular-nums">0{index}</span>
        <h4 className="font-display text-lg">{title}</h4>
      </div>
      <p className="text-xs text-muted-foreground mb-4">{description}</p>
      {children}
    </div>
  );
}
