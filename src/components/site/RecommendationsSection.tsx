import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "./Reveal";
import type { Recommendation } from "@/lib/recommendations";

type Props = {
  title: string;
  items: Recommendation[];
};

export function RecommendationsSection({ title, items }: Props) {
  if (items.length === 0) return null;

  // 1 item → single quote, 2 items → side-by-side, 3+ → carousel
  if (items.length <= 2) {
    return (
      <section
        className="mx-auto max-w-5xl px-6 lg:px-10 py-20 md:py-28"
        aria-labelledby="recs-heading-static"
      >
        <Reveal className="text-center mb-12">
          <h2
            id="recs-heading-static"
            className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3 font-normal"
          >
            {title}
          </h2>
        </Reveal>
        <div className={`grid gap-10 ${items.length === 2 ? "md:grid-cols-2" : ""}`}>
          {items.map((r) => (
            <QuoteCard key={r.id} item={r} centered={items.length === 1} />
          ))}
        </div>
      </section>
    );
  }

  return <RecommendationsCarousel title={title} items={items} />;
}

function QuoteCard({ item, centered = false }: { item: Recommendation; centered?: boolean }) {
  return (
    <Reveal className={centered ? "text-center max-w-3xl mx-auto" : ""}>
      <figure>
        <blockquote className="font-display text-2xl md:text-3xl leading-tight tracking-tight text-balance font-medium">
          "{item.quote}"
        </blockquote>
        <figcaption className="mt-6 text-sm text-muted-foreground">
          — {item.name}
          {item.role && `, ${item.role}`}
          {item.company && ` at ${item.company}`}
        </figcaption>
      </figure>
    </Reveal>
  );
}

function RecommendationsCarousel({ title, items }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const scrollPrev = () => emblaApi?.scrollPrev();
  const scrollNext = () => emblaApi?.scrollNext();
  const scrollTo = (i: number) => emblaApi?.scrollTo(i);

  return (
    <section
      className="mx-auto max-w-6xl px-6 lg:px-10 py-20 md:py-28"
      aria-labelledby="recs-heading"
    >
      <Reveal className="text-center mb-12">
        <h2
          id="recs-heading"
          className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3 font-normal"
        >
          {title}
        </h2>
      </Reveal>

      <div
        className="relative"
        role="region"
        aria-roledescription="carousel"
        aria-label={title}
      >
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex" aria-live="polite">
            {items.map((r, i) => (
              <div
                key={r.id}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${items.length}`}
                className="flex-[0_0_100%] min-w-0 px-4 md:px-12"
              >
                <figure className="max-w-3xl mx-auto text-center">
                  <blockquote className="font-display text-2xl md:text-4xl leading-tight tracking-tight text-balance font-medium">
                    "{r.quote}"
                  </blockquote>
                  <figcaption className="mt-6 text-sm text-muted-foreground">
                    — {r.name}
                    {r.role && `, ${r.role}`}
                    {r.company && ` at ${r.company}`}
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        {/* arrows */}
        <button
          type="button"
          onClick={scrollPrev}
          aria-label="Previous recommendation"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" aria-hidden />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          aria-label="Next recommendation"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" aria-hidden />
        </button>

        {/* dots */}
        <div className="mt-10 flex justify-center gap-2" role="tablist" aria-label="Recommendations pagination">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-label={`Go to recommendation ${i + 1}`}
              onClick={() => scrollTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === selected ? "w-8 bg-accent" : "w-1.5 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
