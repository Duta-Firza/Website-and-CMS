"use client";

import { FileText, Maximize2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CredentialData } from "@/lib/cms/about";

interface Props {
  credentials: CredentialData[];
  emptyMessage: string;
  issuerLabel: string;
  yearLabel: string;
}

export function CredentialsGrid({
  credentials,
  emptyMessage,
  issuerLabel,
  yearLabel,
}: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = credentials.find((c) => c.id === activeId) ?? null;

  if (credentials.length === 0) {
    return <p className="py-10 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {credentials.map((credential, idx) => (
          <ScrollReveal key={credential.id} delay={(idx % 4) * 80}>
            <button
              type="button"
              onClick={() => setActiveId(credential.id)}
              className="group/cr relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
            >
              {/* Top accent stripe — slides in on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-0 z-20 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/cr:scale-x-100"
              />

              {/* Document scan — flush to the card edges, fills the slot */}
              <div className="relative aspect-3/4 w-full overflow-hidden bg-white">
                {credential.imageUrl ? (
                  <Image
                    src={credential.imageUrl}
                    alt={credential.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover/cr:scale-[1.02]"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <FileText className="h-12 w-12" />
                  </div>
                )}

                {/* Expand affordance — appears on hover, makes "click to view" obvious */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-deep/85 text-white opacity-0 shadow-sm backdrop-blur transition-opacity duration-300 group-hover/cr:opacity-100 dark:bg-foreground/85 dark:text-background"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </span>
              </div>

              <div className="p-4">
                <p className="line-clamp-2 text-sm font-medium leading-snug text-brand-deep transition-colors group-hover/cr:text-brand-accent dark:text-foreground">
                  {credential.title}
                </p>
                {credential.issuer && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{credential.issuer}</p>
                )}
              </div>
            </button>
          </ScrollReveal>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-brand-deep dark:text-foreground">
                  {active.title}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[1fr_220px]">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-md border bg-white">
                  {active.imageUrl ? (
                    <Image
                      src={active.imageUrl}
                      alt={active.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 60vw"
                      className="object-contain"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <FileText className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <div className="space-y-3 text-sm">
                  {active.issuer && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {issuerLabel}
                      </p>
                      <p className="mt-0.5 font-medium text-brand-deep dark:text-foreground">
                        {active.issuer}
                      </p>
                    </div>
                  )}
                  {active.year !== undefined && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                        {yearLabel}
                      </p>
                      <p className="mt-0.5 font-medium text-brand-deep dark:text-foreground">
                        {active.year}
                      </p>
                    </div>
                  )}
                  {active.description && (
                    <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
                      {active.description}
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
