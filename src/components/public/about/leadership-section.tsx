"use client";

import { Maximize2, User } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { ScrollReveal } from "@/components/public/scroll-reveal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { LeadershipMemberData } from "@/lib/cms/about";

export interface LeadershipGroup {
  label: string;
  members: LeadershipMemberData[];
  emptyMessage: string;
}

interface Props {
  groups: LeadershipGroup[];
}

/**
 * Renders one or more stacked groups of leadership cards (e.g. Directors on
 * top, Commissioners below). All cards across groups share a single dialog
 * for member detail. Client component because of dialog state.
 */
export function LeadershipSection({ groups }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active =
    activeId !== null
      ? groups.flatMap((g) => g.members).find((m) => m.id === activeId) ?? null
      : null;

  return (
    <>
      <div className="space-y-14">
        {groups.map((group, gi) => (
          <section key={group.label}>
            <ScrollReveal className="mb-6 flex flex-col items-center gap-3 text-center">
              <span className="h-0.75 w-10 bg-brand-accent" aria-hidden />
              <h2 className="text-xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-2xl">
                {group.label}
              </h2>
            </ScrollReveal>

            {group.members.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                {group.emptyMessage}
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {group.members.map((member, idx) => (
                  <ScrollReveal
                    key={member.id}
                    delay={(idx % 4) * 80 + gi * 60}
                    className="group/lm"
                  >
                    <LeadershipCard
                      member={member}
                      onClick={() => setActiveId(member.id)}
                    />
                  </ScrollReveal>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <Dialog open={active !== null} onOpenChange={(open) => !open && setActiveId(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          {active && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl text-brand-deep dark:text-foreground">
                  {active.name}
                </DialogTitle>
                <p className="text-sm text-muted-foreground">{active.title}</p>
              </DialogHeader>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-[160px_1fr]">
                <div className="relative aspect-square w-full overflow-hidden rounded-md border bg-muted md:w-40">
                  {active.photoUrl ? (
                    <Image
                      src={active.photoUrl}
                      alt={active.name}
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                      <User className="h-16 w-16" />
                    </div>
                  )}
                </div>
                <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                  {active.bio || "—"}
                </p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

/**
 * Lanyard-style ID card: a brand-deep header band (with a centered slot
 * mimicking the lanyard hole) sits across the top, a thin brand-accent
 * underline reads as a badge accent, then a portrait photo and a
 * divider'd name/title panel below. No persistent corner icon — the
 * lanyard band already reads as "card to look at", and `cursor-pointer`
 * plus a hover lift signal that it's interactive.
 */
function LeadershipCard({
  member,
  onClick,
}: {
  member: LeadershipMemberData;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group/card relative flex w-full cursor-pointer flex-col overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-brand-accent/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent focus-visible:ring-offset-2"
    >
      {/* Lanyard header band — brand-deep strip with a centered "hole" slot.
          Reads as the part of an ID badge that the lanyard threads through. */}
      <div className="relative h-3.5 w-full bg-brand-deep dark:bg-foreground/15">
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 h-1 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/85 shadow-inner"
        />
      </div>

      {/* Thin brand-accent rule under the band — subtle badge accent.
          Slightly brighter on hover for affordance. */}
      {/* <span
        aria-hidden
        className="block h-0.5 w-full bg-brand-accent/30 transition-colors duration-300 group-hover/card:bg-brand-accent"
      /> */}

      {/* Photo */}
      <div className="relative aspect-4/5 w-full overflow-hidden bg-muted">
        {member.photoUrl ? (
          <Image
            src={member.photoUrl}
            alt={member.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover grayscale transition duration-500 group-hover/card:scale-[1.02] group-hover/card:grayscale-0"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <User className="h-20 w-20" />
          </div>
        )}

        {/* Expand affordance — appears on hover, signals "click for detail" */}
        <span
          aria-hidden
          className="pointer-events-none absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-brand-deep/85 text-white opacity-0 shadow-sm backdrop-blur transition-opacity duration-300 group-hover/card:opacity-100 dark:bg-foreground/85 dark:text-background"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </span>
      </div>

      {/* Info panel */}
      <div className="border-t border-border/70 px-4 py-3">
        <p className="line-clamp-2 text-sm font-semibold leading-snug text-brand-deep dark:text-foreground">
          {member.name}
        </p>
        <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-muted-foreground">
          {member.title}
        </p>
      </div>
    </button>
  );
}
