import { Link } from "@tanstack/react-router";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { resolveImage, type Project } from "@/lib/projects";

export function ProjectCard({ project, index }: { project: Project; index: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState(false);

  // Raw cursor position (relative to image wrapper)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  // Smoothed for the badge
  const sx = useSpring(x, { stiffness: 350, damping: 30, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 350, damping: 30, mass: 0.4 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    x.set(e.clientX - r.left);
    y.set(e.clientY - r.top);
  };

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
          ref={wrapRef}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          onMouseMove={handleMove}
          className="relative overflow-hidden rounded-2xl md:cursor-none"
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

          {/* Cursor-following "Case study →" badge */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute top-0 left-0 z-10 hidden md:block"
            style={{
              x: sx,
              y: sy,
              translateX: "-50%",
              translateY: "-50%",
            }}
          >
            <motion.span
              animate={{
                opacity: hovered ? 1 : 0,
                scale: hovered ? 1 : 0.6,
              }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background text-[11px] font-medium uppercase tracking-[0.16em] px-3.5 py-2 shadow-xl whitespace-nowrap"
            >
              Case study
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.span>
          </motion.div>
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
