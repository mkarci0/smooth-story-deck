import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Upload,
  Trash2,
  Plus,
  Save,
  ArrowLeft,
  X,
  ArrowUp,
  ArrowDown,
  GripVertical,
  Image as ImageIcon,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchProjectBySlug,
  saveProject,
  hashPassword,
  resolveImage,
  newSection,
  detectOrientation,
  type Project,
  type UnifiedSection,
  type Orientation,
  type GalleryMeta,
  type SectionLayout,
} from "@/lib/projects";

export const Route = createFileRoute("/admin/edit/$slug")({
  component: EditProject,
});

function EditProject() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const [p, setP] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    fetchProjectBySlug(slug, { includeHidden: true }).then(setP).finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <p className="text-muted-foreground">Loading…</p>;
  if (!p) return <p>Not found.</p>;

  const update = (patch: Partial<Project>) => setP({ ...p, ...patch });

  const save = async () => {
    setSaving(true);
    let error: Error | null = null;
    try {
      await saveProject(p);
    } catch (err) {
      error = err as Error;
    }
    setSaving(false);
    if (error) return alert(error.message);
    if (p.slug !== slug) navigate({ to: "/admin/edit/$slug", params: { slug: p.slug } });
    else alert("Saved!");
  };

  const upload = async (
    file: File,
    target: "cover" | "gallery" | { kind: "section"; index: number }
  ) => {
    if (target === "cover") {
      const isGif = file.type === "image/gif" || file.name.toLowerCase().endsWith(".gif");
      const isMp4 = file.type === "video/mp4" || file.name.toLowerCase().endsWith(".mp4");
      const isImage = file.type.startsWith("image/");
      if (!isImage && !isGif && !isMp4) {
        return alert("Cover için sadece görsel, GIF veya MP4 yükleyebilirsiniz.");
      }
    }

    const targetKey =
      typeof target === "string" ? target : `section-${target.index}`;
    setUploading(targetKey);
    const orientation: Orientation =
      target === "gallery" || (typeof target === "object" && target.kind === "section")
        ? await detectOrientation(file)
        : "landscape";
    const ext = file.name.split(".").pop();
    const path = `${p.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file);
    if (error) {
      setUploading(null);
      return alert(error.message);
    }
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);

    if (target === "cover") {
      update({ cover_url: data.publicUrl });
    } else if (target === "gallery") {
      update({
        gallery: [...p.gallery, data.publicUrl],
        gallery_meta: [...p.gallery_meta, { orientation }],
      });
    } else if (typeof target === "object" && target.kind === "section") {
      const next = [...p.sections];
      next[target.index] = {
        ...next[target.index],
        image_url: data.publicUrl,
        image_orientation: orientation,
      };
      update({ sections: next });
    }
    setUploading(null);
  };

  // Section helpers (all sections are now uniform)
  const addSection = () => update({ sections: [...p.sections, newSection()] });
  const updateSection = (i: number, patch: Partial<UnifiedSection>) => {
    const next = [...p.sections];
    next[i] = { ...next[i], ...patch };
    update({ sections: next });
  };
  const removeSection = (i: number) =>
    update({ sections: p.sections.filter((_, j) => j !== i) });
  const moveSection = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.sections.length) return;
    const next = [...p.sections];
    [next[i], next[j]] = [next[j], next[i]];
    update({ sections: next });
  };

  // Gallery helpers
  const moveGallery = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= p.gallery.length) return;
    const nextG = [...p.gallery];
    const nextM = [...p.gallery_meta];
    [nextG[i], nextG[j]] = [nextG[j], nextG[i]];
    [nextM[i], nextM[j]] = [nextM[j], nextM[i]];
    update({ gallery: nextG, gallery_meta: nextM });
  };
  const removeGallery = (i: number) => {
    update({
      gallery: p.gallery.filter((_, j) => j !== i),
      gallery_meta: p.gallery_meta.filter((_, j) => j !== i),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <Link to="/admin" className="inline-flex items-center gap-2 story-link text-sm text-muted-foreground">
          <ArrowLeft className="w-4 h-4" /> all projects
        </Link>
        <button
          onClick={save}
          disabled={saving}
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

          {/* CASE STUDY SECTIONS — fully unified, every block is editable & removable */}
          <div className="border-t border-border pt-6">
            <div className="flex items-baseline justify-between mb-1">
              <h3 className="font-display text-xl">Case study sections</h3>
              <button
                onClick={addSection}
                className="text-xs story-link inline-flex items-center gap-1.5"
              >
                <Plus className="w-3 h-3" /> add section
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              Every section uses the same structure: heading + body + optional image + optional metrics. Reorder with the arrows. Remove any section you don't need — add it back any time.
            </p>

            {p.sections.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-center text-xs text-muted-foreground">
                No sections yet. Click <span className="text-foreground">add section</span> to start.
              </div>
            ) : (
              <ul className="space-y-4">
                {p.sections.map((s, i) => (
                  <li key={s.id} className="rounded-2xl border border-border bg-muted/20 p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                        <GripVertical className="w-3.5 h-3.5" />
                        <span className="tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-foreground font-medium normal-case tracking-normal">
                          {s.heading || "Untitled section"}
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => moveSection(i, -1)}
                          disabled={i === 0}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => moveSection(i, 1)}
                          disabled={i === p.sections.length - 1}
                          className="p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => removeSection(i)}
                          className="p-1.5 text-muted-foreground hover:text-destructive"
                          title="Remove"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <input
                      className={inp + " mb-2"}
                      placeholder="Heading (e.g. Overview, Research, Final solution…)"
                      value={s.heading}
                      onChange={(e) => updateSection(i, { heading: e.target.value })}
                    />
                    <RichTextEditor
                      value={s.body}
                      onChange={(next) => updateSection(i, { body: next })}
                      placeholder="Body copy…"
                      rows={6}
                    />
                    <div className="mt-2">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Layout
                      </label>
                      <select
                        className={inp + " mt-1.5"}
                        value={s.layout}
                        onChange={(e) =>
                          updateSection(i, { layout: e.target.value as SectionLayout })
                        }
                      >
                        <option value="side-by-side">Side-by-side (image + text columns)</option>
                        <option value="stacked">Stacked (image full-width, text below)</option>
                      </select>
                    </div>

                    {/* Image */}
                    <div className="mt-3">
                      <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                        Image (optional)
                      </label>
                      <div className="mt-1.5 flex items-center gap-3">
                        {s.image_url ? (
                          <div className="relative">
                            <img
                              src={resolveImage(s.image_url)}
                              alt=""
                              className={`object-cover rounded-lg border border-border ${
                                s.image_orientation === "portrait" ? "w-16 h-32" : "w-32 h-20"
                              }`}
                            />
                            <button
                              onClick={() =>
                                updateSection(i, { image_url: null, image_orientation: null })
                              }
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
                        <div className="flex flex-col gap-1.5">
                          <label className="cursor-pointer text-xs story-link inline-flex items-center gap-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            {uploading === `section-${i}`
                              ? "Uploading…"
                              : s.image_url
                                ? "Replace"
                                : "Upload"}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) =>
                                e.target.files?.[0] &&
                                upload(e.target.files[0], { kind: "section", index: i })
                              }
                            />
                          </label>
                          {s.image_orientation && (
                            <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                              <ImageIcon className="w-3 h-3" />
                              {s.image_orientation === "portrait" ? "Dikey · 1:2" : "Yatay · 4:3"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          Metrics (optional)
                        </label>
                        <button
                          onClick={() =>
                            updateSection(i, {
                              metrics: [...s.metrics, { label: "", value: "" }],
                            })
                          }
                          className="text-xs story-link inline-flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" /> add metric
                        </button>
                      </div>
                      {s.metrics.length > 0 && (
                        <div className="space-y-2">
                          {s.metrics.map((m, mi) => (
                            <div key={mi} className="flex gap-2">
                              <input
                                className={inp}
                                placeholder="Label (e.g. Activation lift)"
                                value={m.label}
                                onChange={(e) => {
                                  const next = [...s.metrics];
                                  next[mi] = { ...m, label: e.target.value };
                                  updateSection(i, { metrics: next });
                                }}
                              />
                              <input
                                className={inp + " max-w-[140px]"}
                                placeholder="+38%"
                                value={m.value}
                                onChange={(e) => {
                                  const next = [...s.metrics];
                                  next[mi] = { ...m, value: e.target.value };
                                  updateSection(i, { metrics: next });
                                }}
                              />
                              <button
                                onClick={() =>
                                  updateSection(i, {
                                    metrics: s.metrics.filter((_, j) => j !== mi),
                                  })
                                }
                                className="p-2 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="space-y-6">
          <div className="rounded-2xl border border-border p-4">
            <label className="text-xs uppercase tracking-widest text-muted-foreground">Cover image</label>
            <div className="mt-2 rounded-xl overflow-hidden aspect-[4/3]" style={{ backgroundColor: p.accent }}>
              {p.cover_url && (
                resolveImage(p.cover_url).toLowerCase().endsWith(".mp4") ? (
                  <video
                    src={resolveImage(p.cover_url)}
                    className="w-full h-full object-cover"
                    muted
                    playsInline
                    loop
                    autoPlay
                  />
                ) : (
                  <img src={resolveImage(p.cover_url)} alt="" className="w-full h-full object-cover" />
                )
              )}
            </div>
            <label className="mt-3 inline-flex items-center gap-2 cursor-pointer text-sm story-link">
              <Upload className="w-4 h-4" /> {uploading === "cover" ? "Uploading…" : "Upload new cover"}
              <input type="file" accept="image/*,image/gif,video/mp4" className="hidden"
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
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={p.isVisible} onChange={(e) => update({ isVisible: e.target.checked })} />
              Visible in project list
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={p.isPasswordProtected}
                onChange={(e) =>
                  update({
                    isPasswordProtected: e.target.checked,
                    passwordHash: e.target.checked ? p.passwordHash : "",
                  })
                }
              />
              Password protected
            </label>
            {p.isPasswordProtected && (
              <Field label="Case study password">
                <input
                  type="password"
                  className={inp}
                  placeholder={p.passwordHash ? "Enter new password to replace current one" : "Set a password"}
                  onChange={async (e) => {
                    const nextPassword = e.target.value;
                    if (nextPassword.trim().length === 0) {
                      update({ passwordHash: "" });
                      return;
                    }
                    const hashed = await hashPassword(nextPassword.trim());
                    update({ passwordHash: hashed });
                  }}
                />
                <p className="text-[11px] text-muted-foreground mt-1">
                  Password is hashed before save. Leave empty to keep current hash.
                </p>
              </Field>
            )}
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
            <p className="text-[10px] text-muted-foreground mb-2 leading-relaxed">
              1 → hero · 2 → grid · 3+ → swipeable carousel. Yatay görseller 4:3, dikey görseller 1:2 olarak otomatik kırpılır.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {p.gallery.map((g, i) => {
                const o: Orientation = p.gallery_meta[i]?.orientation ?? "landscape";
                return (
                  <div key={i} className="relative group">
                    <img
                      src={resolveImage(g)}
                      alt=""
                      className={`w-full object-cover rounded-lg ${
                        o === "portrait" ? "aspect-[1/2]" : "aspect-[4/3]"
                      }`}
                    />
                    <span className="absolute top-1.5 left-1.5 text-[9px] px-1.5 py-0.5 rounded-full bg-background/90 border border-border text-muted-foreground">
                      {o === "portrait" ? "1:2" : "4:3"}
                    </span>
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
                        onClick={() => removeGallery(i)}
                        className="p-1 rounded-full bg-background/90 hover:text-destructive"
                        title="Remove"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {p.gallery.length === 0 && (
                <p className="col-span-2 text-[11px] text-muted-foreground italic text-center py-3">
                  No images yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

const inp =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent";

// Workaround so the `GalleryMeta` type import isn't dropped when treeshaking types
type _GalleryMetaUsed = GalleryMeta;

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs uppercase tracking-widest text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}
