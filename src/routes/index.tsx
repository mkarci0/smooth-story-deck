import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import portrait from "@/assets/portrait.jpg";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Reveal } from "@/components/site/Reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Alex Morgan — Product Designer crafting calm software" },
      {
        name: "description",
        content:
          "Independent product designer working with founders and product teams on mobile, web, and brand. Currently open for select projects.",
      },
      { property: "og:title", content: "Alex Morgan — Product Designer" },
      {
        property: "og:description",
        content: "Calm, considered product design for ambitious teams.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-16 md:pt-24 pb-20 md:pb-32">
          <div className="grid lg:grid-cols-[1.4fr_1fr] gap-12 lg:gap-16 items-center">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 rounded-full bg-butter px-3 py-1.5 text-xs font-medium text-foreground/80"
              >
                <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
                Available for select projects · 2025
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="mt-6 font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[0.95] text-balance"
              >
                <span className="inline-block mr-3">👋</span>Hi, I’m Alex.
                <br />
                I design{" "}
                <em className="not-italic text-accent">
                  calm
                </em>{" "}
                software.
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="mt-7 text-lg md:text-xl text-muted-foreground max-w-xl text-balance"
              >
                Independent product designer based in Istanbul, working with founders and
                product teams on mobile, web and brand — with a soft spot for editorial
                interfaces.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.32 }}
                className="mt-10 flex flex-wrap gap-3"
              >
                <Link
                  to="/work"
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground text-background px-6 py-3 text-sm font-medium hover:bg-accent transition-colors"
                >
                  See selected work
                  <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
                >
                  About me
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.92, rotate: -4 }}
              animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative justify-self-center lg:justify-self-end"
            >
              <div className="absolute -inset-4 rounded-[2.5rem] bg-coral/15 blur-2xl" />
              <div className="relative animate-float-slow">
                <img
                  src={portrait}
                  alt="Portrait of Alex Morgan, product designer"
                  width={1024}
                  height={1280}
                  className="w-[280px] sm:w-[340px] lg:w-[380px] aspect-[4/5] object-cover rounded-[2rem] shadow-[var(--shadow-lift)]"
                />
                <div className="absolute -bottom-4 -left-4 bg-background rounded-2xl shadow-[var(--shadow-soft)] px-4 py-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-coral" />
                  <span className="text-sm font-medium">8 yrs designing</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y border-border/60 bg-butter/40 py-5 overflow-hidden">
          <div className="flex gap-12 animate-marquee whitespace-nowrap font-display text-2xl md:text-3xl text-foreground/80">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-12 shrink-0">
                <span>Product Design</span><span className="text-coral">✦</span>
                <span>Mobile & Web</span><span className="text-coral">✦</span>
                <span>Brand Systems</span><span className="text-coral">✦</span>
                <span>Design Strategy</span><span className="text-coral">✦</span>
                <span>Prototyping</span><span className="text-coral">✦</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SELECTED WORK */}
      <section className="mx-auto max-w-6xl px-6 lg:px-10 py-24 md:py-32">
        <Reveal className="flex items-end justify-between mb-14">
          <div>
            <p className="uppercase tracking-widest text-xs text-muted-foreground mb-3">
              Selected work — 2023 / 2024
            </p>
            <h2 className="font-display text-4xl md:text-5xl tracking-tight">
              Recent case studies
            </h2>
          </div>
          <Link to="/work" className="story-link text-sm hidden sm:inline-block">
            view all →
          </Link>
        </Reveal>

        <div className="grid gap-16 md:gap-24">
          {projects.slice(0, 3).map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* QUOTE */}
      <section className="mx-auto max-w-4xl px-6 lg:px-10 py-20 md:py-28 text-center">
        <Reveal>
          <p className="font-display text-3xl md:text-5xl leading-tight tracking-tight text-balance">
            “Alex has the rare ability to translate fuzzy product strategy into
            <em className="text-accent not-italic"> interfaces that just feel right.</em>”
          </p>
          <p className="mt-6 text-sm text-muted-foreground">
            — Maya Chen, Head of Product at Pulse
          </p>
        </Reveal>
      </section>
    </div>
  );
}
