import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createRouter, useRouter } from "@tanstack/react-router";
import { HelmetProvider } from "react-helmet-async";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routeTree } from "./routeTree.gen";
import "./styles.css";

function DefaultErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-24">
      <div className="max-w-xl text-center">
        <p className="uppercase tracking-[0.22em] text-xs text-muted-foreground mb-6">
          Something broke
        </p>
        <h1 className="font-display text-5xl md:text-7xl tracking-[-0.02em] leading-[0.95] text-foreground text-balance font-medium">
          Well, this is awkward.
        </h1>
        <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-md mx-auto text-balance">
          An unexpected error happened on this page. Try again, or head back home.
        </p>
        {error?.message && (
          <pre className="mt-8 max-h-60 overflow-auto rounded-2xl bg-muted p-4 text-left font-mono text-xs text-destructive whitespace-pre-wrap">
            {error.message}
            {error.stack ? `\n\n${error.stack}` : ""}
          </pre>
        )}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-primary"
          >
            Try again
          </button>
          <a href="/" className="btn-secondary">
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

const queryClient = new QueryClient();

const router = createRouter({
  routeTree,
  context: {},
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: DefaultErrorComponent,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

if (typeof window !== "undefined") {
  const host = window.location.hostname;
  const path = window.location.pathname;
  if (host === "admin.muratkarci.com" && !path.startsWith("/admin")) {
    window.location.replace("/admin/login");
  }
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
