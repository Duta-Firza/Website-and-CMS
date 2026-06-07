import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import type { AffiliatedBusinessData } from "@/lib/cms/about";

interface Props {
  business: AffiliatedBusinessData;
  visitLabel: string;
}

export function AffiliatedBusinessCard({ business, visitLabel }: Props) {
  return (
    <div className="group/ab relative flex h-full flex-col overflow-hidden rounded-xl border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md">
      {/* Top accent stripe — slides in on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/ab:scale-x-100"
      />
      {/* Diagonal corner cut — soft brand-accent triangle in bottom-right */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 bg-brand-accent/6 transition-all duration-300 group-hover/ab:bg-brand-accent/10"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
      />

      <div className="relative h-16 w-full">
        {business.logoUrl ? (
          <Image
            src={business.logoUrl}
            alt={business.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain object-left"
          />
        ) : (
          <div className="flex h-full items-center font-semibold text-brand-deep dark:text-foreground">
            {business.name}
          </div>
        )}
      </div>
      <h3 className="mt-4 text-base font-semibold text-brand-deep transition-colors group-hover/ab:text-brand-accent dark:text-foreground">
        {business.name}
      </h3>
      {business.description && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {business.description}
        </p>
      )}
      {business.websiteUrl && (
        <div className="relative mt-5">
          <a
            href={business.websiteUrl}
            target="_blank"
            rel="noreferrer noopener"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            {visitLabel}
            <ExternalLink className="ml-2 h-3.5 w-3.5" />
          </a>
        </div>
      )}
    </div>
  );
}
