import type { LogoVariant } from "@/lib/site-settings";

/**
 * Five distinct typographic identities for the header logo.
 * The chosen variant is rendered into the header and the admin preview grid.
 *
 * Fonts: Satoshi (already loaded), Fraunces (serif italic),
 * IBM Plex Mono (architectural mono), Caveat (handwritten).
 */
type Props = {
  variant: LogoVariant;
  /** Smaller, denser version for chips/cards in the admin preview */
  compact?: boolean;
};

export function Logo({ variant, compact = false }: Props) {
  const baseSize = compact ? "text-base" : "text-lg";

  switch (variant) {
    case "editorial":
      return (
        <span
          className={`${compact ? "text-base" : "text-xl"} tracking-tight leading-none`}
          style={{ fontFamily: "'Fraunces', Georgia, serif", fontWeight: 400 }}
        >
          <em className="not-italic font-medium">Murat</em>{" "}
          <span className="italic text-accent">Karcı</span>
        </span>
      );

    case "monogram":
      return (
        <span className="inline-flex items-center gap-1.5 leading-none">
          <span
            className={`inline-flex items-center justify-center rounded-md border border-foreground ${
              compact ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs"
            } font-bold tracking-[0.18em]`}
            style={{ fontFamily: "var(--font-display)" }}
          >
            MK
          </span>
          <span className="inline-block w-1 h-1 rounded-full bg-accent" aria-hidden />
        </span>
      );

    case "architectural":
      return (
        <span
          className={`${compact ? "text-[11px]" : "text-xs"} tracking-[0.32em] uppercase font-medium leading-none`}
          style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}
        >
          murat<span className="text-accent">.</span>karci
        </span>
      );

    case "signature":
      return (
        <span
          className={`${compact ? "text-xl" : "text-2xl"} leading-none -mb-1`}
          style={{ fontFamily: "'Caveat', cursive", fontWeight: 600 }}
        >
          murat karcı
        </span>
      );

    case "minimal":
      return (
        <span className={`inline-flex items-baseline gap-0.5 ${baseSize} leading-none`}>
          <span className="font-bold tracking-tight">m</span>
          <span className="text-accent font-bold">.</span>
          <span className="font-bold tracking-tight">k</span>
        </span>
      );

    case "wordmark":
    default:
      return (
        <span className={`font-display ${baseSize} tracking-tight font-bold leading-none`}>
          murat karcı
        </span>
      );
  }
}

/** Human-readable name for each variant, used in the admin selector. */
export const LOGO_VARIANT_LABELS: Record<LogoVariant, string> = {
  wordmark: "Wordmark",
  editorial: "Editorial Serif",
  monogram: "Monogram",
  architectural: "Architectural Mono",
  signature: "Signature",
  minimal: "Minimal Mark",
};

export const LOGO_VARIANT_DESCRIPTIONS: Record<LogoVariant, string> = {
  wordmark: "Lowercase Satoshi bold — current default. Calm and modern.",
  editorial: "Fraunces serif with italic accent. Magazine masthead energy.",
  monogram: "Boxed MK with a signal-red dot. Architectural and compact.",
  architectural: "IBM Plex Mono uppercase, wide tracking. Technical, blueprint-like.",
  signature: "Caveat handwritten script. Personal and warm.",
  minimal: "Just m.k — almost a logo mark. Minimal and confident.",
};

export const LOGO_VARIANTS: LogoVariant[] = [
  "wordmark",
  "editorial",
  "monogram",
  "architectural",
  "signature",
  "minimal",
];
