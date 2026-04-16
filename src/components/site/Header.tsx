import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl px-6 lg:px-10 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center font-display text-lg font-semibold transition-transform group-hover:scale-105">
            a.
          </div>
          <span className="font-display text-lg tracking-tight hidden sm:inline">
            alex morgan
          </span>
        </Link>

        <nav className="flex items-center gap-7 text-sm">
          <Link
            to="/work"
            className="story-link text-foreground/80 hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            work
          </Link>
          <Link
            to="/about"
            className="story-link text-foreground/80 hover:text-foreground transition-colors"
            activeProps={{ className: "text-foreground font-medium" }}
          >
            about
          </Link>
          <a
            href="mailto:hello@alexmorgan.design"
            className="hidden sm:inline-flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
          >
            let’s talk
          </a>
        </nav>
      </div>
    </motion.header>
  );
}
