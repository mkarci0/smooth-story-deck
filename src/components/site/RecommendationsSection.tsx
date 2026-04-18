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
      <section className="mx-auto max-w-5xl px-6 lg:px-10 py-20 md:py-28">
        <Reveal className="text-center mb-12">
          <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">{title}</p>
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
      <p className="font-display text-2xl md:text-3xl leading-tight tracking-tight text-balance font-medium">
        "{item.quote}"
      </p>
      <p className="mt-6 text-sm text-muted-foreground">
        — {item.name}
        {item.role && `, ${item.role}`}
        {item.company && ` at ${item.company}`}
      </p>
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
    <section className="mx-auto max-w-6xl px-6 lg:px-10 py-20 md:py-28">
      <Reveal className="text-center mb-12">
        <p className="uppercase tracking-[0.2em] text-xs text-muted-foreground mb-3">{title}</p>
      </Reveal>

      <div className="relative">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {items.map((r) => (
              <div key={r.id} className="flex-[0_0_100%] min-w-0 px-4 md:px-12">
                <div className="max-w-3xl mx-auto text-center">
                  <p className="font-display text-2xl md:text-4xl leading-tight tracking-tight text-balance font-medium">
                    "{r.quote}"
                  </p>
                  <p className="mt-6 text-sm text-muted-foreground">
                    — {r.name}
                    {r.role && `, ${r.role}`}
                    {r.company && ` at ${r.company}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* arrows */}
        <button
          onClick={scrollPrev}
          aria-label="Previous"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          onClick={scrollNext}
          aria-label="Next"
          className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:bg-muted flex items-center justify-center transition-colors"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* dots */}
        <div className="mt-10 flex justify-center gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              aria-label={`Go to slide ${i + 1}`}
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
