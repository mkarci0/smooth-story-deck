import type { ReactNode } from "react";

export const inputCls =
  "w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm font-sans focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition";

export function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="space-y-5">
      <div className="border-b border-border pb-3">
        <h3 className="font-display text-lg tracking-tight font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Field({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block space-y-2">
      <span className="text-xs uppercase tracking-[0.16em] text-muted-foreground font-medium">{label}</span>
      {children}
      {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
    </label>
  );
}
