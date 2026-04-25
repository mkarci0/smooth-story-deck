import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { session, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLoginRoute = location.pathname === "/admin/login";
  const isPreviewRoute = location.pathname.startsWith("/admin/preview");

  useEffect(() => {
    if (loading || isLoginRoute) return;
    if (!session) navigate({ to: "/admin/login" });
  }, [loading, isLoginRoute, session, navigate]);

  const adminHelmet = (
    <Helmet>
      <title>Admin — Portfolio CMS</title>
      <meta name="robots" content="noindex" />
    </Helmet>
  );

  if (isLoginRoute) {
    return <Outlet />;
  }

  // Preview mode: render full-screen without admin chrome
  if (isPreviewRoute && session && isAdmin) {
    return <Outlet />;
  }

  if (loading) {
    return <div className="mx-auto max-w-5xl px-6 py-24 text-muted-foreground">Loading…</div>;
  }

  if (!session) return null;

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-24">
        <h1 className="font-display text-3xl tracking-tight">Not authorized</h1>
        <p className="mt-3 text-muted-foreground">
          You’re signed in as <strong>{user?.email}</strong> but don’t have the admin role.
          Ask Lovable in chat to grant admin to this email.
        </p>
        <button
          onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
          className="mt-6 rounded-full bg-foreground text-background px-5 py-2 text-sm"
        >Sign out</button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl page-shell py-10">
      {adminHelmet}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground">Portfolio CMS</p>
          <h1 className="font-display text-3xl mt-1 tracking-tight">Admin</h1>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <Link to="/" className="story-link text-muted-foreground">view site</Link>
          <a
            href="/admin/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-4 py-1.5 hover:bg-accent transition-colors"
            title="Open preview in a new tab"
          >
            Preview
          </a>
          <span className="text-muted-foreground hidden md:inline">{user?.email}</span>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
            className="rounded-full border border-border px-4 py-1.5 hover:bg-muted"
          >Sign out</button>
        </div>
      </div>
      <nav className="flex items-center gap-1 mb-10 border-b border-border" aria-label="Admin sections">
        {(() => {
          const isProjects = location.pathname === "/admin" || location.pathname === "/admin/";
          const isSettings = location.pathname.startsWith("/admin/settings");
          const base = "px-4 py-2.5 text-sm font-medium transition-colors -mb-px border-b-2";
          const inactive = "text-muted-foreground border-transparent hover:text-foreground";
          const active = "text-foreground border-foreground font-semibold";
          return (
            <>
              <Link to="/admin" className={`${base} ${isProjects ? active : inactive}`}>
                Projects
              </Link>
              <Link to="/admin/settings" className={`${base} ${isSettings ? active : inactive}`}>
                Site Settings
              </Link>
            </>
          );
        })()}
      </nav>
      <Outlet />
    </div>
  );
}
