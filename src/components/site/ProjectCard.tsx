import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import type { Project } from "@/data/projects";
import { ArrowUpRight } from "lucide-react";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const isEven = index % 2 === 0;
  return (
    <motion.article
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        className="block"
      >
        <div
          className="relative overflow-hidden rounded-3xl"
          style={{ backgroundColor: project.accent }}
        >
          <motion.img
            src={project.cover}
            alt={project.title}
            loading="lazy"
            width={1280}
            height={960}
            className="w-full aspect-[4/3] object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="absolute top-5 left-5 flex gap-2">
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-background/85 backdrop-blur text-foreground">
              {project.category}
            </span>
            <span className="inline-flex items-center text-xs font-medium px-3 py-1 rounded-full bg-background/85 backdrop-blur text-foreground">
              {project.year}
            </span>
          </div>
          <div className="absolute top-5 right-5 w-10 h-10 rounded-full bg-foreground text-background flex items-center justify-center opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className={`mt-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 ${isEven ? "" : "sm:flex-row-reverse"}`}>
          <div>
            <h3 className="font-display text-3xl md:text-4xl tracking-tight">
              {project.title}
            </h3>
            <p className="mt-1 text-muted-foreground max-w-xl text-balance">
              {project.tagline}
            </p>
          </div>
          <span className="text-sm story-link text-foreground/70 self-start sm:self-end">
            view case study →
          </span>
        </div>
      </Link>
    </motion.article>
  );
}
