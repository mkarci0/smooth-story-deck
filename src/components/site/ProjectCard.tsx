import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
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
