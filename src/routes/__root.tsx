import { Outlet, createRootRoute, HeadContent, Scripts, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import appCss from "../styles.css?url";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Link } from "@tanstack/react-router";
import { ComingSoon } from "@/components/site/ComingSoon";
import { fetchSiteSettings, type SiteSettings } from "@/lib/site-settings";
import { useAuth } from "@/hooks/useAuth";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-foreground">404</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-colors hover:bg-accent"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Murat Karcı — Product Designer" },
      {
        name: "description",
        content:
          "Murat Karcı is an independent product designer crafting calm, considered software for ambitious teams.",
      },
      { name: "author", content: "Murat Karcı" },
      { name: "theme-color", content: "#ffffff" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Murat Karcı" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:title", content: "Murat Karcı — Product Designer" },
      { name: "twitter:title", content: "Murat Karcı — Product Designer" },
      { name: "description", content: "Builds an animated, professional product designer portfolio website with detailed case studies." },
      { property: "og:description", content: "Builds an animated, professional product designer portfolio website with detailed case studies." },
      { name: "twitter:description", content: "Builds an animated, professional product designer portfolio website with detailed case studies." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4f93117e-b4a9-4446-a4c0-3bea1ccd339f/id-preview-a2eabbfb--a1901771-da1b-43c5-a164-ae590125239b.lovable.app-1776519675705.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/4f93117e-b4a9-4446-a4c0-3bea1ccd339f/id-preview-a2eabbfb--a1901771-da1b-43c5-a164-ae590125239b.lovable.app-1776519675705.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "preconnect", href: "https://api.fontshare.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700,900&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

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

  // Bypass paths: admin section, preview tab uses ?preview=1
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

  // Avoid flash: while we don't yet know settings/auth, render nothing on public pages
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
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
