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

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-20 md:pt-32 pb-14 md:pb-20">
          <div className="grid md:grid-cols-[minmax(0,1fr)_360px] lg:grid-cols-[minmax(0,1fr)_420px] gap-10 items-start">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-display text-4xl md:text-5xl lg:text-6xl tracking-[-0.02em] leading-[1.05] text-balance max-w-3xl font-medium"
              >
                {settings?.hero_title ?? "Hi, I'm Murat. I design calm software."}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-7 text-base md:text-lg text-muted-foreground max-w-xl text-balance leading-relaxed"
              >
                {settings?.hero_subtitle ??
                  "Independent product designer working with founders and product teams on mobile, web and brand."}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="mt-10 flex flex-wrap gap-3"
              >
                <Link to="/work" className="btn-primary group">
                  See selected work
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link to="/about" className="btn-secondary">
                  About me
                </Link>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="hidden md:block justify-self-end w-full"
            >
              {settings?.about_image_url ? (
                <img
                  src={resolveImage(settings.about_image_url)}
                  alt="Portrait of Murat Karcı"
                  className="w-full max-w-[420px] aspect-[4/5] object-cover rounded-3xl shadow-[var(--shadow-soft)]"
                />
              ) : (
                <div className="w-full max-w-[420px] aspect-[4/5] rounded-3xl bg-muted border border-dashed border-border" />
              )}
            </motion.div>
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
          className="border-y border-border/60 bg-muted/30 py-5 overflow-hidden"
        >
          <div className="flex gap-12 animate-marquee whitespace-nowrap font-display text-xl md:text-2xl text-foreground/70 tracking-tight">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 shrink-0">
                <span>Product Design</span><span className="text-accent">+</span>
                <span>Mobile & Web</span><span className="text-accent">+</span>
                <span>Brand Systems</span><span className="text-accent">+</span>
                <span>Design Strategy</span><span className="text-accent">+</span>
                <span>Prototyping</span><span className="text-accent">+</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-24 md:py-32">
        <Reveal className="flex items-end justify-between mb-14">
          <div>
            {settings?.booking_banner_enabled !== false && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ duration: 0.6 }}
                className="inline-flex flex-wrap items-center gap-3 mb-5"
              >
                <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden />
                  {settings?.booking_banner_text ?? settings?.hero_eyebrow ?? "Available for select projects · 2025"}
                </span>
                {settings?.booking_banner_cta_label && settings?.booking_banner_cta_email && (
                  <a
                    href={`mailto:${settings.booking_banner_cta_email}`}
                    className="inline-flex items-center rounded-full bg-accent text-accent-foreground px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                  >
                    {settings.booking_banner_cta_label}
                  </a>
                )}
              </motion.div>
            )}
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
