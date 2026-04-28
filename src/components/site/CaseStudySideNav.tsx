import { useEffect, useMemo, useRef, useState } from "react";

interface CaseStudyNavItem {
  id: string;
  label: string;
  indexLabel: string;
}

interface CaseStudySideNavProps {
  items: CaseStudyNavItem[];
}

function getProgress(): number {
  const body = document.documentElement;
  const scrollable = body.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return 0;
  return Math.min(100, Math.max(0, (window.scrollY / scrollable) * 100));
}

const BACK_TO_TOP_THRESHOLD = 320; // px scrolled before button appears

export function CaseStudySideNav({ items }: CaseStudySideNavProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");
  const [progress, setProgress] = useState<number>(0);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const buttonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  useEffect(() => {
    if (items.length === 0) return;
    setActiveId((current) => current || items[0].id);
  }, [items]);

  useEffect(() => {
    if (itemIds.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-28% 0px -58% 0px",
        threshold: [0, 0.2, 0.4, 0.6, 0.8, 1],
      },
    );

    itemIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [itemIds]);

  useEffect(() => {
    const onScroll = () => {
      setProgress(getProgress());
      setShowBackToTop(window.scrollY > BACK_TO_TOP_THRESHOLD);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const button = buttonRefs.current[activeId];
    if (!button) return;
    button.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [activeId]);

  const scrollToSection = (id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (items.length === 0) return null;

  return (
    <>
      <div className="lg:hidden sticky top-16 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md">
        <div className="h-[2px] bg-muted/80">
          <div
            className="h-full bg-foreground transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
        <nav
          aria-label="Case study sections"
          className="overflow-x-auto whitespace-nowrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto max-w-6xl page-shell py-2.5 flex items-center gap-1.5 min-w-max">
            {items.map((item) => {
              const isActive = activeId === item.id;
              return (
                <button
                  key={item.id}
                  ref={(element) => {
                    buttonRefs.current[item.id] = element;
                  }}
                  onClick={() => scrollToSection(item.id)}
                  aria-current={isActive ? "true" : undefined}
                  className={`shrink-0 rounded-full px-3.5 py-2 text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    isActive
                      ? "text-foreground bg-muted font-semibold"
                      : "text-muted-foreground hover:text-accent"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>

      <aside className="hidden 2xl:block fixed right-6 top-24 bottom-6 z-30">
        <div className="h-full w-[220px] rounded-2xl border border-border/60 bg-background/88 backdrop-blur-sm p-3 flex flex-col">
          <nav aria-label="Case study sections" className="min-h-0 flex-1 overflow-y-auto pr-1">
            <ol className="space-y-1.5">
              {items.map((item) => {
                const isActive = activeId === item.id;
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollToSection(item.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={`w-full text-left text-xs xl:text-sm px-2 py-1.5 rounded-md transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                        isActive
                          ? "text-foreground bg-muted font-semibold"
                          : "text-muted-foreground hover:text-accent font-normal"
                      }`}
                    >
                      <span className="mr-1.5 tabular-nums">{item.indexLabel}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Back to top"
            aria-hidden={!showBackToTop}
            tabIndex={showBackToTop ? 0 : -1}
            className={`mt-3 w-full rounded-full border border-border px-3 py-2 text-[10px] xl:text-xs tracking-[0.12em] transition-all duration-300 ${
              showBackToTop
                ? "opacity-100 pointer-events-auto text-muted-foreground hover:text-accent"
                : "opacity-35 pointer-events-none text-muted-foreground/60"
            }`}
          >
            BACK TO TOP
          </button>
        </div>
      </aside>
    </>
  );
}
