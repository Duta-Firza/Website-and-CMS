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
    <div className="flex h-full flex-col rounded-xl border bg-card p-6 shadow-sm">
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
      <h3 className="mt-4 text-base font-semibold text-brand-deep dark:text-foreground">
        {business.name}
      </h3>
      {business.description && (
        <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
          {business.description}
        </p>
      )}
      {business.websiteUrl && (
        <div className="mt-5">
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
