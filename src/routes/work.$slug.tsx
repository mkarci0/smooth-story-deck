import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ChevronRight } from "lucide-react";
import { getProject, projects, type Project } from "@/data/projects";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/work/$slug")({
  loader: ({ params }): { project: Project } => {
    const project = getProject(params.slug);
    if (!project) throw notFound();
    return { project };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.project;
    if (!p) return { meta: [{ title: "Case study not found" }] };
    return {
      meta: [
        { title: `${p.title} — Case study by Alex Morgan` },
        { name: "description", content: p.tagline },
        { property: "og:title", content: `${p.title} — Alex Morgan` },
        { property: "og:description", content: p.tagline },
        { property: "og:image", content: p.cover },
        { name: "twitter:image", content: p.cover },
      ],
    };
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
  const { project } = Route.useLoaderData();
  const currentIndex = projects.findIndex((p) => p.slug === project.slug);
  const next = projects[(currentIndex + 1) % projects.length];

  return (
    <article>
      {/* BREADCRUMB */}
      <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-8 md:pt-10">
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link to="/" className="hover:text-foreground transition-colors">
                home
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <li>
              <Link to="/work" className="hover:text-foreground transition-colors">
                work
              </Link>
            </li>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            <li className="text-foreground font-medium truncate">{project.title}</li>
          </ol>
        </nav>
      </div>

      {/* HERO */}
      <header className="mx-auto max-w-6xl px-6 lg:px-10 pt-10 md:pt-14 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-butter">
              {project.category}
            </span>
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-muted">
              {project.year}
            </span>
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-6xl px-6 lg:px-10"
      >
        <div
          className="rounded-3xl overflow-hidden"
          style={{ backgroundColor: project.accent }}
        >
          <img
            src={project.cover}
            alt={`${project.title} cover`}
            width={1280}
            height={960}
            className="w-full aspect-[16/10] object-cover"
          />
        </div>
      </motion.div>

      {/* META GRID */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-16 md:mt-24">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-3xl overflow-hidden border border-border">
          {[
            { label: "Role", value: project.role },
            { label: "Timeline", value: project.timeline },
            { label: "Team", value: project.team },
            { label: "Tools", value: project.tools.join(", ") },
          ].map((item, i) => (
            <Reveal key={item.label} delay={i * 0.05} className="bg-background p-6">
              <p className="uppercase tracking-widest text-[10px] text-muted-foreground mb-2">
                {item.label}
              </p>
              <p className="font-display text-lg leading-tight">{item.value}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* OVERVIEW */}
      <section className="mx-auto max-w-3xl px-6 lg:px-10 mt-20 md:mt-28">
        <Reveal>
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            Overview
          </p>
          <p className="font-display text-3xl md:text-4xl leading-tight tracking-tight text-balance">
            {project.overview}
          </p>
        </Reveal>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-20 md:mt-28 grid md:grid-cols-2 gap-10 md:gap-16">
        <Reveal>
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            The problem
          </p>
          <h2 className="font-display text-3xl tracking-tight mb-4">What wasn’t working</h2>
          <p className="text-foreground/85 leading-relaxed">{project.problem}</p>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            The solution
          </p>
          <h2 className="font-display text-3xl tracking-tight mb-4">How we solved it</h2>
          <p className="text-foreground/85 leading-relaxed">{project.solution}</p>
        </Reveal>
      </section>

      {/* OUTCOME */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-20 md:mt-28">
        <Reveal>
          <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
            Outcome
          </p>
          <h2 className="font-display text-4xl md:text-5xl tracking-tight mb-10">
            By the numbers.
          </h2>
        </Reveal>
        <div className="grid sm:grid-cols-3 gap-6">
          {project.outcome.map((o, i) => (
            <Reveal
              key={o.label}
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

      {/* SECTIONS */}
      <section className="mx-auto max-w-3xl px-6 lg:px-10 mt-24 md:mt-32 space-y-16">
        {project.sections.map((s, i) => (
          <Reveal key={s.heading} delay={i * 0.05}>
            <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
              0{i + 1}
            </p>
            <h3 className="font-display text-3xl md:text-4xl tracking-tight mb-4">
              {s.heading}
            </h3>
            <p className="text-foreground/85 leading-relaxed text-lg">{s.body}</p>
          </Reveal>
        ))}
      </section>

      {/* GALLERY */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-24 md:mt-32 space-y-8">
        {project.gallery.map((img, i) => (
          <Reveal key={i}>
            <div
              className="rounded-3xl overflow-hidden"
              style={{ backgroundColor: project.accent }}
            >
              <img
                src={img}
                alt={`${project.title} screen ${i + 1}`}
                loading="lazy"
                width={1280}
                height={960}
                className="w-full aspect-[16/10] object-cover"
              />
            </div>
          </Reveal>
        ))}
      </section>

      {/* NEXT PROJECT */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 mt-32">
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/work"
            className="inline-flex items-center gap-2 text-sm story-link"
          >
            <ArrowLeft className="w-4 h-4" /> back to all work
          </Link>
          <p className="uppercase tracking-widest text-xs text-muted-foreground">
            Up next
          </p>
        </div>

        <Link
          to="/work/$slug"
          params={{ slug: next.slug }}
          className="group block rounded-3xl overflow-hidden relative"
          style={{ backgroundColor: next.accent }}
        >
          <img
            src={next.cover}
            alt={next.title}
            loading="lazy"
            width={1280}
            height={960}
            className="w-full aspect-[21/9] object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex items-end justify-between text-background">
            <div>
              <p className="uppercase tracking-widest text-xs opacity-80 mb-2">
                Next case study
              </p>
              <h3 className="font-display text-4xl md:text-6xl tracking-tight">
                {next.title}
              </h3>
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-background text-foreground flex items-center justify-center transition-transform group-hover:translate-x-1 group-hover:-translate-y-1">
              <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
            </div>
          </div>
        </Link>
      </section>
    </article>
  );
}
