import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Linkedin } from "lucide-react";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "./SiteLogo";

export function Footer() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);

  useEffect(() => {
    fetchSiteSettings().then(setSettings);
  }, []);

  const tagline = settings?.footer_tagline ?? "Let's build something together.";
  const email = settings?.footer_email ?? "hello@muratkarci.design";
  const copyright = (settings?.footer_copyright ?? "© Murat Karcı. Designed & built with care.")
    .replace("{year}", String(new Date().getFullYear()));
  const credit = settings?.footer_credit ?? "Crafted in warm cream and coral.";
  const linkedin = settings?.linkedin_url ?? null;

  // Render tagline with last word emphasized in accent color
  const taglineParts = tagline.trim().split(/\s+/);
  const last = taglineParts.pop() ?? "";
  const lead = taglineParts.join(" ");

  return (
    <footer className="mt-32 border-t border-border/50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Site footer</h2>
      <div className="mx-auto max-w-6xl page-shell py-16">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <SiteLogo className="mb-4 opacity-90" />
            <p className="font-display text-3xl tracking-tight">
              {lead ? `${lead} ` : ""}
              <em className="text-accent not-italic">{last}</em>
            </p>
            <a
              href={`mailto:${email}`}
              className="mt-4 inline-block story-link text-foreground/80"
              aria-label={`Email Murat at ${email}`}
            >
              {email}
            </a>
          </div>

          <nav aria-label="Footer navigation" className="text-sm text-muted-foreground">
            <p className="uppercase tracking-widest text-xs mb-3 text-foreground/60">
              navigate
            </p>
            <ul className="space-y-2">
              <li><Link to="/" className="story-link">Home</Link></li>
              <li><Link to="/work" className="story-link">Work</Link></li>
              <li><Link to="/about" className="story-link">About</Link></li>
            </ul>
          </nav>

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
              ) : (
                <li className="text-xs italic opacity-70">
                  Add a LinkedIn URL in Site Settings.
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-border/50 flex flex-col sm:flex-row gap-3 justify-between text-xs text-muted-foreground">
          <p>{copyright}</p>
          {credit && <p>{credit}</p>}
        </div>
      </div>
    </footer>
  );
}
