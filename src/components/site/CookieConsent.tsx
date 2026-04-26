import { useEffect, useState } from "react";
import { Cookie, X } from "lucide-react";
import {
  COOKIE_CONSENT_ACCEPTED,
  COOKIE_CONSENT_DECLINED,
  getCookieConsent,
  setCookieConsent,
} from "@/lib/cookies";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Slight delay so the banner doesn't fight with above-the-fold content.
    const timer = window.setTimeout(() => {
      if (getCookieConsent() === null) setVisible(true);
    }, 600);
    return () => window.clearTimeout(timer);
  }, []);

  if (!mounted || !visible) return null;

  const handleAccept = () => {
    setCookieConsent(COOKIE_CONSENT_ACCEPTED);
    setVisible(false);
  };

  const handleDecline = () => {
    setCookieConsent(COOKIE_CONSENT_DECLINED);
    setVisible(false);
  };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie preferences"
      className="fixed inset-x-3 bottom-3 sm:inset-x-auto sm:right-6 sm:bottom-6 sm:max-w-md z-[60] animate-fade-in"
    >
      <div className="rounded-2xl border border-border/70 bg-background/95 backdrop-blur-md shadow-lift p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-9 h-9 rounded-full bg-muted flex items-center justify-center">
            <Cookie className="w-4 h-4 text-foreground" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-display text-base font-semibold tracking-tight text-foreground">
                A small cookie, with your permission
              </h2>
              <button
                type="button"
                onClick={handleDecline}
                aria-label="Dismiss cookie banner"
                className="shrink-0 -mt-1 -mr-1 p-1 rounded-md text-muted-foreground hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              We use a single first-party cookie to remember when you unlock a
              protected case study, so you don't have to enter the password
              again on your next visit. No tracking, no third parties.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleAccept}
                className="btn-primary btn-sm"
              >
                Accept
              </button>
              <button
                type="button"
                onClick={handleDecline}
                className="btn-secondary btn-sm"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
