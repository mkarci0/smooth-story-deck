import { createFileRoute, Link, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Portfolio CMS" }, { name: "robots", content: "noindex" }] }),
  component: AdminLayout,
});

function AdminLayout() {
  const { session, isAdmin, loading, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!session) navigate({ to: "/admin/login" });
  }, [loading, session, navigate]);

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
    <div className="mx-auto max-w-6xl px-6 lg:px-10 py-10">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground">Portfolio CMS</p>
          <h1 className="font-display text-3xl mt-1 tracking-tight">Admin</h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link to="/" className="story-link text-muted-foreground">view site</Link>
          <span className="text-muted-foreground">{user?.email}</span>
          <button
            onClick={() => supabase.auth.signOut().then(() => navigate({ to: "/admin/login" }))}
            className="rounded-full border border-border px-4 py-1.5 hover:bg-muted"
          >Sign out</button>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
