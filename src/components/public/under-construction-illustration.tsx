/**
 * Static line-art SVG used on every "under construction" placeholder page.
 * A blueprint sheet (title block, faint grid, sketched plan + dimensions) sits
 * behind a brand-accent drafting compass drawing a dashed arc — the
 * "design-in-progress" metaphor for a page that's not done yet.
 */
export function UnderConstructionIllustration() {
  return (
    <svg
      viewBox="0 0 240 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-auto w-full max-w-70 text-brand-deep dark:text-foreground"
      aria-hidden
    >
      {/* Blueprint sheet outline */}
      <rect x="32" y="30" width="176" height="148" rx="3" />
      {/* Title block (top strip + divider) */}
      <line x1="32" y1="54" x2="208" y2="54" />
      <line x1="156" y1="30" x2="156" y2="54" />
      {/* Faint grid */}
      <g opacity="0.25">
        <line x1="32" y1="74" x2="208" y2="74" />
        <line x1="32" y1="94" x2="208" y2="94" />
        <line x1="32" y1="114" x2="208" y2="114" />
        <line x1="32" y1="134" x2="208" y2="134" />
        <line x1="32" y1="154" x2="208" y2="154" />
        <line x1="52" y1="54" x2="52" y2="178" />
        <line x1="72" y1="54" x2="72" y2="178" />
        <line x1="92" y1="54" x2="92" y2="178" />
        <line x1="112" y1="54" x2="112" y2="178" />
        <line x1="132" y1="54" x2="132" y2="178" />
        <line x1="152" y1="54" x2="152" y2="178" />
        <line x1="172" y1="54" x2="172" y2="178" />
        <line x1="192" y1="54" x2="192" y2="178" />
      </g>
      {/* Sketched plan rectangle with dimension marks below */}
      <g>
        <rect x="60" y="98" width="80" height="56" />
        <line x1="60" y1="166" x2="140" y2="166" />
        <line x1="60" y1="162" x2="60" y2="170" />
        <line x1="140" y1="162" x2="140" y2="170" />
      </g>
      {/* Drafting compass — accent, drawing a dashed arc */}
      <g stroke="var(--brand-accent)" strokeWidth="2.5">
        <circle cx="160" cy="78" r="3" fill="var(--brand-accent)" />
        <line x1="160" y1="78" x2="138" y2="138" />
        <line x1="160" y1="78" x2="182" y2="138" />
        <line x1="180" y1="136" x2="184" y2="142" />
        <path d="M 138 138 A 24 24 0 0 1 182 138" strokeDasharray="4 3" />
      </g>
    </svg>
  );
}
