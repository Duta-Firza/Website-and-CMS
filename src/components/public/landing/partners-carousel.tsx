"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import type { PartnerData } from "@/lib/cms/home";
import { cn } from "@/lib/utils";

interface Props {
  partners: PartnerData[];
}

export function PartnersCarousel({ partners }: Props) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
    // `stopOnInteraction: false` keeps the auto-scroll alive after the user
    // drags or taps the arrow buttons — otherwise hovering a logo (which the
    // plugin counts as interaction) would *permanently* halt the strip and it
    // would never resume when the cursor left the section.
    // `stopOnMouseEnter: true` keeps the pause-on-hover, resume-on-leave UX.
    [AutoScroll({ playOnInit: true, speed: 0.6, stopOnInteraction: false, stopOnMouseEnter: true })],
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

  // When the user taps an arrow we need to pause the running auto-scroll —
  // otherwise the continuous motion immediately overrides the manual jump and
  // the click looks like a no-op. We pause, perform the scroll, then schedule
  // a resume 2s later so ambient motion eventually picks back up. Clicks in
  // quick succession debounce that timer so the resume only fires after the
  // user stops poking the arrows.
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

  if (partners.length === 0) return null;

  return (
    <section className="bg-muted/40">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("ourPartners")}
          </h2>
          <p className="mt-3 text-base text-muted-foreground">{t("ourPartnersSubtitle")}</p>
        </div>

        <div className="relative">
          {/* Manual nav — floating overlays. Hidden on mobile where dragging covers it. */}
          <button
            type="button"
            onClick={scrollPrev}
            disabled={!canScrollPrev}
            aria-label={t("prev")}
            className="absolute left-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 text-brand-deep shadow-sm backdrop-blur transition hover:bg-background hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 md:flex dark:text-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={scrollNext}
            disabled={!canScrollNext}
            aria-label={t("next")}
            className="absolute right-0 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/90 text-brand-deep shadow-sm backdrop-blur transition hover:bg-background hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 md:flex dark:text-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="overflow-hidden md:mx-12" ref={emblaRef}>
            {/* `py-*` reserves vertical breathing room so the hover shadow on
                each logo cell doesn't get sliced off by the Embla overflow. */}
            <div className="flex items-center gap-10 py-3 md:gap-14 md:py-5">
              {partners.map((p) => (
                <PartnerLogo key={p.id} partner={p} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={`/${locale}/solutions/trading/partners`}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            {t("seeAllPartners")}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: PartnerData }) {
  // Cell height stays static, but width is `w-auto` so each logo only takes
  // the room it actually needs — wide logos no longer overflow on hover, and
  // narrow logos no longer sit inside a sea of whitespace. Internal `px-*`
  // keeps the focus ring / shadow from kissing the logo edges.
  const inner = (
    <div className="group/logo flex h-20 shrink-0 items-center justify-center rounded-md px-4 transition-all duration-300 hover:shadow-md md:h-24 md:px-5">
      <Image
        src={partner.logoUrl}
        alt={partner.name}
        width={400}
        height={120}
        className={cn(
          "h-12 w-auto max-w-none object-contain transition-transform duration-300 group-hover/logo:scale-105 md:h-14",
          partner.invertOnDark && "dark:invert",
        )}
      />
    </div>
  );

  if (partner.websiteUrl) {
    return (
      <a
        href={partner.websiteUrl}
        target="_blank"
        rel="noreferrer noopener"
        title={partner.name}
        className="shrink-0"
      >
        {inner}
      </a>
    );
  }

  return (
    <div title={partner.name} className="shrink-0">
      {inner}
    </div>
  );
}
