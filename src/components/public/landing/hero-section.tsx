import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { HeroData } from "@/lib/cms/home";
import { cn } from "@/lib/utils";
import { HeroPattern } from "./hero-pattern";

export function HeroSection({ hero }: { hero: HeroData }) {
  const hasEyebrow = hero.eyebrow.trim().length > 0;
  const hasSecondary =
    hero.secondaryCtaLabel.trim().length > 0 && hero.secondaryCtaHref.trim().length > 0;

  // Show decorations (overlay, pattern, gradient fade) when there's no image
  // (they define the brand identity), or when the admin opts in with heroDecorations.
  const showDecorations = !hero.backgroundImage || hero.heroDecorations;

  return (
    <section
      className={cn(
        "relative isolate flex min-h-screen items-center overflow-hidden",
        "bg-[linear-gradient(135deg,#1d1a57_0%,#0e0a2f_55%,#3c526d_100%)]",
      )}
    >
      {hero.backgroundImage && (
        <Image
          src={hero.backgroundImage}
          alt=""
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover"
        />
      )}

      {showDecorations && (
        <>
          {/* Dark gradient overlay for text legibility over the photo */}
          <div className="absolute inset-0 -z-10 bg-linear-to-r from-brand-deep/90 via-brand-deep/70 to-brand-deep/30" />
          <HeroPattern />
          {/* Bottom gradient that melts the hero into the page background so the
              dark hero dissolves into the lighter content below it. */}
          {/* <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-linear-to-b from-transparent to-background" /> */}
        </>
      )}

      <div className="container mx-auto px-4 pt-32 pb-32 md:pt-40 md:pb-40">
        <div className="max-w-3xl space-y-7 text-white">
          {hasEyebrow && (
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-brand-accent" />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
                {hero.eyebrow}
              </span>
            </div>
          )}
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {hero.subtitle}
          </p>
          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href={hero.ctaHref}
              className={buttonVariants({ variant: "brand", size: "xl" })}
            >
              {hero.ctaLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            {hasSecondary && (
              <Link
                href={hero.secondaryCtaHref}
                className={buttonVariants({ variant: "brand-outline", size: "xl" })}
              >
                {hero.secondaryCtaLabel}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
