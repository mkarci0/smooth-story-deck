import { useEffect, useState } from "react";
import { fetchSiteSettings } from "@/lib/site-settings";

type Props = {
  className?: string;
  /** Smaller variant for compact placements */
  compact?: boolean;
};

/**
 * Renders the site logo. If an SVG has been uploaded in Site Settings →
 * Header & Footer, that file is rendered as an <img>. Otherwise a typographic
 * wordmark fallback ("murat karcı" in Satoshi bold) is shown.
 */
export function SiteLogo({ className = "", compact = false }: Props) {
  const [svgUrl, setSvgUrl] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((s) => {
      setSvgUrl(s?.logo_svg_url ?? null);
      setLoaded(true);
    });
  }, []);

  // Avoid flashing the fallback before settings load
  if (!loaded) {
    return <span className={`inline-block ${compact ? "h-5 w-20" : "h-6 w-24"} ${className}`} aria-hidden />;
  }

  if (svgUrl) {
    return (
      <img
        src={svgUrl}
        alt="Murat Karcı"
        className={`${compact ? "h-5" : "h-7"} w-auto ${className}`}
        loading="eager"
        decoding="async"
        onError={() => setSvgUrl(null)}
      />
    );
  }

  return (
    <span
      className={`font-display ${compact ? "text-base" : "text-lg"} tracking-tight font-bold leading-none ${className}`}
    >
      murat karcı
    </span>
  );
}
