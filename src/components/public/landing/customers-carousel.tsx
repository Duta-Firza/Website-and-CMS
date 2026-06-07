"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import type { CustomerData } from "@/lib/cms/home";
import { cn } from "@/lib/utils";
import { SectionIndex } from "./section-index";
import { SectionPattern } from "./section-pattern";

interface Props {
  customers: CustomerData[];
  titleOverride?: string;
}

export function CustomersCarousel({ customers, titleOverride }: Props) {
  const t = useTranslations("Landing");
  const title = titleOverride?.trim() || t("trustedAcross");
  // `direction: "rtl"` on the carousel root broke AutoScroll's loop in v8.6
  // (only the first slide rendered before scrolling off-screen with nothing
  // following). To get the reverse-direction effect (Customers scrolls
  // opposite of Partners), use the AutoScroll plugin's own `direction:
  // "backward"` option instead — that keeps a standard LTR layout but flips
  // the ambient motion. Manual arrow buttons keep their natural semantics
  // (left=prev, right=next).
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
    [
      AutoScroll({
        playOnInit: true,
        speed: 0.5,
        direction: "backward",
        stopOnInteraction: false,
        stopOnMouseEnter: true,
      }),
    ],
  );

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  useEffect(() => {
    if (!emblaApi) return;
    const update = () => {
      setCanScrollPrev(emblaApi.canScrollPrev());
      setCanScrollNext(emblaApi.canScrollNext());
    };
    update();
    emblaApi.on("select", update);
    emblaApi.on("reInit", update);
    return () => {
      emblaApi.off("select", update);
      emblaApi.off("reInit", update);
    };
  }, [emblaApi]);

  // Tapping an arrow must pause auto-scroll first; otherwise the continuous
  // motion overrides the manual jump and the click looks like a no-op.
  // 2s after the last nudge we resume — debounced across rapid clicks.
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudge = useCallback(
    (direction: "prev" | "next") => {
      if (!emblaApi) return;
      const auto = emblaApi.plugins().autoScroll;
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      auto?.stop();
      if (direction === "prev") emblaApi.scrollPrev();
      else emblaApi.scrollNext();
      resumeTimerRef.current = setTimeout(() => auto?.play(), 2000);
    },
    [emblaApi],
  );
  const scrollPrev = useCallback(() => nudge("prev"), [nudge]);
  const scrollNext = useCallback(() => nudge("next"), [nudge]);

  useEffect(() => {
    return () => {
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
    };
  }, []);

  if (customers.length === 0) return null;

  return (
    <section className="group/strip relative py-16 md:py-20">
      <SectionPattern />
      {/* <SectionIndex value="05" /> */}
      <ScrollReveal className="container relative mx-auto mb-10 px-4">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {title}
          </h2>
        </div>
      </ScrollReveal>

      {/* Edge-to-edge strip — breaks out of the centered container so the
          marquee runs the full viewport width. */}
      <ScrollReveal delay={120} className="relative">
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label={t("prev")}
          className="pointer-events-none absolute left-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background/60 text-brand-deep opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-background/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 group-hover/strip:pointer-events-auto group-hover/strip:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 md:left-6 md:flex dark:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label={t("next")}
          className="pointer-events-none absolute right-4 top-1/2 z-10 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border bg-background/60 text-brand-deep opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-background/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 group-hover/strip:pointer-events-auto group-hover/strip:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 md:right-6 md:flex dark:text-foreground"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          {/* Tighter gap + shorter cells than the Partners strip — these are
              customer marks, intentionally more humble in scale than the
              Partners section above. `py-*` reserves vertical breathing
              room for the hover shadow so it doesn't get clipped by the
              Embla overflow. */}
          <div className="flex items-center gap-2 py-2 md:gap-3 md:py-3">
            {/* Render the customer list twice so Embla's loop has enough
                content to wrap cleanly. With variable-width cells + a tight
                gap + backward auto-scroll, the loop boundary calculation
                was producing visible overlap. Doubling the list gives the
                engine a stable runway. */}
            {[...customers, ...customers].map((c, i) => (
              <div
                key={`${c.id}-${i}`}
                className="group/logo flex h-14 shrink-0 items-center justify-center rounded-md px-2 transition-all duration-300 hover:shadow-sm md:h-16 md:px-3"
                title={c.name}
              >
                <Image
                  src={c.logoUrl}
                  alt={c.name}
                  width={112}
                  height={40}
                  className={cn(
                    "max-h-8 w-auto object-contain transition-transform duration-300 group-hover/logo:scale-105 md:max-h-10",
                    c.invertOnDark && "dark:invert",
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
