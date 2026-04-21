import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2, Upload, FileText, Image as ImageIcon, X, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchSiteSettings,
  parseAboutContent,
  serializeAboutContent,
  type SiteSettings,
  type ExperienceItem,
  type WhatIDoItem,
} from "@/lib/site-settings";
import { resolveImage } from "@/lib/projects";
import { Section, Field, inputCls } from "@/components/admin/SettingsField";
import { ListEditor } from "@/components/admin/ListEditor";
import { RecommendationsEditor } from "@/components/admin/RecommendationsEditor";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

type Status = { kind: "idle" } | { kind: "saving" } | { kind: "success"; msg: string } | { kind: "error"; msg: string };
type Chip = "status" | "home" | "about" | "recommendations" | "footer" | "header_footer";

const CHIPS: { id: Chip; label: string }[] = [
  { id: "status", label: "Site Status" },
  { id: "header_footer", label: "Header" },
  { id: "home", label: "Home Page" },
  { id: "about", label: "About Me" },
  { id: "recommendations", label: "Recommendations" },
  { id: "footer", label: "Footer" },
];

function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [activeChip, setActiveChip] = useState<Chip>("status");
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAlbum, setUploadingAlbum] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const hasLocalEditsRef = useRef(false);
  const loadRequestRef = useRef(0);
  const prevSnapshotRef = useRef<string>("");

  const load = (source: string) => {
    const requestId = ++loadRequestRef.current;
    console.log("[admin.settings] load:start", { source, requestId });
    setLoading(true);
    fetchSiteSettings().then((s) => {
      console.log("[admin.settings] load:resolved", {
        source,
        requestId,
        hasLocalEdits: hasLocalEditsRef.current,
        hasData: Boolean(s),
      });
      setSettings((current) => {
        if (hasLocalEditsRef.current && current) {
          console.log("[admin.settings] load:ignored-to-prevent-overwrite", { source, requestId });
          return current;
        }
        console.log("[admin.settings] load:applied", { source, requestId });
        return s;
      });
      setLoading(false);
    });
  };

  useEffect(() => {
    load("mount");
  }, []);

  const update = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) => {
    hasLocalEditsRef.current = true;
    console.log("[admin.settings] update", { key, value });
    setSettings((s) => (s ? { ...s, [key]: value } : s));
  };

  useEffect(() => {
    if (!settings) return;
    const snapshot = JSON.stringify({
      experience_items: settings.experience_items,
      what_i_do_items: settings.what_i_do_items,
    });
    if (prevSnapshotRef.current && prevSnapshotRef.current !== snapshot) {
      console.log("[admin.settings] list-state-changed", {
        previous: JSON.parse(prevSnapshotRef.current),
        next: JSON.parse(snapshot),
      });
    }
    prevSnapshotRef.current = snapshot;
  }, [settings]);

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
        maintenance_enabled: settings.maintenance_enabled,
        maintenance_message: settings.maintenance_message,
        booking_banner_cta_label: settings.booking_banner_cta_label,
        booking_banner_cta_email: settings.booking_banner_cta_email,
        linkedin_url: settings.linkedin_url,
        footer_tagline: settings.footer_tagline,
        footer_email: settings.footer_email,
        footer_copyright: settings.footer_copyright,
        footer_credit: settings.footer_credit,
      })
      .eq("id", settings.id);
    if (error) {
      setStatus({ kind: "error", msg: error.message });
      return;
    }
    hasLocalEditsRef.current = false;
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

  const handleAboutAlbumUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files ?? []);
    if (files.length === 0 || !settings) return;

    const invalidFile = files.find((file) => !file.type.startsWith("image/"));
    if (invalidFile) {
      setStatus({ kind: "error", msg: "Please upload image files only." });
      return;
    }

    setUploadingAlbum(true);
    const uploadedUrls: string[] = [];
    for (const file of files) {
      const url = await uploadFile(file, "about");
      if (url) uploadedUrls.push(url);
    }
    setUploadingAlbum(false);
    if (uploadedUrls.length === 0) return;

    const about = parseAboutContent(settings.about_body);
    const nextBody = serializeAboutContent(about.body, [...about.albumUrls, ...uploadedUrls]);
    update("about_body", nextBody);

    setStatus({ kind: "success", msg: `${uploadedUrls.length} album image(s) uploaded.` });
    setTimeout(() => setStatus({ kind: "idle" }), 2500);
    e.target.value = "";
  };

  const removeAlbumImage = (index: number) => {
    if (!settings) return;
    const about = parseAboutContent(settings.about_body);
    const nextAlbum = about.albumUrls.filter((_, i) => i !== index);
    update("about_body", serializeAboutContent(about.body, nextAlbum));
  };

  const processLogoFile = async (file: File) => {
    if (!settings) return;
    if (file.type !== "image/svg+xml" && !file.name.toLowerCase().endsWith(".svg")) {
      setStatus({ kind: "error", msg: "Please upload an SVG file." });
      return;
    }
    setUploadingLogo(true);
    const path = `logo/${Date.now()}-${file.name.replace(/[^a-z0-9.-]/gi, "_")}`;
    const { error: upErr } = await supabase.storage
      .from("site-assets")
      .upload(path, file, { cacheControl: "3600", upsert: true, contentType: "image/svg+xml" });
    if (upErr) {
      setUploadingLogo(false);
      setStatus({ kind: "error", msg: upErr.message });
      return;
    }
    const { data } = supabase.storage.from("site-assets").getPublicUrl(path);
    const url = data.publicUrl;
    await supabase.from("site_settings").update({ logo_svg_url: url }).eq("id", settings.id);
    update("logo_svg_url", url);
    setUploadingLogo(false);
    setStatus({ kind: "success", msg: "Logo uploaded." });
    setTimeout(() => setStatus({ kind: "idle" }), 2500);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) await processLogoFile(file);
    e.target.value = "";
  };

  const handleLogoDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLogoDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processLogoFile(file);
  };

  const removeLogo = async () => {
    if (!settings || !confirm("Remove logo and use the text wordmark fallback?")) return;
    await supabase.from("site_settings").update({ logo_svg_url: null }).eq("id", settings.id);
    update("logo_svg_url", null);
  };

  if (loading || !settings) {
    return (
      <div className="flex items-center gap-3 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading settings…
      </div>
    );
  }

  const aboutContent = parseAboutContent(settings.about_body);
  const aboutAlbumUrls = aboutContent.albumUrls;

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

      {/* SITE STATUS */}
      {activeChip === "status" && (
        <div className="space-y-12">
          <Section
            title="Coming Soon mode"
            description="When enabled, public visitors see a simple Coming Soon page instead of your portfolio. You and any signed-in admin can still browse the live site normally."
          >
            <Field label="Mode">
              <label className="inline-flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.maintenance_enabled}
                  onChange={(e) => update("maintenance_enabled", e.target.checked)}
                  className="accent-accent w-4 h-4 mt-1"
                />
                <span className="text-sm">
                  <span className="font-medium block">
                    {settings.maintenance_enabled
                      ? "Coming Soon page is LIVE"
                      : "Site is fully public"}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {settings.maintenance_enabled
                      ? "Visitors at muratkarci.com see the Coming Soon page. Toggle off to launch."
                      : "Visitors see your full portfolio. Toggle on to hide the site behind a Coming Soon page."}
                  </span>
                </span>
              </label>
            </Field>

            <Field
              label="Coming Soon message"
              hint="Shown under the headline. Keep it short."
            >
              <textarea
                value={settings.maintenance_message}
                onChange={(e) => update("maintenance_message", e.target.value)}
                rows={3}
                className={inputCls}
                disabled={!settings.maintenance_enabled}
              />
            </Field>

            <div
              className={`rounded-xl border px-4 py-3 text-xs ${
                settings.maintenance_enabled
                  ? "border-accent/40 bg-accent/10 text-foreground"
                  : "border-border bg-muted/40 text-muted-foreground"
              }`}
            >
              <p className="font-medium mb-1">
                {settings.maintenance_enabled
                  ? "🚧 Coming Soon mode is ON"
                  : "✓ Site is fully public"}
              </p>
              <p>
                Admins (you) and the Preview tab always see the real site —
                this toggle only affects logged-out visitors.
              </p>
            </div>
          </Section>
        </div>
      )}

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

          <Section title="Currently Booking banner" description="Status pill + CTA button shown above the hero headline.">
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
            <Field label="Status text">
              <input
                type="text"
                value={settings.booking_banner_text}
                onChange={(e) => update("booking_banner_text", e.target.value)}
                className={inputCls}
                disabled={!settings.booking_banner_enabled}
              />
            </Field>
            <Field label="CTA button label" hint="Shown on the red button next to the status text. Leave both CTA fields empty to hide the button.">
              <input
                type="text"
                value={settings.booking_banner_cta_label}
                onChange={(e) => update("booking_banner_cta_label", e.target.value)}
                className={inputCls}
                disabled={!settings.booking_banner_enabled}
                placeholder="hello@muratkarci.design"
              />
            </Field>
            <Field label="CTA email address" hint="Clicking the button opens the user's mail app addressed here.">
              <input
                type="email"
                value={settings.booking_banner_cta_email}
                onChange={(e) => update("booking_banner_cta_email", e.target.value)}
                className={inputCls}
                disabled={!settings.booking_banner_enabled}
                placeholder="hello@muratkarci.design"
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
              <textarea
                value={aboutContent.body}
                onChange={(e) => update("about_body", serializeAboutContent(e.target.value, aboutAlbumUrls))}
                rows={8}
                className={inputCls}
              />
            </Field>

            <Field label="LinkedIn URL" hint="Shown as a button under the bio and as a link in the footer. Leave empty to hide.">
              <input
                type="url"
                value={settings.linkedin_url ?? ""}
                onChange={(e) => update("linkedin_url", e.target.value || null)}
                className={inputCls}
                placeholder="https://linkedin.com/in/your-handle"
              />
            </Field>

            <Field label="Profile photo" hint="Used in the homepage hero on desktop.">
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

            <Field label="About album" hint="Shown above the intro text as a stacked photo strip.">
              <div className="space-y-3">
                <label className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm cursor-pointer hover:bg-accent transition-colors">
                  {uploadingAlbum ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploadingAlbum ? "Uploading…" : "Add album images"}
                  <input type="file" multiple accept="image/*" onChange={handleAboutAlbumUpload} className="hidden" disabled={uploadingAlbum} />
                </label>

                {aboutAlbumUrls.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {aboutAlbumUrls.map((url, index) => (
                      <div key={`${url}-${index}`} className="relative rounded-xl overflow-hidden border border-border bg-muted">
                        <img src={resolveImage(url)} alt={`Album ${index + 1}`} className="w-full h-28 object-cover" />
                        <button
                          onClick={() => removeAlbumImage(index)}
                          className="absolute top-1.5 right-1.5 rounded-full bg-background/90 border border-border p-1 hover:text-destructive"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No album images yet.</p>
                )}
              </div>
            </Field>
          </Section>

          <Section title="What I Do" description="Services / capabilities grid.">
            <Field label="Section title">
              <input type="text" value={settings.what_i_do_title} onChange={(e) => update("what_i_do_title", e.target.value)} className={inputCls} />
            </Field>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium block">
                Items
              </span>
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
            </div>
          </Section>

          <Section title="Experience" description="Work history timeline.">
            <Field label="Section title">
              <input type="text" value={settings.experience_title} onChange={(e) => update("experience_title", e.target.value)} className={inputCls} />
            </Field>
            <div className="space-y-2">
              <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium block">
                Roles
              </span>
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
            </div>
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

      {/* FOOTER */}
      {activeChip === "footer" && (
        <div className="space-y-12">
          <Section title="Footer content" description="Bottom of every page. The last word of the tagline is auto-emphasized in accent color.">
            <Field label="Tagline" hint="Last word renders in accent color (e.g. “Let's build something together.” → ‘together.’)">
              <input
                type="text"
                value={settings.footer_tagline}
                onChange={(e) => update("footer_tagline", e.target.value)}
                className={inputCls}
                placeholder="Let's build something together."
              />
            </Field>
            <Field label="Contact email" hint="Shown under the tagline as a clickable mailto link.">
              <input
                type="email"
                value={settings.footer_email}
                onChange={(e) => update("footer_email", e.target.value)}
                className={inputCls}
                placeholder="hello@muratkarci.design"
              />
            </Field>
            <Field label="Copyright line" hint="Use {year} to insert the current year automatically.">
              <input
                type="text"
                value={settings.footer_copyright}
                onChange={(e) => update("footer_copyright", e.target.value)}
                className={inputCls}
                placeholder="© {year} Murat Karcı. Designed & built with care."
              />
            </Field>
            <Field label="Credit line" hint="Right-side small text. Leave empty to hide.">
              <input
                type="text"
                value={settings.footer_credit}
                onChange={(e) => update("footer_credit", e.target.value)}
                className={inputCls}
                placeholder="Crafted in warm cream and coral."
              />
            </Field>
          </Section>
        </div>
      )}

      {/* HEADER & FOOTER (logo) */}
      {activeChip === "header_footer" && (
        <div className="space-y-12">
          <Section
            title="Logo (Header & Footer)"
            description="Upload an SVG to use across both the site header (top-left) and footer (bottom-left). Leave empty to fall back to the “murat karcı” wordmark."
          >
            <Field
              label="Logo SVG"
              hint="SVG only. Recommended height 24–32px. Use currentColor for strokes/fills so the logo adapts to light & dark surfaces."
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setLogoDragOver(true);
                }}
                onDragLeave={() => setLogoDragOver(false)}
                onDrop={handleLogoDrop}
                className={`rounded-2xl border-2 border-dashed p-6 transition-colors ${
                  logoDragOver
                    ? "border-accent bg-accent/5"
                    : "border-border bg-muted/20"
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <label className="inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm cursor-pointer hover:bg-accent transition-colors shrink-0">
                    {uploadingLogo ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    {uploadingLogo
                      ? "Uploading…"
                      : settings.logo_svg_url
                        ? "Replace SVG"
                        : "Choose SVG file"}
                    <input
                      type="file"
                      accept=".svg,image/svg+xml"
                      onChange={handleLogoUpload}
                      className="hidden"
                      disabled={uploadingLogo}
                    />
                  </label>
                  <p className="text-xs text-muted-foreground">
                    or drag & drop an <code className="font-mono">.svg</code> file here
                  </p>
                  {settings.logo_svg_url && (
                    <div className="flex items-center gap-3 sm:ml-auto">
                      <a
                        href={settings.logo_svg_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ExternalLink className="w-3 h-3" /> View file
                      </a>
                      <button
                        onClick={removeLogo}
                        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Field>

            <Field label="Preview" hint="How the logo renders on light and dark surfaces.">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-background p-6 flex items-center justify-center min-h-24">
                  {settings.logo_svg_url ? (
                    <img src={settings.logo_svg_url} alt="Logo preview (light)" className="h-7 w-auto" />
                  ) : (
                    <span className="font-display text-lg tracking-tight font-bold">murat karcı</span>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-foreground p-6 flex items-center justify-center min-h-24">
                  {settings.logo_svg_url ? (
                    <img
                      src={settings.logo_svg_url}
                      alt="Logo preview (dark)"
                      className="h-7 w-auto"
                      style={{ filter: "invert(1)" }}
                    />
                  ) : (
                    <span className="font-display text-lg tracking-tight font-bold text-background">murat karcı</span>
                  )}
                </div>
              </div>
            </Field>
          </Section>
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
