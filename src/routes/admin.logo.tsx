import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchSiteSettings, type LogoVariant } from "@/lib/site-settings";
import {
  Logo,
  LOGO_VARIANTS,
  LOGO_VARIANT_LABELS,
  LOGO_VARIANT_DESCRIPTIONS,
} from "@/components/site/Logo";

export const Route = createFileRoute("/admin/logo")({
  component: AdminLogoPage,
});

function AdminLogoPage() {
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [active, setActive] = useState<LogoVariant>("wordmark");
  const [pending, setPending] = useState<LogoVariant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSiteSettings()
      .then((s) => {
        if (s) {
          setSettingsId(s.id);
          setActive(s.logo_variant);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const choose = async (variant: LogoVariant) => {
    if (!settingsId || pending || variant === active) return;
    setPending(variant);
    const { error } = await supabase
      .from("site_settings")
      .update({ logo_variant: variant })
      .eq("id", settingsId);
    setPending(null);
    if (error) {
      alert(`Could not save: ${error.message}`);
      return;
    }
    setActive(variant);
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading…</p>;
  }

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-display text-2xl">Logo typography</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Choose the typographic identity used in the site header. The change is live the
          moment you click — no save button needed.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LOGO_VARIANTS.map((v) => {
          const isActive = v === active;
          const isPending = v === pending;
          return (
            <button
              key={v}
              type="button"
              onClick={() => choose(v)}
              disabled={!!pending}
              aria-pressed={isActive}
              className={`relative text-left rounded-2xl border p-6 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-60 ${
                isActive
                  ? "border-foreground bg-muted/40 shadow-[var(--shadow-soft)]"
                  : "border-border hover:border-foreground/40 hover:bg-muted/20"
              }`}
            >
              {isActive && (
                <span className="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded-full bg-foreground text-background">
                  <Check className="w-3.5 h-3.5" aria-hidden />
                </span>
              )}
              {isPending && (
                <span className="absolute top-3 right-3 text-[10px] uppercase tracking-widest text-accent">
                  Saving…
                </span>
              )}

              <div className="h-20 flex items-center justify-center bg-background border border-border/60 rounded-xl mb-5 px-4">
                <Logo variant={v} />
              </div>

              <p className="font-display text-base">{LOGO_VARIANT_LABELS[v]}</p>
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                {LOGO_VARIANT_DESCRIPTIONS[v]}
              </p>
            </button>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Tip: open the public site in another tab and refresh after switching to see the new
        logo in the header.
      </p>
    </div>
  );
}
