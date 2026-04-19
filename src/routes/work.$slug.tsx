import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { fetchProjectBySlug, fetchProjects, resolveImage, type SectionBlock, type OutcomeItem } from "@/lib/projects";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/work/$slug")({
  ssr: false,
  loader: async ({ params }) => {
    const [project, all] = await Promise.all([
      fetchProjectBySlug(params.slug),
      fetchProjects(),
    ]);
    if (!project) throw notFound();
    const idx = all.findIndex((x) => x.slug === project.slug);
    const total = all.length;
    const prev = total > 1 ? all[(idx - 1 + total) % total] : null;
    const next = total > 1 ? all[(idx + 1) % total] : null;
    return { project, prev, next };
  },
  head: ({ loaderData, params }) => {
    const p = loaderData?.project;
    const title = p ? `${p.title} — Case study by Murat Karcı` : "Case study — Murat Karcı";
    const description = p?.tagline || "Product design case study by Murat Karcı.";
    const url = `https://muratkarci.design/work/${params?.slug ?? ""}`;
    const meta: Array<Record<string, string>> = [
      { title },
      { name: "description", content: description },
      { property: "og:type", content: "article" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: url },
    ];
    if (p?.cover_url) {
      meta.push({ property: "og:image", content: p.cover_url });
      meta.push({ name: "twitter:image", content: p.cover_url });
    }

    // JSON-LD CreativeWork schema for search engines
    const scripts = p
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "CreativeWork",
              name: p.title,
              headline: p.title,
              description: p.tagline || p.overview,
              url,
              image: p.cover_url || undefined,
              dateCreated: p.year || undefined,
              creator: {
                "@type": "Person",
                name: "Murat Karcı",
                jobTitle: "Product Designer",
                url: "https://muratkarci.design",
              },
              about: p.category || undefined,
            }),
          },
        ]
      : undefined;

    return { meta, scripts };
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-6 py-32 text-center">
      <h1 className="font-display text-5xl">Case study not found</h1>
      <Link to="/work" className="mt-6 inline-block story-link">← Back to all work</Link>
    </div>
  ),
  component: ProjectDetail,
});

function ProjectDetail() {
  const { project, prev, next } = Route.useLoaderData();
  const reduce = useReducedMotion();

  const blocks: { index: string; label: string; data: SectionBlock }[] = [
    { index: "02", label: "Research", data: project.research },
    { index: "03", label: "Design System", data: project.design_system },
    { index: "04", label: "Final Solution", data: project.final_solution },
  ];

  return (
    <article>
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-8 md:pt-10">
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

      {/* HERO */}
      <header className="mx-auto max-w-6xl px-6 lg:px-10 pt-10 md:pt-14 pb-12">
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
          <h1 className="font-display text-5xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[0.95] text-balance">
            {project.title}
          </h1>
          <p className="mt-6 text-xl md:text-2xl text-muted-foreground max-w-3xl text-balance">
            {project.tagline}
          </p>
        </motion.div>
      </header>

      {/* COVER */}
      <motion.div
        initial={reduce ? false : { opacity: 0, scale: 0.98 }}
        animate={reduce ? undefined : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-6 lg:px-10"
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
      <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-16 md:mt-24">
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

      {/* 01 — OVERVIEW */}
      {project.overview && (
        <section className="mx-auto max-w-3xl px-6 lg:px-10 mt-20 md:mt-28">
          <Reveal>
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">01 · Overview</p>
            <p className="font-display text-3xl md:text-4xl leading-tight tracking-tight text-balance">
              {project.overview}
            </p>
          </Reveal>
        </section>
      )}

      {/* 02 / 03 / 04 — Fixed blocks */}
      {blocks.map((b) =>
        b.data.body || b.data.image_url ? (
          <section key={b.label} className="mx-auto max-w-6xl px-6 lg:px-10 mt-20 md:mt-28">
            <Reveal>
              <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">
                {b.index} · {b.label}
              </p>
              <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-8 max-w-3xl">
                {b.label}
              </h2>
            </Reveal>
            <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
              {b.data.body && (
                <Reveal delay={0.05} className="md:col-span-5">
                  <p className="text-foreground/85 leading-relaxed text-lg whitespace-pre-line">
                    {b.data.body}
                  </p>
                </Reveal>
              )}
              {b.data.image_url && (
                <Reveal delay={0.1} className={b.data.body ? "md:col-span-7" : "md:col-span-12"}>
                  <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: project.accent }}>
                    <img
                      src={resolveImage(b.data.image_url)}
                      alt={`${project.title} — ${b.label}`}
                      width={1600}
                      height={1000}
                      loading="lazy"
                      decoding="async"
                      className="w-full aspect-[16/10] object-cover"
                    />
                  </div>
                </Reveal>
              )}
            </div>
          </section>
        ) : null
      )}

      {/* 05 — OUTCOME */}
      {project.outcome.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-20 md:mt-28">
          <Reveal>
            <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">05 · Outcome</p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-10">
              By the numbers.
            </h2>
          </Reveal>
          <div className="grid sm:grid-cols-3 gap-6">
            {project.outcome.map((o: OutcomeItem, i: number) => (
              <Reveal
                key={`${o.label}-${i}`}
                delay={i * 0.1}
                className="rounded-3xl bg-butter/50 p-8 md:p-10"
              >
                <p className="font-display text-5xl md:text-6xl text-accent tracking-tight">
                  {o.value}
                </p>
                <p className="mt-3 text-sm text-foreground/80">{o.label}</p>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* GALLERY */}
      {project.gallery.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-24 md:mt-32">
          <ProjectGallery
            images={project.gallery}
            accent={project.accent}
            title={project.title}
          />
        </section>
      )}

      {/* NEXT / PREV */}
      {(prev || next) && (
        <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-32">
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
