import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { resolveImage } from "@/lib/projects";

type Props = {
  images: string[];
  accent: string;
  title: string;
};

/**
 * Gallery layout:
 *   1 image  → full-width hero
 *   2 images → 2-column grid (desktop) / stacked (mobile)
 *   3+       → horizontal carousel with arrows + dots
 *
 * The carousel preserves the natural aspect ratio of each image (so portrait
 * and landscape uploads both look right) and is swipeable on mobile.
 */
export function ProjectGallery({ images, accent, title }: Props) {
  if (images.length === 0) return null;

  if (images.length === 1) {
    return (
      <Frame src={images[0]} accent={accent} alt={`${title} — screen 1`} priority />
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
          />
        ))}
      </div>
    );
  }

  return <GalleryCarousel images={images} accent={accent} title={title} />;
}

function Frame({
  src,
  accent,
  alt,
  priority,
}: {
  src: string;
  accent: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: accent }}>
      <img
        src={resolveImage(src)}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="w-full h-auto object-contain"
      />
    </div>
  );
}

/**
 * Carousel frame: keeps the image's natural aspect ratio (portrait or landscape)
 * by constraining max-height instead of forcing a fixed aspect.
 */
function CarouselFrame({
  src,
  accent,
  alt,
}: {
  src: string;
  accent: string;
  alt: string;
}) {
  return (
    <div
      className="rounded-3xl overflow-hidden flex items-center justify-center"
      style={{ backgroundColor: accent }}
    >
      <img
        src={resolveImage(src)}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="w-full h-auto max-h-[70vh] object-contain"
      />
    </div>
  );
}

function GalleryCarousel({ images, accent, title }: Props) {
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
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex -ml-4 md:-ml-6">
          {images.map((img, i) => (
            <div
              key={i}
              className="flex-[0_0_88%] sm:flex-[0_0_70%] md:flex-[0_0_60%] lg:flex-[0_0_55%] min-w-0 pl-4 md:pl-6"
            >
              <CarouselFrame src={img} accent={accent} alt={`${title} — screen ${i + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => emblaApi?.scrollPrev()}
        aria-label="Previous gallery image"
        className="hidden sm:flex absolute -left-2 md:-left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent items-center justify-center transition-colors shadow-[var(--shadow-soft)]"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={() => emblaApi?.scrollNext()}
        aria-label="Next gallery image"
        className="hidden sm:flex absolute -right-2 md:-right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full border border-border bg-background hover:border-accent hover:text-accent items-center justify-center transition-colors shadow-[var(--shadow-soft)]"
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
