import type { ReactNode } from "react";

interface Props {
  title: string;
  description?: string;
  /** Rendered inline beside the page title (e.g. View Public Page link). */
  titleAction?: ReactNode;
  /** Rendered far-right of the header row for primary page-level actions. */
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, titleAction, actions }: Props) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 border-b pb-4">
      <div className="min-w-0 space-y-1">
        <span className="mb-3 block h-0.75 w-10 bg-brand-accent" aria-hidden />
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-brand-deep dark:text-foreground">
            {title}
          </h1>
          {titleAction}
        </div>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
