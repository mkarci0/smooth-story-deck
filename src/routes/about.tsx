import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { resolveImage } from "@/lib/projects";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Me — Murat Karcı, Product Designer" },
      {
        name: "description",
        content:
          "Murat Karcı is an independent product designer with years of experience across startups and design studios.",
      },
      { property: "og:title", content: "About Me — Murat Karcı" },
      {
        property: "og:description",
        content: "Independent product designer working with founders and product teams.",
      },
    ],
  }),
  component: AboutPage,
});

const experience = [
  { role: "Independent Product Designer", company: "Self-employed", years: "2023 — Now" },
  { role: "Senior Product Designer", company: "Pulse Analytics", years: "2020 — 2023" },
  { role: "Product Designer", company: "Loom & Co.", years: "2018 — 2020" },
  { role: "UI Designer", company: "Studio Mira", years: "2016 — 2018" },
];

const services = [
  { title: "Product design", body: "End-to-end design for web and mobile apps — from research to ready-to-ship Figma." },
  { title: "Design systems", body: "Scalable component libraries that survive contact with real engineering teams." },
  { title: "Brand & identity", body: "Wordmarks, palettes and small visual languages for early-stage products." },
  { title: "Design partner", body: "Embedded with your team for a sprint or a season — strategy, critique, momentum." },
];

function AboutPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  const title = settings?.about_title ?? "About Me";
  const intro = settings?.about_intro ?? "I help teams ship software people actually want to use.";
  const body = settings?.about_body ?? "";
  const photo = settings?.about_image_url ? resolveImage(settings.about_image_url) : null;

  // Split body into paragraphs on blank lines
  const paragraphs = body.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="mx-auto max-w-5xl px-6 lg:px-10 pt-20 md:pt-28">
      {/* INTRO */}
      <section className="grid md:grid-cols-[1fr_280px] gap-12 items-start">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-4">
            {title}
          </p>
          <h1 className="font-display text-4xl md:text-5xl tracking-[-0.02em] leading-[1.05] text-balance font-medium">
            {intro}
          </h1>
          <div className="mt-8 space-y-5 text-base md:text-lg text-foreground/85 max-w-xl leading-relaxed">
            {paragraphs.length > 0 ? (
              paragraphs.map((p, i) => <p key={i}>{p}</p>)
            ) : (
              <p className="text-muted-foreground italic">No bio yet — add one in Admin → Site Settings.</p>
            )}
          </div>
        </motion.div>

        {photo ? (
          <motion.img
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            src={photo}
            alt="Portrait of Murat Karcı"
            className="w-full max-w-[280px] aspect-[4/5] object-cover rounded-3xl shadow-[var(--shadow-soft)] justify-self-end"
          />
        ) : (
          <div className="w-full max-w-[280px] aspect-[4/5] rounded-3xl bg-muted border border-dashed border-border flex items-center justify-center text-xs text-muted-foreground text-center px-4 justify-self-end">
            Upload a profile photo in
            <br />Admin → Site Settings
          </div>
        )}
      </section>

      {/* SERVICES */}
      <section className="mt-28 md:mt-36">
        <Reveal>
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            What I do
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
            Four ways we can work together.
          </h2>
        </Reveal>

        <div className="mt-12 grid sm:grid-cols-2 gap-px bg-border rounded-3xl overflow-hidden border border-border">
          {services.map((s, i) => (
            <Reveal
              key={s.title}
              delay={i * 0.05}
              className="bg-background p-8 md:p-10 hover:bg-muted/40 transition-colors"
            >
              <div className="flex items-baseline gap-3 mb-3">
                <span className="font-display text-accent">0{i + 1}</span>
                <h3 className="font-display text-xl md:text-2xl tracking-tight font-medium">{s.title}</h3>
              </div>
              <p className="text-muted-foreground">{s.body}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* EXPERIENCE */}
      <section className="mt-28 md:mt-36">
        <Reveal>
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            Experience
          </p>
          <h2 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
            A short timeline.
          </h2>
        </Reveal>

        <ul className="mt-12 divide-y divide-border border-y border-border">
          {experience.map((e, i) => (
            <Reveal key={e.role} delay={i * 0.05}>
              <li className="grid grid-cols-[1fr_auto] md:grid-cols-3 items-baseline gap-4 py-6 group">
                <p className="font-display text-xl md:text-2xl tracking-tight font-medium group-hover:text-accent transition-colors">
                  {e.role}
                </p>
                <p className="text-muted-foreground hidden md:block">{e.company}</p>
                <p className="text-sm text-muted-foreground text-right md:text-right">
                  {e.years}
                </p>
              </li>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="mt-28 md:mt-36 rounded-3xl bg-foreground text-background p-10 md:p-16 text-center">
        <Reveal>
          <p className="uppercase tracking-widest text-xs text-background/60 mb-4">
            Currently booking — Q2 / Q3 2025
          </p>
          <h2 className="font-display text-3xl md:text-5xl tracking-tight text-balance font-medium">
            Got a project in mind?
          </h2>
          <Link
            to="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "mailto:hello@muratkarci.design";
            }}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent text-background px-7 py-3.5 text-sm font-medium hover:bg-background hover:text-foreground transition-colors"
          >
            hello@muratkarci.design →
          </Link>
        </Reveal>
      </section>
    </div>
  );
}
