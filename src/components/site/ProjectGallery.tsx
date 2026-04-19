import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImage } from "@/lib/projects";
import { Reveal } from "./Reveal";

type Props = {
  images: string[];
  accent: string;
  title: string;
};

/**
 * Project gallery layout rules:
 *   1 image  → full-width hero
 *   2 images → 2-column grid
 *   3 images → 3-column grid
 *   4+       → 3-column carousel (left/right arrows + dots)
 */
export function ProjectGallery({ images, accent, title }: Props) {
  if (images.length === 0) return null;

  if (images.length <= 3) {
    const cols =
      images.length === 1
        ? "grid-cols-1"
        : images.length === 2
          ? "grid-cols-1 md:grid-cols-2"
          : "grid-cols-1 md:grid-cols-3";

    return (
      <div className={`grid gap-6 md:gap-8 ${cols}`}>
        {images.map((img, i) => (
          <Reveal key={i} delay={i * 0.05}>
            <Frame src={img} accent={accent} alt={`${title} — screen ${i + 1}`} />
          </Reveal>
        ))}
      </div>
    );
  }

  return <GalleryCarousel images={images} accent={accent} title={title} />;
}

function Frame({ src, accent, alt }: { src: string; accent: string; alt: string }) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: accent }}>
      <img
        src={resolveImage(src)}
        alt={alt}
        width={1200}
        height={900}
        loading="lazy"
        decoding="async"
        className="w-full aspect-[4/3] object-cover"
      />
    </div>
  );
}

function GalleryCarousel({ images, accent, title }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
    align: "start",
    slidesToScroll: 1,
  });
  const [selected, setSelected] = useState(0);
  const [snapCount, setSnapCount] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    const onInit = () => setSnapCount(emblaApi.scrollSnapList().length);
    onInit();
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onInit);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onInit);
    };
  }, [emblaApi]);

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-6">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-[0_0_85%] sm:flex-[0_0_50%] md:flex-[0_0_33.3333%] min-w-0 pl-4 md:pl-6"
            >
              <Frame src={img} accent={accent} alt={`${title} — screen ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous gallery image"
        className="absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent flex items-center justify-center transition-colors shadow-[var(--shadow-soft)]"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next gallery image"
        className="absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent flex items-center justify-center transition-colors shadow-[var(--shadow-soft)]"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {snapCount > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => emblaApi?.scrollTo(i)}
              aria-label={`Go to gallery image ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === selected ? "w-8 bg-accent" : "w-1.5 bg-border hover:bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
