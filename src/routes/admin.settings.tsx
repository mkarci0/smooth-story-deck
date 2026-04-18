import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Upload, FileText, Image as ImageIcon, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteSettings, type SiteSettings, type ExperienceItem, type WhatIDoItem } from "@/lib/site-settings";
import { resolveImage } from "@/lib/projects";
import { Section, Field, inputCls } from "@/components/admin/SettingsField";
import { ListEditor } from "@/components/admin/ListEditor";
import { RecommendationsEditor } from "@/components/admin/RecommendationsEditor";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "success"; msg: string } | { kind: "error"; msg: string };
type Chip = "home" | "about" | "recommendations";

const CHIPS: { id: Chip; label: string }[] = [
  { id: "home", label: "Home Page" },
  { id: "about", label: "About Me" },
  { id: "recommendations", label: "Recommendations" },
];

function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [activeChip, setActiveChip] = useState<Chip>("home");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const load = () => {
    setLoading(true);
    fetchSiteSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  };

  useEffect(load, []);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  const save = async () => {
    if (!settings) return;
    setStatus({ kind: "saving" });
    const { error } = await supabase
      .from("site_settings")
      .update({
        hero_eyebrow: settings.hero_eyebrow,
        hero_title: settings.hero_title,
        hero_subtitle: settings.hero_subtitle,
        booking_banner_enabled: settings.booking_banner_enabled,
        booking_banner_text: settings.booking_banner_text,
        about_title: settings.about_title,
        about_intro: settings.about_intro,
        about_body: settings.about_body,
        about_image_url: settings.about_image_url,
        resume_url: settings.resume_url,
        experience_title: settings.experience_title,
        experience_items: settings.experience_items,
        what_i_do_title: settings.what_i_do_title,
        what_i_do_items: settings.what_i_do_items,
        recommendations_title: settings.recommendations_title,
      })
      .eq("id", settings.id);
    if (error) {
      setStatus({ kind: "error", msg: error.message });
      return;
    }
    setStatus({ kind: "success", msg: "Saved." });
    setTimeout(() => setStatus({ kind: "idle" }), 2500);
  };

  const uploadFile = async (file: File, folder: "resume" | "about"): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const path = `${folder}/${folder}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { cacheControl: "3600", upsert: true, contentType: file.type });
    if (upErr) {
      setStatus({ kind: "error", msg: upErr.message });
      return null;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    return data.publicUrl;
  };

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    if (file.type !== "application/pdf") {
      setStatus({ kind: "error", msg: "Please upload a PDF file." });
      return;
    }
    setUploadingResume(true);
    const url = await uploadFile(file, "resume");
    setUploadingResume(false);
    if (!url) return;
    await supabase.from("site_settings").update({ resume_url: url }).eq("id", settings.id);
    update("resume_url", url);
    setStatus({ kind: "success", msg: "Resume uploaded." });
    setTimeout(() => setStatus({ kind: "idle" }), 2500);
    e.target.value = "";
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    if (!file.type.startsWith("image/")) {
      setStatus({ kind: "error", msg: "Please upload an image file." });
      return;
    }
    setUploadingPhoto(true);
    const url = await uploadFile(file, "about");
    setUploadingPhoto(false);
    if (!url) return;
    await supabase.from("site_settings").update({ about_image_url: url }).eq("id", settings.id);
    update("about_image_url", url);
    setStatus({ kind: "success", msg: "Photo uploaded." });
    setTimeout(() => setStatus({ kind: "idle" }), 2500);
    e.target.value = "";
  };

  const removeResume = async () => {
    if (!settings || !confirm("Remove current resume?")) return;
    await supabase.from("site_settings").update({ resume_url: null }).eq("id", settings.id);
    update("resume_url", null);
  };

  const removePhoto = async () => {
    if (!settings || !confirm("Remove current photo?")) return;
    await supabase.from("site_settings").update({ about_image_url: null }).eq("id", settings.id);
    update("about_image_url", null);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl pb-32">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight font-semibold">Site Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage every section of your portfolio site.
          </p>
        </div>
        <Link to="/admin" className="story-link text-sm text-muted-foreground">
          ← back
        </Link>
      </div>

      {/* CHIPS — secondary nav */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {CHIPS.map((c) => {
          const active = activeChip === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveChip(c.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                active
                  ? "bg-accent text-accent-foreground border-accent"
                  : "bg-background text-muted-foreground border-border hover:text-foreground hover:border-foreground/30"
              }`}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* HOME PAGE */}
      {activeChip === "home" && (
        <div className="space-y-12">
          <Section title="Hero" description="The headline section visitors see first.">
            <Field label="Eyebrow text">
              <input
                type="text"
                value={settings.hero_eyebrow}
                onChange={(e) => update("hero_eyebrow", e.target.value)}
                className={inputCls}
              />
            </Field>
            <Field label="Title">
              <textarea
                value={settings.hero_title}
                onChange={(e) => update("hero_title", e.target.value)}
                rows={2}
                className={inputCls}
              />
            </Field>
            <Field label="Subtitle">
              <textarea
                value={settings.hero_subtitle}
                onChange={(e) => update("hero_subtitle", e.target.value)}
                rows={3}
                className={inputCls}
              />
            </Field>
          </Section>

          <Section title="Currently Booking banner" description="Shown as the small status pill above the hero headline.">
            <Field label="Show banner">
              <label className="inline-flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.booking_banner_enabled}
                  onChange={(e) => update("booking_banner_enabled", e.target.checked)}
                  className="accent-accent w-4 h-4"
                />
                <span className="text-sm">{settings.booking_banner_enabled ? "Visible on homepage" : "Hidden"}</span>
              </label>
            </Field>
            <Field label="Banner text">
              <input
                type="text"
                value={settings.booking_banner_text}
                onChange={(e) => update("booking_banner_text", e.target.value)}
                className={inputCls}
                disabled={!settings.booking_banner_enabled}
              />
            </Field>
          </Section>

          <Section title="Resume / CV" description="PDF linked from the header 'Resume' button.">
            <Field label="Resume PDF">
              <div className="flex items-start gap-4">
                <div className="w-28 h-32 rounded-2xl bg-muted flex items-center justify-center shrink-0 border border-border">
                  <FileText className={`w-8 h-8 ${settings.resume_url ? "text-accent" : "text-muted-foreground"}`} />
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm cursor-pointer hover:bg-accent transition-colors">
                    {uploadingResume ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingResume ? "Uploading…" : settings.resume_url ? "Replace PDF" : "Upload PDF"}
                    <input type="file" accept="application/pdf" onChange={handleResumeUpload} className="hidden" disabled={uploadingResume} />
                  </label>
                  {settings.resume_url && (
                    <div className="flex items-center gap-3 ml-3">
                      <a href={settings.resume_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                        <ExternalLink className="w-3 h-3" /> View
                      </a>
                      <button onClick={removeResume} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Field>
          </Section>
        </div>
      )}

      {/* ABOUT ME */}
      {activeChip === "about" && (
        <div className="space-y-12">
          <Section title="Intro" description="Top section of the About page.">
            <Field label="Section eyebrow">
              <input type="text" value={settings.about_title} onChange={(e) => update("about_title", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Headline">
              <textarea value={settings.about_intro} onChange={(e) => update("about_intro", e.target.value)} rows={2} className={inputCls} />
            </Field>
            <Field label="Bio" hint="Separate paragraphs with a blank line.">
              <textarea value={settings.about_body} onChange={(e) => update("about_body", e.target.value)} rows={8} className={inputCls} />
            </Field>

            <Field label="Profile photo">
              <div className="flex items-start gap-4">
                <div className="w-28 h-32 rounded-2xl overflow-hidden bg-muted flex items-center justify-center shrink-0 border border-border">
                  {settings.about_image_url ? (
                    <img src={resolveImage(settings.about_image_url)} alt="About" className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <label className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm cursor-pointer hover:bg-accent transition-colors">
                    {uploadingPhoto ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploadingPhoto ? "Uploading…" : settings.about_image_url ? "Replace photo" : "Upload photo"}
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                  </label>
                  {settings.about_image_url && (
                    <button onClick={removePhoto} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive ml-3">
                      <X className="w-3 h-3" /> Remove
                    </button>
                  )}
                </div>
              </div>
            </Field>
          </Section>

          <Section title="What I Do" description="Services / capabilities grid.">
            <Field label="Section title">
              <input type="text" value={settings.what_i_do_title} onChange={(e) => update("what_i_do_title", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Items">
              <ListEditor<WhatIDoItem>
                items={settings.what_i_do_items}
                onChange={(items) => update("what_i_do_items", items)}
                fields={[
                  { key: "title", label: "Title (e.g. Product design)" },
                  { key: "description", label: "Short description", type: "textarea", rows: 2 },
                ]}
                addLabel="Add capability"
                emptyMessage="No capabilities yet."
              />
            </Field>
          </Section>

          <Section title="Experience" description="Work history timeline.">
            <Field label="Section title">
              <input type="text" value={settings.experience_title} onChange={(e) => update("experience_title", e.target.value)} className={inputCls} />
            </Field>
            <Field label="Roles">
              <ListEditor<ExperienceItem>
                items={settings.experience_items}
                onChange={(items) => update("experience_items", items)}
                fields={[
                  { key: "role", label: "Role (e.g. Senior Product Designer)" },
                  { key: "company", label: "Company" },
                  { key: "years", label: "Years (e.g. 2020 — 2023)" },
                  { key: "description", label: "Optional description", type: "textarea", rows: 2 },
                ]}
                addLabel="Add role"
                emptyMessage="No roles yet."
              />
            </Field>
          </Section>
        </div>
      )}

      {/* RECOMMENDATIONS */}
      {activeChip === "recommendations" && (
        <div className="space-y-8">
          <Section title="Recommendations" description="Shown on the homepage. With 3+ published items it auto-becomes a carousel.">
            <Field label="Section title">
              <input type="text" value={settings.recommendations_title} onChange={(e) => update("recommendations_title", e.target.value)} className={inputCls} />
            </Field>
          </Section>
          <RecommendationsEditor />
        </div>
      )}

      {/* SAVE BAR */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-3xl flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 backdrop-blur p-4 shadow-[var(--shadow-lift)] z-30">
        <p className="text-sm text-muted-foreground">
          {status.kind === "success" && <span className="text-foreground">✓ {status.msg}</span>}
          {status.kind === "error" && <span className="text-destructive">✕ {status.msg}</span>}
          {status.kind === "idle" && "Text changes need to be saved."}
          {status.kind === "saving" && "Saving…"}
        </p>
        <button
          onClick={save}
          disabled={status.kind === "saving"}
          className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-5 py-2 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {status.kind === "saving" && <Loader2 className="w-4 h-4 animate-spin" />}
          Save changes
        </button>
      </div>
    </div>
  );
}
