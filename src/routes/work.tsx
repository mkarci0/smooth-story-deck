import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { projects } from "@/data/projects";
import { ProjectCard } from "@/components/site/ProjectCard";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Alex Morgan, Product Designer" },
      {
        name: "description",
        content:
          "Selected case studies in mobile, web and brand design — from cozy reading apps to B2B analytics platforms.",
      },
      { property: "og:title", content: "Work — Alex Morgan" },
      {
        property: "og:description",
        content: "Selected product design case studies, 2023 — 2024.",
      },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-20 md:pt-28 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <p className="uppercase tracking-widest text-xs text-muted-foreground mb-4">
          Index — {projects.length} projects
        </p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.95] text-balance">
          A small archive of <em className="text-accent not-italic">work</em> I’m proud of.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
          Each project below is a story about people, decisions and the small details that
          made the experience feel right. Click in for the full case study.
        </p>
      </motion.div>

      <div className="mt-20 md:mt-28 grid gap-20 md:gap-28">
        {projects.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}
