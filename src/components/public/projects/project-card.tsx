import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HighlightText } from "@/components/public/highlight-text";
import { Badge } from "@/components/ui/badge";
import type { ProjectHighlightData } from "@/lib/cms/home";

interface Props {
  project: ProjectHighlightData;
  locale: string;
  fallbackBadge: string;
  viewProjectLabel: string;
  /** Active search term — matching text in client/title/summary is highlighted. */
  highlight?: string;
}

export function ProjectCard({
  project,
  locale,
  fallbackBadge,
  viewProjectLabel,
  highlight = "",
}: Props) {
  return (
    <Link
      href={`/${locale}/solutions/epc/${project.slug}`}
      className="group/proj relative flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-brand-accent/30 hover:shadow-lg"
    >
      {/* Top accent stripe — slides in from the left on hover */}
      <span className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0.75 origin-left scale-x-0 bg-brand-accent transition-transform duration-500 group-hover/proj:scale-x-100" />

      <div className="relative aspect-16/10 overflow-hidden">
        <Image
          src={project.image}
          alt={project.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover/proj:scale-105"
        />
      </div>

      {/* Diagonal corner triangle — soft brand-accent in bottom-right */}
      <span
        className="pointer-events-none absolute bottom-0 right-0 h-14 w-14 bg-brand-accent/6 transition-all duration-300 group-hover/proj:bg-brand-accent/10"
        style={{ clipPath: "polygon(100% 0, 100% 100%, 0 100%)" }}
        aria-hidden
      />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <Badge variant="outline" className="self-start text-[10px] uppercase tracking-wider">
          {project.client ? (
            <HighlightText text={project.client} query={highlight} />
          ) : (
            fallbackBadge
          )}
        </Badge>
        <h3 className="text-lg font-semibold leading-snug text-brand-deep transition-colors group-hover/proj:text-brand-accent dark:text-foreground">
          <HighlightText text={project.title} query={highlight} />
        </h3>
        <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
          <HighlightText text={project.summary} query={highlight} />
        </p>
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-medium text-brand-deep opacity-0 transition-all duration-300 group-hover/proj:translate-x-1 group-hover/proj:opacity-100 dark:text-foreground">
          {viewProjectLabel}
          <ArrowRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
