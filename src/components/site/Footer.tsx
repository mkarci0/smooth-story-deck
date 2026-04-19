import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";
import { fetchSiteSettings } from "@/lib/site-settings";

export function Footer() {
  const [linkedin, setLinkedin] = useState<string | null>(null);

  useEffect(() => {
    fetchSiteSettings().then((s) => setLinkedin(s?.linkedin_url ?? null));
  }, []);

  return (
    <footer className="mt-32 border-t border-border/50">
      <div className="mx-auto max-w-6xl px-6 lg:px-10 py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-display text-3xl tracking-tight">
              Let's build <em className="text-accent not-italic">something</em> together.
            </h3>
            <a
              href="mailto:hello@muratkarci.design"
              className="mt-4 inline-block story-link text-foreground/80"
            >
              hello@muratkarci.design
            </a>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="uppercase tracking-widest text-xs mb-3 text-foreground/60">
              navigate
            </p>
            <ul className="space-y-2">
              <li><Link to="/" className="story-link">Home</Link></li>
              <li><Link to="/work" className="story-link">Work</Link></li>
              <li><Link to="/about" className="story-link">About</Link></li>
            </ul>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="uppercase tracking-widest text-xs mb-3 text-foreground/60">
              elsewhere
            </p>
            <ul className="space-y-2">
              {linkedin ? (
                <li>
                  <a
                    href={linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="story-link inline-flex items-center gap-1.5"
                    aria-label="Murat Karcı on LinkedIn"
                  >
                    <Linkedin className="w-3.5 h-3.5" aria-hidden /> LinkedIn
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Murat Karcı. Designed & built with care.</p>
          <p>Crafted in warm cream and coral.</p>
        </div>
      </div>
    </footer>
  );
}
