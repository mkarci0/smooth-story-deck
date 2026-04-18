import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin login" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && session && isAdmin) {
      navigate({ to: "/admin" });
    }
  }, [loading, session, isAdmin, navigate]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err: any) {
      setError(err?.message ?? "Sign in failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <Link to="/" className="story-link text-sm text-muted-foreground">← back to site</Link>
      <h1 className="mt-6 font-display text-4xl tracking-tight">Admin sign in</h1>
      <p className="mt-2 text-muted-foreground text-sm">
        Sign in to manage your portfolio.
      </p>

      <form onSubmit={handle} className="mt-8 space-y-4">
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-widest text-muted-foreground">Password</label>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="mt-1 w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-accent"
          />
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit" disabled={busy}
          className="w-full rounded-full bg-foreground text-background py-3 text-sm font-medium hover:bg-accent transition-colors disabled:opacity-50"
        >
          {busy ? "Please wait…" : "Sign in"}
        </button>
      </form>

      {session && !isAdmin && (
        <div className="mt-8 p-4 rounded-xl bg-butter text-sm">
          <p className="font-medium">You're signed in but not an admin.</p>
          <p className="mt-1 text-muted-foreground">This account does not have the admin role.</p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="mt-3 story-link text-foreground/70"
          >sign out</button>
        </div>
      )}
    </div>
  );
}
