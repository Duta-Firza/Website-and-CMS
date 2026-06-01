"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import type { PartnerData } from "@/lib/cms/home";

interface Props {
  partners: PartnerData[];
}

export function PartnersCarousel({ partners }: Props) {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start" },
    [AutoScroll({ playOnInit: true, speed: 0.6, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

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
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-12 md:gap-16">
            {partners.map((p) => (
              <Link
                key={p.id}
                href={`/${locale}/partners`}
                title={p.summary}
                className="flex h-16 w-40 shrink-0 items-center justify-center rounded-md grayscale transition hover:grayscale-0 md:h-20 md:w-48"
              >
                <Image
                  src={p.logoUrl}
                  alt={p.name}
                  width={160}
                  height={64}
                  className={cn("max-h-12 w-auto object-contain", p.invertOnDark && "dark:invert")}
                />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
