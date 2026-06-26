"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import { buttonVariants } from "@/components/ui/button";
import type { PartnerData } from "@/lib/cms/home";
import { cn } from "@/lib/utils";
import { SectionAccent } from "./section-accent";

interface Props {
  partners: PartnerData[];
  titleOverride?: string;
  subtitleOverride?: string;
}

export function PartnersCarousel({ partners, titleOverride, subtitleOverride }: Props) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const title = titleOverride?.trim() || t("ourPartners");
  const subtitle = subtitleOverride?.trim() || t("ourPartnersSubtitle");
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
    <section className="group/strip relative isolate overflow-hidden py-16 md:py-20">
      <SectionAccent variant="ticks" />
      <ScrollReveal className="container relative mx-auto mb-10 px-4">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
          <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {title}
          </h2>
          <p className="text-base text-muted-foreground">{subtitle}</p>
        </div>
      </ScrollReveal>

      {/* Edge-to-edge strip — breaks out of the centered container so the
          marquee runs the full viewport width. */}
      <ScrollReveal as="div" delay={120} className="relative">
        {/* Manual nav — hidden until the section is hovered (or a button
            receives keyboard focus). Semi-transparent so the logos behind
            stay readable. */}
        <button
          type="button"
          onClick={scrollPrev}
          disabled={!canScrollPrev}
          aria-label={t("prev")}
          className="pointer-events-none absolute left-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/60 text-brand-deep opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-background/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 group-hover/strip:pointer-events-auto group-hover/strip:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 md:left-6 md:flex dark:text-foreground"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={scrollNext}
          disabled={!canScrollNext}
          aria-label={t("next")}
          className="pointer-events-none absolute right-4 top-1/2 z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border bg-background/60 text-brand-deep opacity-0 shadow-sm backdrop-blur transition-opacity duration-200 hover:bg-background/80 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 group-hover/strip:pointer-events-auto group-hover/strip:opacity-100 focus-visible:pointer-events-auto focus-visible:opacity-100 md:right-6 md:flex dark:text-foreground"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="overflow-hidden" ref={emblaRef}>
          {/* `py-*` reserves vertical breathing room so the hover shadow on
              each logo cell doesn't get sliced off by the Embla overflow. */}
          <div className="flex items-center gap-3 py-3 md:gap-4 md:py-5">
            {/* Render the partner list twice so Embla's loop has enough
                content to wrap cleanly. With tight gaps + a moderate slide
                count the raw content can fall just under the 2× viewport
                threshold the loop needs, which causes an empty band at the
                wrap boundary. Doubling the list closes that gap; users see
                the same set come around again, which is what a seamless
                marquee implies anyway. */}
            {[...partners, ...partners].map((p, i) => (
              <PartnerLogo key={`${p.id}-${i}`} partner={p} />
            ))}
          </div>
        </div>
      </ScrollReveal>

      <ScrollReveal delay={200} className="container relative mx-auto mt-10 flex justify-center px-4">
        <Link
          href={`/${locale}/solutions/trading/partners`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {t("seeAllPartners")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </ScrollReveal>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: PartnerData }) {
  // Cell height stays static, but width is `w-auto` so each logo only takes
  // the room it actually needs — wide logos no longer overflow on hover, and
  // narrow logos no longer sit inside a sea of whitespace. Internal `px-*`
  // keeps the focus ring / shadow from kissing the logo edges.
  const inner = (
    <div className="group/logo flex h-16 shrink-0 items-center justify-center rounded-md px-3 transition-all duration-300 hover:shadow-md md:h-20 md:px-4">
      <Image
        src={partner.logoUrl}
        alt={partner.name}
        width={400}
        height={120}
        className={cn(
          "h-10 w-auto max-w-none object-contain transition-transform duration-300 group-hover/logo:scale-105 md:h-12",
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
