import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import type { HeroData } from "@/lib/cms/home";

export function HeroSection({ hero }: { hero: HeroData }) {
  return (
    <section className="relative isolate flex min-h-[78vh] items-center overflow-hidden">
      <Image
        src={hero.backgroundImage}
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-brand-deep/85 via-brand-deep/65 to-brand-deep/35" />
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-3xl space-y-6 text-white">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-white/85 md:text-lg">
            {hero.subtitle}
          </p>
          <div className="pt-2">
            <Link href={hero.ctaHref} className={buttonVariants({ variant: "brand", size: "xl" })}>
              {hero.ctaLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
