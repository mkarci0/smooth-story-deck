import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { fetchSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./SiteLogo";

export function Header() {
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    fetchSiteSettings().then((s) => {
      setResumeUrl(s?.resume_url ?? null);
    });
  }, []);

  return (
    <motion.header
      initial={reduce ? false : { y: -20, opacity: 0 }}
      animate={reduce ? undefined : { y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      className="sticky top-0 z-50 backdrop-blur-md bg-background/70 border-b border-border/40"
    >
      <div className="mx-auto max-w-6xl page-shell h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center group rounded-md"
          aria-label="Murat Karcı — home"
        >
          <SiteLogo />
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-7 text-sm">
          <Link
            to="/work"
            className="story-link text-foreground font-normal"
            activeProps={{ className: "text-accent" }}
          >
            work
          </Link>
          <Link
            to="/about"
            className="story-link text-foreground font-normal"
            activeProps={{ className: "text-accent" }}
          >
            about
          </Link>
          {resumeUrl ? (
            <a
              href={resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              download="murat-karci-resume.pdf"
              className="hidden sm:inline-flex btn-primary btn-sm"
            >
              Resume
            </a>
          ) : (
            <span
              aria-disabled="true"
              title="Resume not uploaded yet"
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-muted text-muted-foreground px-4 py-2 text-sm font-medium cursor-not-allowed border border-border"
            >
              Resume
            </span>
          )}
        </nav>
      </div>
    </motion.header>
  );
}
