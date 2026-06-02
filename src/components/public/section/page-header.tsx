import type { ReactNode } from "react";

interface Props {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Optional tab strip rendered immediately below the header, above page content. */
  tabs?: ReactNode;
}

export function PageHeader({ eyebrow, title, description, tabs }: Props) {
  return (
    <header className="mb-8 border-b pb-6 md:mb-10 md:pb-8">
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-accent">
          {eyebrow}
        </p>
      )}
      <h1 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {tabs && <div className="mt-6">{tabs}</div>}
    </header>
  );
}
