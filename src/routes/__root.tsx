import { Outlet, createRootRoute, useLocation, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";

import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ComingSoon } from "@/components/site/ComingSoon";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { useAuth } from "@/hooks/useAuth";

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>404 — Page not found · Murat Karcı</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground mb-6">
            Error 404
          </p>
          <h1 className="font-display text-6xl md:text-8xl tracking-[-0.02em] leading-[0.95] text-foreground text-balance font-medium">
            This page wandered off.
          </h1>
          <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md mx-auto text-balance">
            The link may be broken, or the page might have moved. Try one of these instead.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link to="/" className="btn-primary">
              Go home
            </Link>
            <Link to="/work" className="btn-secondary">
              Browse work
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  const location = useLocation();
  const { isAdmin, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [settingsLoaded, setSettingsLoaded] = useState(false);

  useEffect(() => {
    fetchSiteSettings()
      .then((s) => setSettings(s))
      .finally(() => setSettingsLoaded(true));
  }, []);

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isPreview =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("preview") === "1";

  const shouldGate =
    settingsLoaded &&
    settings?.maintenance_enabled === true &&
    !isAdminRoute &&
    !isPreview &&
    !authLoading &&
    !isAdmin;

  if (!isAdminRoute && (!settingsLoaded || authLoading)) {
    return <div className="min-h-screen bg-background" />;
  }

  if (shouldGate) {
    return <ComingSoon message={settings!.maintenance_message} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <Header />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
