import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchProjects, type Project } from "@/lib/projects";
import { ProjectCard } from "@/components/site/ProjectCard";

export const Route = createFileRoute("/work")({
  head: () => ({
    meta: [
      { title: "Work — Murat Karcı, Product Designer" },
      {
        name: "description",
        content:
          "Selected case studies in mobile, web and brand design — calm software for ambitious teams.",
      },
      { property: "og:title", content: "Work — Murat Karcı" },
      {
        property: "og:description",
        content: "Selected product design case studies, 2023 — 2025.",
      },
    ],
  }),
  component: WorkPage,
});

function WorkPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects().then(setProjects).catch(console.error);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 lg:px-10 pt-20 md:pt-28 pb-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-3xl"
      >
        <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-4">
          Index — {projects.length} project{projects.length === 1 ? "" : "s"}
        </p>
        <h1 className="font-display text-5xl md:text-7xl tracking-tight leading-[0.95] text-balance">
          A small archive of <em className="text-accent not-italic">work</em> I’m proud of.
        </h1>
        <p className="mt-6 text-lg text-muted-foreground max-w-xl text-balance">
          Each project below is a story about people, decisions and the small details that
          made the experience feel right. Click in for the full case study.
        </p>
      </motion.div>

      <div className="mt-20 md:mt-28 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-20 md:gap-y-28">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} />
        ))}
      </div>
    </div>
  );
}
