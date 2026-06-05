import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  eyebrow: string;
  title: string;
  description: string;
  homeCta: string;
  contactCta: string;
  locale: string;
}

/**
 * Body of the 404 page. Lives in its own component so both
 * `app/[locale]/not-found.tsx` (the one Next.js renders inside the locale
 * subtree) and `app/not-found.tsx` (the root fallback for cases where the
 * locale layout itself failed) share exactly the same UI.
 */
export function NotFoundContent({
  eyebrow,
  title,
  description,
  homeCta,
  contactCta,
  locale,
}: Props) {
  return (
    <div className="container mx-auto flex min-h-[calc(100svh-4rem)] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-brand-accent">
        {eyebrow}
      </p>
      <NotFoundIllustration />
      <div className="max-w-lg space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-deep dark:text-foreground md:text-4xl">
          {title}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href={`/${locale}`} className={buttonVariants({ size: "lg" })}>
          {homeCta}
        </Link>
        {/* <Link
          href={`/${locale}/contact`}
          className={buttonVariants({ variant: "outline", size: "lg" })}
        >
          {contactCta}
        </Link> */}
      </div>
    </div>
  );
}

function NotFoundIllustration() {
  return (
    <svg
      viewBox="0 0 320 140"
      fill="none"
      stroke="currentColor"
      strokeWidth={6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-auto w-full max-w-100 text-brand-deep dark:text-foreground"
      role="img"
      aria-label="404"
    >
      <title>404</title>
      {/* Top dimension bar */}
      <g strokeWidth="1.5" opacity="0.35">
        <line x1="20" y1="14" x2="300" y2="14" />
        <line x1="20" y1="8" x2="20" y2="20" />
        <line x1="300" y1="8" x2="300" y2="20" />
      </g>
      {/* "4" */}
      <path d="M 30 40 L 30 80 L 80 80" />
      <line x1="68" y1="30" x2="68" y2="120" />
      {/* "0" with brand-accent crosshair */}
      <ellipse cx="160" cy="75" rx="32" ry="45" />
      <g stroke="var(--brand-accent)" strokeWidth="3">
        <line x1="138" y1="75" x2="182" y2="75" />
        <line x1="160" y1="53" x2="160" y2="97" />
        <circle cx="160" cy="75" r="4" fill="var(--brand-accent)" />
      </g>
      {/* "4" */}
      <path d="M 220 40 L 220 80 L 270 80" />
      <line x1="258" y1="30" x2="258" y2="120" />
      {/* Bottom dimension bar */}
      <g strokeWidth="1.5" opacity="0.35">
        <line x1="20" y1="136" x2="300" y2="136" />
        <line x1="20" y1="130" x2="20" y2="142" />
        <line x1="300" y1="130" x2="300" y2="142" />
      </g>
    </svg>
  );
}
