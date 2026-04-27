import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronRight, Lock } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import {
  fetchProjectAccessBySlug,
  fetchProjectBySlug,
  fetchProjects,
  hashPassword,
  resolveImage,
  type UnifiedSection,
  type OutcomeItem,
} from "@/lib/projects";
import { isProjectUnlocked, markProjectUnlocked } from "@/lib/cookies";
import { Reveal } from "@/components/site/Reveal";
import { ProjectGallery } from "@/components/site/ProjectGallery";
import { CaseStudySideNav } from "@/components/site/CaseStudySideNav";
import { SectionBody } from "@/components/site/SectionBody";

export const Route = createFileRoute("/work/$slug")({
  loader: async ({ params }) => {
    const access = await fetchProjectAccessBySlug(params.slug);
    if (!access || !access.isVisible) throw notFound();

    const unlocked =
      !access.isPasswordProtected ||
      (typeof window !== "undefined" && isProjectUnlocked(params.slug));

    if (!unlocked) {
      return {
        locked: true as const,
        project: access,
        prev: null,
        next: null,
      };
    }

    const [project, all] = await Promise.all([fetchProjectBySlug(params.slug), fetchProjects()]);
    if (!project || !project.isVisible) throw notFound();
    const idx = all.findIndex((x) => x.slug === project.slug);
    const total = all.length;
    const prev = total > 1 ? all[(idx - 1 + total) % total] : null;
    const next = total > 1 ? all[(idx + 1) % total] : null;
    return { locked: false as const, project, prev, next };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <Helmet>
        <title>Case study not found — Murat Karcı</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <h1 className="font-display text-5xl">Case study not found</h1>
      <Link to="/work" className="mt-6 inline-block story-link">← Back to all work</Link>
    </div>
  ),
  component: ProjectDetail,
});

function PasswordRequired({
  title,
  slug,
  passwordHash,
}: {
  title: string;
  slug: string;
  passwordHash: string;
}) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [unlocking, setUnlocking] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUnlocking(true);
    setError("");
    const hashed = await hashPassword(password.trim());
    if (hashed !== passwordHash) {
      setError("Incorrect password, please try again");
      setUnlocking(false);
      return;
    }
    markProjectUnlocked(slug);
    window.location.reload();
  };

  return (
    <section className="mx-auto max-w-6xl page-shell py-24 md:py-32">
      <div className="mx-auto max-w-md rounded-3xl border border-border bg-background p-8 md:p-10 text-center">
        <div className="mx-auto mb-4 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
          <Lock className="w-5 h-5 text-muted-foreground" />
        </div>
        <h1 className="font-display text-3xl tracking-tight">Password Required</h1>
        <p className="mt-3 text-sm text-muted-foreground text-balance">
          This case study is protected. Enter the password to unlock <span className="text-foreground">{title}</span>.
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-accent"
            placeholder="Enter password"
            required
          />
          <button
            type="submit"
            disabled={unlocking}
            className="w-full rounded-full bg-foreground text-background px-5 py-2.5 text-sm transition-colors hover:bg-accent disabled:opacity-70"
          >
            {unlocking ? "Unlocking..." : "Unlock"}
          </button>
        </form>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <p className="mt-5 text-xs text-muted-foreground">
          Accept cookies and we'll remember this unlock for your next visit.
        </p>
      </div>
    </section>
  );
}

function isOverviewLike(s: UnifiedSection, i: number): boolean {
  return (
    i === 0 &&
    !s.image_url &&
    s.metrics.length === 0 &&
    !!s.body &&
    !!s.heading
  );
}

function hasRenderableContent(section: UnifiedSection): boolean {
  return (
    !!section.heading ||
    !!section.body ||
    !!section.image_url ||
    section.metrics.length > 0
  );
}

function createSectionId(baseLabel: string): string {
  const normalized = baseLabel
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
  return normalized.length > 0 ? `case-${normalized}` : "case-section";
}

function SectionRenderer({
  section,
  displayIndex,
  accent,
  title,
  sectionId,
}: {
  section: UnifiedSection;
  displayIndex: number;
  accent: string;
  title: string;
  sectionId: string;
}) {
  const indexLabel = String(displayIndex + 1).padStart(2, "0");
  const hasMetrics = section.metrics.length > 0;
  const hasBody = !!section.body;
  const hasImage = !!section.image_url;
  const hasHeading = !!section.heading;
  const isStacked = section.layout === "stacked";
  const imageShapeClass =
    section.image_orientation === "portrait" ? "aspect-[1/2] max-w-md mx-auto" : "aspect-[4/3]";

  if (!hasHeading && !hasBody && !hasImage && !hasMetrics) return null;

  // Text-only sections (no image, no metrics): fill full content width on the right.
  if (!hasImage && !hasMetrics && hasBody) {
    return (
      <section id={sectionId} className="mx-auto max-w-6xl page-shell mt-20 md:mt-28 scroll-mt-32">
        <Reveal>
          {hasHeading ? (
            <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-6">
              <span className="text-muted-foreground/60 mr-2 text-base md:text-lg align-middle">
                {indexLabel}
              </span>
              {section.heading}
            </h2>
          ) : (
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
              {indexLabel}
            </p>
          )}
          <SectionBody>{section.body}</SectionBody>
        </Reveal>
      </section>
    );
  }

  if (hasMetrics && !hasBody && !hasImage) {
    return (
      <section id={sectionId} className="mx-auto max-w-6xl page-shell mt-20 md:mt-28 scroll-mt-32">
        <Reveal>
          {hasHeading ? (
            <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-8">
              <span className="text-muted-foreground/60 mr-2 text-base md:text-lg align-middle">
                {indexLabel}
              </span>
              {section.heading}
            </h2>
          ) : (
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
              {indexLabel} · Outcome
            </p>
          )}
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">
          {section.metrics.map((m: OutcomeItem, i: number) => (
            <Reveal
              key={`${m.label}-${i}`}
              delay={i * 0.1}
              className="rounded-3xl bg-butter/50 p-8 md:p-10"
            >
              <p className="font-display text-5xl md:text-6xl text-accent tracking-tight">
                {m.value}
              </p>
              <p className="mt-3 text-sm text-foreground/80">{m.label}</p>
            </Reveal>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id={sectionId} className="mx-auto max-w-6xl page-shell mt-20 md:mt-28 scroll-mt-32">
      <Reveal>
        {hasHeading ? (
          <h2 className="font-display text-2xl md:text-3xl tracking-tight mb-6 max-w-3xl">
            <span className="text-muted-foreground/60 mr-2 text-base md:text-lg align-middle">
              {indexLabel}
            </span>
            {section.heading}
          </h2>
        ) : (
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
            {indexLabel}
          </p>
        )}
      </Reveal>
      {hasImage && isStacked ? (
        <div className="space-y-8">
          {hasBody && (
            <Reveal delay={0.05} className="max-w-3xl">
              <SectionBody>{section.body}</SectionBody>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <div className="rounded-3xl overflow-hidden aspect-[16/10]" style={{ backgroundColor: accent }}>
              <img
                src={resolveImage(section.image_url)}
                alt={`${title} — ${section.heading || "section"}`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      ) : (
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          {hasBody && (
            <Reveal
              delay={0.05}
              className={hasImage ? "md:col-span-5" : "md:col-span-12 max-w-3xl"}
            >
              <SectionBody>{section.body}</SectionBody>
            </Reveal>
          )}
          {hasImage && (
            <Reveal delay={0.1} className={hasBody ? "md:col-span-7" : "md:col-span-12"}>
              <div className={`rounded-3xl overflow-hidden ${imageShapeClass}`} style={{ backgroundColor: accent }}>
                <img
                  src={resolveImage(section.image_url)}
                  alt={`${title} — ${section.heading || "section"}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover"
                />
              </div>
            </Reveal>
          )}
        </div>
      )}
      {hasMetrics && (
        <div className="mt-10 grid sm:grid-cols-3 gap-6">
          {section.metrics.map((m: OutcomeItem, i: number) => (
            <Reveal
              key={`${m.label}-${i}`}
              delay={i * 0.1}
              className="rounded-3xl bg-butter/50 p-8 md:p-10"
            >
              <p className="font-display text-5xl md:text-6xl text-accent tracking-tight">
                {m.value}
              </p>
              <p className="mt-3 text-sm text-foreground/80">{m.label}</p>
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}

function ProjectDetail() {
  const loaderData = Route.useLoaderData();
  const reduce = useReducedMotion();
  const params = Route.useParams();

  if (loaderData.locked) {
    const { project } = loaderData;
    return (
      <article>
        <Helmet>
          <title>{project.title} — Password required</title>
          <meta name="description" content="This case study is password protected." />
          <meta name="robots" content="noindex" />
        </Helmet>
        <div className="mx-auto max-w-6xl page-shell pt-8 md:pt-10">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex items-center gap-2 flex-wrap">
              <li><Link to="/" className="hover:text-foreground transition-colors">home</Link></li>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <li><Link to="/work" className="hover:text-foreground transition-colors">work</Link></li>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
              <li className="text-foreground font-medium truncate">{project.title}</li>
            </ol>
          </nav>
        </div>
        <PasswordRequired
          title={project.title}
          slug={project.slug}
          passwordHash={project.passwordHash}
        />
      </article>
    );
  }

  const { project, prev, next } = loaderData;
  const title = `${project.title} — Case study by Murat Karcı`;
  const description = project.tagline || "Product design case study by Murat Karcı.";
  const url = `https://muratkarci.design/work/${params.slug}`;

  const overviewSection = project.sections.find((s) => s.heading.trim().toLowerCase() === "overview");
  const sectionIdCounts: Record<string, number> = {};
  const renderedSections = project.sections
    .map((section, index) => {
      const fallbackLabel = `Section ${index + 1}`;
      const label = section.heading.trim() || fallbackLabel;
      const baseId = createSectionId(label);
      const count = sectionIdCounts[baseId] ?? 0;
      sectionIdCounts[baseId] = count + 1;
      const id = count === 0 ? baseId : `${baseId}-${count + 1}`;
      return {
        section,
        index,
        id,
        label,
        indexLabel: String(index + 1).padStart(2, "0"),
      };
    })
    .filter((item) => hasRenderableContent(item.section));

  const creativeWorkLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    headline: project.title,
    description: project.tagline || overviewSection?.body || "",
    url,
    image: project.cover_url || undefined,
    dateCreated: project.year || undefined,
    creator: {
      "@type": "Person",
      name: "Murat Karcı",
      jobTitle: "Product Designer",
      url: "https://muratkarci.design",
    },
    about: project.category || undefined,
  };

  return (
    <article>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        {project.cover_url && <meta property="og:image" content={project.cover_url} />}
        {project.cover_url && <meta property="og:image:width" content="1600" />}
        {project.cover_url && <meta property="og:image:height" content="1000" />}
        {project.cover_url && (
          <meta property="og:image:alt" content={`${project.title} — cover image`} />
        )}
        {project.cover_url && <meta name="twitter:card" content="summary_large_image" />}
        {project.cover_url && <meta name="twitter:image" content={project.cover_url} />}
        {project.cover_url && <meta name="twitter:title" content={title} />}
        {project.cover_url && <meta name="twitter:description" content={description} />}
        <script type="application/ld+json">{JSON.stringify(creativeWorkLd)}</script>
      </Helmet>

      {/* BREADCRUMB */}
      <div className="mx-auto max-w-6xl page-shell pt-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link to="/" className="hover:text-foreground transition-colors">home</Link></li>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <li><Link to="/work" className="hover:text-foreground transition-colors">work</Link></li>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <li className="text-foreground font-medium truncate">{project.title}</li>
          </ol>
        </nav>
      </div>

      <CaseStudySideNav items={renderedSections.map(({ id, label, indexLabel }) => ({ id, label, indexLabel }))} />

      {/* HERO */}
      <header className="mx-auto max-w-6xl page-shell pt-10 md:pt-14 pb-12">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {project.category && (
              <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-butter">
                {project.category}
              </span>
            )}
            {project.year && (
              <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-muted">
                {project.year}
              </span>
            )}
          </div>
          <h1 className="hero-heading text-balance max-w-3xl">
            {project.title}
          </h1>
          <p className="mt-7 text-base md:text-lg text-muted-foreground max-w-xl text-balance leading-relaxed">
            {project.tagline}
          </p>
        </motion.div>
      </header>

      {/* COVER */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl page-shell"
      >
        <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: project.accent }}>
          <img
            src={resolveImage(project.cover_url)}
            alt={`${project.title} — cover image`}
            width={1600}
            height={1000}
            loading="eager"
            decoding="async"
            fetchPriority="high"
            className="w-full aspect-[16/10] object-cover"
          />
        </div>
      </motion.div>

      {/* META */}
      <section className="mx-auto max-w-6xl page-shell mt-16 md:mt-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden border border-border">
          {[
            { label: "Role", value: project.role },
            { label: "Timeline", value: project.timeline },
            { label: "Team", value: project.team },
            { label: "Tools", value: project.tools.join(", ") },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05} className="bg-background p-6">
              <p className="uppercase tracking-[0.2em] text-[10px] text-muted-foreground mb-2">{item.label}</p>
              <p className="font-display text-lg leading-tight">{item.value || "—"}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* UNIFIED ORDERED SECTIONS */}
      {renderedSections.map(({ section, index, id }) => (
        <SectionRenderer
          key={section.id}
          section={section}
          displayIndex={index}
          accent={project.accent}
          title={project.title}
          sectionId={id}
        />
      ))}

      {/* GALLERY */}
      {project.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl page-shell mt-24 md:mt-32">
          <ProjectGallery
            images={project.gallery}
            meta={project.gallery_meta}
            accent={project.accent}
            title={project.title}
          />
        </section>
      )}

      {/* NEXT / PREV */}
      {(prev || next) && (
        <section className="mx-auto max-w-6xl page-shell mt-32">
          <div className="flex items-center justify-between mb-8">
            <Link to="/work" className="inline-flex items-center gap-2 text-sm story-link">
              <ArrowLeft className="w-4 h-4" /> back to all work
            </Link>
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground">More work</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { item: prev, label: "Previous" as const, align: "left" as const },
              { item: next, label: "Next" as const, align: "right" as const },
            ].map(({ item, label, align }) =>
              item ? (
                <Link
                  key={`${label}-${item.slug}`}
                  to="/work/$slug"
                  params={{ slug: item.slug }}
                  className="group block rounded-3xl overflow-hidden relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4 focus-visible:ring-offset-background"
                  style={{ backgroundColor: item.accent }}
                  aria-label={`${label} case study: ${item.title}`}
                >
                  <img
                    src={resolveImage(item.cover_url)}
                    alt={`${item.title} cover`}
                    width={1200}
                    height={750}
                    loading="lazy"
                    decoding="async"
                    className="w-full aspect-[16/10] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/75 via-foreground/25 to-transparent" />
                  <div className={`absolute bottom-0 left-0 right-0 p-6 md:p-8 flex items-end gap-4 text-background ${align === "right" ? "justify-between" : "flex-row-reverse justify-between"}`}>
                    <div className={align === "right" ? "" : "text-right"}>
                      <p className="uppercase tracking-[0.2em] text-[10px] opacity-80 mb-1.5">
                        {label} case study
                      </p>
                      <h3 className="font-display text-2xl md:text-3xl tracking-tight">
                        {item.title}
                      </h3>
                    </div>
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-background text-foreground flex items-center justify-center shrink-0 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
                      {align === "right" ? (
                        <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
                      ) : (
                        <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                      )}
                    </div>
                  </div>
                </Link>
              ) : (
                <div key={`empty-${label}`} aria-hidden className="hidden md:block" />
              )
            )}
          </div>
        </section>
      )}
    </article>
  );
}
