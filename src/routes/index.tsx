import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { fetchProjects, resolveImage, type Project } from "@/lib/projects";
import { fetchSiteSettings, parseAboutContent, type SiteSettings } from "@/lib/site-settings";
import { fetchPublishedRecommendations, type Recommendation } from "@/lib/recommendations";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";
import { RecommendationsSection } from "@/components/site/RecommendationsSection";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
    fetchSiteSettings().then(setSettings);
    fetchPublishedRecommendations().then(setRecommendations);
  }, []);

  const featuredCover = projects.find((p) => p.cover_url)?.cover_url ?? null;
  const linkedin = settings?.linkedin_url ?? null;
  const aboutContent = parseAboutContent(settings?.about_body ?? "");
  const albumUrls = aboutContent.albumUrls;

  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Murat Karcı",
    jobTitle: "Product Designer",
    url: "https://muratkarci.design",
    description:
      "Independent product designer working with founders and product teams on mobile, web, and brand.",
    knowsAbout: [
      "Product Design",
      "Mobile Design",
      "Web Design",
      "Brand Systems",
      "Design Strategy",
    ],
    ...(linkedin ? { sameAs: [linkedin] } : {}),
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Murat Karcı",
    url: "https://muratkarci.design",
    author: { "@type": "Person", name: "Murat Karcı" },
  };

  return (
    <div>
      <Helmet>
        <title>Murat Karcı — Product Designer</title>
        <meta
          name="description"
          content="Independent product designer working with founders and product teams on mobile, web, and brand. Currently open for select projects."
        />
        <meta property="og:title" content="Murat Karcı — Product Designer" />
        <meta
          property="og:description"
          content="Calm, considered product design for ambitious teams."
        />
        <meta property="og:url" content="https://muratkarci.design/" />
        {featuredCover && <meta property="og:image" content={featuredCover} />}
        {featuredCover && <meta name="twitter:image" content={featuredCover} />}
        {featuredCover && <meta name="twitter:card" content="summary_large_image" />}
        <script type="application/ld+json">{JSON.stringify(personLd)}</script>
        <script type="application/ld+json">{JSON.stringify(websiteLd)}</script>
      </Helmet>

      {/* HERO — Webstack-inspired layout (left info card + oversized headline with inline pill highlights) */}
      <section className="relative overflow-hidden">
        {/* Decorative wavy lines (pure CSS, sits behind content) */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "repeating-radial-gradient(circle at 80% 20%, transparent 0, transparent 38px, color-mix(in oklab, var(--color-foreground) 6%, transparent) 38px, color-mix(in oklab, var(--color-foreground) 6%, transparent) 39px)",
          }}
        />

        <div className="relative mx-auto max-w-6xl page-shell pt-16 md:pt-24 pb-14 md:pb-20">
          {/* Top "available" pill, centered above headline area */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center md:justify-end"
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 backdrop-blur px-4 py-1.5 text-xs tracking-wide text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
              </span>
              {settings?.hero_eyebrow ?? "Available for select projects"}
            </span>
          </motion.div>

          <div className="mt-10 md:mt-14 grid md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)] gap-8 md:gap-12 items-start">
            {/* LEFT — info card */}
            <motion.aside
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.05 }}
              className="md:sticky md:top-24"
            >
              <div className="rounded-3xl border border-border bg-background/70 backdrop-blur-sm p-5 shadow-[var(--shadow-soft)]">
                <div className="flex items-center gap-4">
                  {settings?.about_image_url ? (
                    <img
                      src={resolveImage(settings.about_image_url)}
                      alt="Portrait of Murat Karcı"
                      className="w-16 h-16 rounded-full object-cover ring-1 ring-border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-muted border border-dashed border-border" />
                  )}
                  <div className="min-w-0">
                    <p className="font-display text-lg leading-tight font-medium truncate">
                      Murat Karcı
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      Product Designer
                    </p>
                  </div>
                </div>

                {linkedin && (
                  <div className="mt-5 flex items-center gap-2">
                    <a
                      href={linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="LinkedIn"
                      className="flex items-center justify-center w-9 h-9 rounded-full border border-border text-muted-foreground hover:text-accent hover:border-accent transition-colors"
                    >
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8.34 18.34V9.67H5.67v8.67zM7 8.5a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1m11.34 9.84v-4.75c0-2.55-1.36-3.74-3.18-3.74a2.74 2.74 0 0 0-2.49 1.37h-.04V9.67h-2.56v8.67h2.66v-4.29c0-1.13.21-2.22 1.61-2.22s1.4 1.29 1.4 2.29v4.22z" />
                      </svg>
                    </a>
                  </div>
                )}

                <div className="mt-5 pt-5 border-t border-border/60">
                  <p className="uppercase tracking-[0.18em] text-[10px] text-muted-foreground">
                    2018 — Present
                  </p>
                </div>
              </div>
            </motion.aside>

            {/* RIGHT — oversized headline + inline pill highlights */}
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="font-display font-medium tracking-[-0.03em] leading-[0.95] text-[2.4rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[5.5rem] text-balance"
              >
                <span className="inline-flex items-center align-middle mr-3 mb-2 rounded-full bg-foreground text-background px-4 py-1.5 text-base md:text-xl lg:text-2xl font-medium tracking-normal">
                  Hi, I’m
                </span>
                <span className="inline-flex items-center align-middle mr-3 mb-2 rounded-full border border-border bg-background px-4 py-1.5 text-base md:text-xl lg:text-2xl font-medium tracking-normal">
                  Murat
                </span>
                <br className="hidden md:block" />
                {settings?.hero_title ?? "I design calm software"}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.28 }}
                className="mt-8 md:mt-10 text-base md:text-lg text-muted-foreground max-w-xl leading-relaxed"
              >
                {settings?.hero_subtitle ??
                  "Independent product designer working with founders and product teams on mobile, web and brand."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.36 }}
                className="mt-9 flex flex-wrap gap-3"
              >
                <Link to="/work" className="btn-accent group">
                  See selected work
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link to="/about" className="btn-secondary">
                  About me
                </Link>
              </motion.div>
            </div>
          </div>

          {albumUrls.length > 0 && (
            <div className="mt-10 md:mt-12 overflow-x-auto">
              <div className="min-w-max flex items-end gap-2 md:gap-3 px-1 py-2">
                {albumUrls.map((url, index) => (
                  <motion.div
                    key={`${url}-${index}`}
                    initial={{ opacity: 0, y: 16, rotate: 0 }}
                    animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -5 : 5 }}
                    transition={{ duration: 0.45, delay: index * 0.04 }}
                    className="bg-background border border-border p-2 rounded-sm shadow-[var(--shadow-soft)]"
                  >
                    <img
                      src={resolveImage(url)}
                      alt={`Homepage album ${index + 1}`}
                      className="w-24 h-32 md:w-28 md:h-36 lg:w-32 lg:h-40 object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          aria-hidden="true"
          role="presentation"
          className="marquee-pause border-y border-border/60 bg-muted/30 py-5 md:py-6 overflow-hidden"
        >
          <div className="flex gap-8 md:gap-10 animate-marquee whitespace-nowrap font-display text-lg md:text-xl text-foreground tracking-tight">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-8 md:gap-10 shrink-0">
                <span>Product Design</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>Mobile &amp; Web</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>Brand Systems</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>Design Strategy</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                <span>Prototyping</span>
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="mx-auto max-w-6xl page-shell py-24 md:py-32">
        <Reveal className="flex items-end justify-between mb-14">
          <div>
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
              Selected work
            </p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight font-medium">
              Recent case studies
            </h2>
          </div>
          <Link to="/work" className="story-link text-sm hidden sm:inline-block">
            view all →
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-16 md:gap-y-24">
          {projects.slice(0, 4).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <RecommendationsSection
        title={settings?.recommendations_title ?? "What people say"}
        items={recommendations}
      />
    </div>
  );
}
