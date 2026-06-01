"use client";

import AutoScroll from "embla-carousel-auto-scroll";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { CustomerData } from "@/lib/cms/home";

interface Props {
  customers: CustomerData[];
}

export function CustomersCarousel({ customers }: Props) {
  const t = useTranslations("Landing");
  const [emblaRef] = useEmblaCarousel(
    { loop: true, dragFree: true, align: "start", direction: "rtl" },
    [AutoScroll({ playOnInit: true, speed: 0.5, stopOnInteraction: false, stopOnMouseEnter: true })],
  );

  if (customers.length === 0) return null;

  return (
    <section className="bg-muted/40">
      <div className="container mx-auto px-4 py-16 md:py-20">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
            {t("trustedAcross")}
          </h2>
        </div>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-10 md:gap-14">
            {customers.map((c) => (
              <div
                key={c.id}
                className="flex h-16 w-32 shrink-0 items-center justify-center md:h-20 md:w-40"
                title={c.name}
              >
                <Image
                  src={c.logoUrl}
                  alt={c.name}
                  width={128}
                  height={56}
                  className={cn(
                    "max-h-12 w-auto object-contain opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0",
                    c.invertOnDark && "dark:invert",
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
