import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImage, type GalleryMeta } from "@/lib/projects";

type Props = {
  images: string[];
  meta: GalleryMeta[];
  accent: string;
  title: string;
};

/**
 * Gallery layout:
 *   1 image  → full-width hero
 *   2 images → 2-column grid
 *   3+       → swipeable carousel (mobile + desktop)
 *
 * Each image is cropped to one of two strict aspect ratios:
 *   - landscape → 4:3
 *   - portrait  → 1:2
 */
export function ProjectGallery({ images, meta, accent, title }: Props) {
  if (images.length === 0) return null;

  const orientationOf = (i: number): "landscape" | "portrait" =>
    meta[i]?.orientation ?? "landscape";

  if (images.length === 1) {
    return (
      <Frame
        src={images[0]}
        accent={accent}
        alt={`${title} — screen 1`}
        orientation={orientationOf(0)}
        priority
      />
    );
  }

  if (images.length === 2) {
    return (
      <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-2">
        {images.map((img, i) => (
          <Frame
            key={i}
            src={img}
            accent={accent}
            alt={`${title} — screen ${i + 1}`}
            orientation={orientationOf(i)}
            priority={i < 2}
          />
        ))}
      </div>
    );
  }

  return (
    <GalleryCarousel
      images={images}
      meta={meta}
      accent={accent}
      title={title}
    />
  );
}

const ratioClass = (o: "landscape" | "portrait") =>
  o === "portrait" ? "aspect-[1/2]" : "aspect-[4/3]";

function Frame({
  src,
  accent,
  alt,
  priority,
}: {
  src: string;
  accent: string;
  alt: string;
  orientation?: "landscape" | "portrait";
  priority?: boolean;
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden"
      style={{ backgroundColor: accent }}
    >
      <img
        src={resolveImage(src)}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-auto block"
      />
    </div>
  );
}

function GalleryCarousel({ images, meta, accent, title }: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 1,
    align: "center",
    slidesToScroll: 1,
    containScroll: "trimSnaps",
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
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${title} gallery`}
    >
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-6 items-stretch" aria-live="polite">
          {images.map((img, i) => {
            const o = meta[i]?.orientation ?? "landscape";
            // Portraits get a narrower slide so a tall image fits next to its
            // neighbours; landscape uses a wider slide.
            const widthClass =
              o === "portrait"
                ? "flex-[0_0_60%] sm:flex-[0_0_42%] md:flex-[0_0_32%] lg:flex-[0_0_28%]"
                : "flex-[0_0_88%] sm:flex-[0_0_70%] md:flex-[0_0_60%] lg:flex-[0_0_55%]";
            return (
              <div
                key={i}
                role="group"
                aria-roledescription="slide"
                aria-label={`${i + 1} of ${images.length}`}
                className={`${widthClass} min-w-0 pl-4 md:pl-6`}
              >
                <Frame
                  src={img}
                  accent={accent}
                  alt={`${title} — screen ${i + 1}`}
                  orientation={o}
                  priority={i < 2}
                />
              </div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous gallery image"
        className="hidden sm:flex absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent items-center justify-center transition-colors shadow-[var(--shadow-soft)]"
      >
        <ChevronLeft className="w-5 h-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next gallery image"
        className="hidden sm:flex absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent items-center justify-center transition-colors shadow-[var(--shadow-soft)]"
      >
        <ChevronRight className="w-5 h-5" aria-hidden />
      </button>

      {snapCount > 1 && (
        <div
          className="mt-8 flex justify-center gap-2"
          role="tablist"
          aria-label="Gallery pagination"
        >
          {Array.from({ length: snapCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === selected}
              aria-label={`Go to gallery image ${i + 1}`}
              onClick={() => emblaApi?.scrollTo(i)}
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
