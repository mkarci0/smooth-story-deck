import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Upload, FileText, Image as ImageIcon, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { resolveImage } from "@/lib/projects";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "success"; msg: string } | { kind: "error"; msg: string };

function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
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
        about_title: settings.about_title,
        about_intro: settings.about_intro,
        about_body: settings.about_body,
        about_image_url: settings.about_image_url,
        resume_url: settings.resume_url,
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
    const { error } = await supabase
      .from("site_settings")
      .update({ resume_url: url })
      .eq("id", settings.id);
    if (error) {
      setStatus({ kind: "error", msg: error.message });
      return;
    }
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
    const { error } = await supabase
      .from("site_settings")
      .update({ about_image_url: url })
      .eq("id", settings.id);
    if (error) {
      setStatus({ kind: "error", msg: error.message });
      return;
    }
    update("about_image_url", url);
    setStatus({ kind: "success", msg: "Photo uploaded." });
    setTimeout(() => setStatus({ kind: "idle" }), 2500);
    e.target.value = "";
  };

  const removeResume = async () => {
    if (!settings) return;
    if (!confirm("Remove current resume?")) return;
    await supabase.from("site_settings").update({ resume_url: null }).eq("id", settings.id);
    update("resume_url", null);
  };

  const removePhoto = async () => {
    if (!settings) return;
    if (!confirm("Remove current photo?")) return;
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
    <div className="space-y-12 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl tracking-tight">Site Settings</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage hero text, About Me content, resume, and profile photo.
          </p>
        </div>
        <Link to="/admin" className="story-link text-sm text-muted-foreground">
          ← back
        </Link>
      </div>

      {/* HERO */}
      <Section title="Hero (Homepage)">
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

      {/* ABOUT */}
      <Section title="About Me">
        <Field label="Section title">
          <input
            type="text"
            value={settings.about_title}
            onChange={(e) => update("about_title", e.target.value)}
            className={inputCls}
          />
        </Field>
        <Field label="Intro headline">
          <textarea
            value={settings.about_intro}
            onChange={(e) => update("about_intro", e.target.value)}
            rows={2}
            className={inputCls}
          />
        </Field>
        <Field label="Bio (paragraphs separated by empty lines)">
          <textarea
            value={settings.about_body}
            onChange={(e) => update("about_body", e.target.value)}
            rows={8}
            className={inputCls}
          />
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
                <button
                  onClick={removePhoto}
                  className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive ml-3"
                >
                  <X className="w-3 h-3" /> Remove
                </button>
              )}
              <p className="text-xs text-muted-foreground">JPG/PNG/WEBP. Recommended 4:5 portrait, ~1024×1280.</p>
            </div>
          </div>
        </Field>
      </Section>

      {/* RESUME */}
      <Section title="Resume / CV">
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
                  <a
                    href={settings.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <ExternalLink className="w-3 h-3" /> View current
                  </a>
                  <button
                    onClick={removeResume}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                </div>
              )}
              <p className="text-xs text-muted-foreground">PDF only. Linked from the "Resume" button in the site header.</p>
            </div>
          </div>
        </Field>
      </Section>

      {/* SAVE BAR */}
      <div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-background/95 backdrop-blur p-4 shadow-[var(--shadow-soft)]">
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
          Save text changes
        </button>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <h3 className="font-display text-lg tracking-tight border-b border-border pb-2">{title}</h3>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">{label}</span>
      {children}
    </label>
  );
}
