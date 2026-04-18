import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowUpRight, FileText } from "lucide-react";
import { resolveImage, type Project } from "@/lib/projects";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: (index % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className="group"
    >
      <Link
        to="/work/$slug"
        params={{ slug: project.slug }}
        className="block"
      >
        <div
          className="relative overflow-hidden rounded-2xl"
          style={{ backgroundColor: project.accent }}
        >
          <motion.img
            src={resolveImage(project.cover_url)}
            alt={project.title}
            loading="lazy"
            className="w-full aspect-[4/3] object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Hover badge — "Case study" */}
          <div className="pointer-events-none absolute top-4 left-4 opacity-0 -translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-background/95 backdrop-blur-sm text-foreground text-[11px] font-medium uppercase tracking-[0.14em] px-3 py-1.5 shadow-lg">
              <FileText className="w-3 h-3" />
              Case study
            </span>
          </div>

          {/* Hover arrow — bottom right */}
          <div className="pointer-events-none absolute bottom-4 right-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out delay-75">
            <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-foreground text-background shadow-lg">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
        </div>

        <div className="mt-5">
          <p className="uppercase tracking-[0.18em] text-[11px] text-muted-foreground">
            {project.category} {project.year && <>— {project.year}</>}
          </p>
          <h3 className="mt-2 font-display text-3xl md:text-4xl tracking-tight group-hover:text-accent transition-colors">
            {project.title}
          </h3>
          <p className="mt-2 text-muted-foreground text-balance max-w-md">
            {project.tagline}
          </p>
        </div>
      </Link>
    </motion.article>
  );
}
