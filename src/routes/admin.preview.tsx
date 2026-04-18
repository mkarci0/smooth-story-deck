import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Smartphone, Tablet, Monitor, RotateCcw, ExternalLink, X } from "lucide-react";

export const Route = createFileRoute("/admin/preview")({
  head: () => ({
    meta: [
      { title: "Preview — Admin" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PreviewMode,
});

type Device = "mobile" | "tablet" | "desktop";

const DEVICES: Record<Device, { label: string; width: number; height: number; icon: typeof Smartphone }> = {
  mobile: { label: "Mobile", width: 375, height: 812, icon: Smartphone },
  tablet: { label: "Tablet", width: 768, height: 1024, icon: Tablet },
  desktop: { label: "Desktop", width: 1440, height: 900, icon: Monitor },
};

const ROUTES: { label: string; path: string }[] = [
  { label: "Home", path: "/" },
  { label: "Work", path: "/work" },
  { label: "About", path: "/about" },
];

function PreviewMode() {
  const [device, setDevice] = useState<Device>("desktop");
  const [path, setPath] = useState<string>("/");
  const [reloadKey, setReloadKey] = useState(0);

  const { width, height, label } = DEVICES[device];
  // Append a cache-buster to force iframe reload, and a flag the app can read.
  const src = `${path}${path.includes("?") ? "&" : "?"}preview=1&_=${reloadKey}`;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* CONTROL BAR */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
        <div className="px-6 lg:px-10 py-3 flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-accent animate-pulse" />
              <p className="font-display text-sm tracking-tight font-bold">
                Preview Mode
              </p>
            </div>

            {/* Device switcher */}
            <div role="tablist" aria-label="Device size" className="inline-flex items-center rounded-full border border-border bg-muted/40 p-1">
              {(Object.keys(DEVICES) as Device[]).map((d) => {
                const Icon = DEVICES[d].icon;
                const active = device === d;
                return (
                  <button
                    key={d}
                    role="tab"
                    aria-selected={active}
                    onClick={() => setDevice(d)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                      active
                        ? "bg-foreground text-background"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                    title={`${DEVICES[d].label} — ${DEVICES[d].width}px`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {DEVICES[d].label}
                  </button>
                );
              })}
            </div>

            <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
              {width} × {height}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Route picker */}
            <div className="inline-flex items-center rounded-full border border-border p-1">
              {ROUTES.map((r) => (
                <button
                  key={r.path}
                  onClick={() => setPath(r.path)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    path === r.path
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setReloadKey((k) => k + 1)}
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs hover:bg-muted transition-colors"
              title="Reload preview"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reload
            </button>

            <a
              href={path}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background px-3 py-1.5 text-xs hover:bg-accent transition-colors"
              title="Open in a new tab"
            >
              <ExternalLink className="w-3.5 h-3.5" /> New tab
            </a>
          </div>
        </div>
      </div>

      {/* DEVICE FRAME */}
      <div className="bg-muted/30 min-h-[80vh] py-10 px-4 overflow-auto">
        <div className="mx-auto" style={{ maxWidth: `${width}px` }}>
          <p className="mb-3 text-center text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            {label} · {width}px
          </p>
          <div
            className="mx-auto rounded-[28px] border border-border bg-background shadow-[0_30px_80px_-30px_rgba(0,0,0,0.25)] overflow-hidden"
            style={{ width: `${width}px`, height: `${height}px` }}
          >
            <iframe
              key={`${device}-${reloadKey}`}
              src={src}
              title={`Preview ${label}`}
              className="w-full h-full border-0 bg-background"
              // Allow the iframe to navigate & run scripts as normal — fully interactive.
            />
          </div>
        </div>
      </div>
    </div>
  );
}
