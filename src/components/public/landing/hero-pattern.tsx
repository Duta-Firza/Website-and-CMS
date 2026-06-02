/**
 * Decorative overlay for the landing hero. Layered above the photo (when one
 * exists) and the gradient backdrop (when it doesn't), beneath the text content.
 *
 *   1. Subtle dot-grid tile pattern — gives the surface a technical-drawing
 *      feel without competing with copy
 *   2. Diagonal accent lines in the top-right corner — reads as engineering
 *      blueprint hatching, identitas industrial
 *   3. A brand-accent vertical bar near the bottom-left — anchors the visual
 *      hierarchy and re-asserts the brand color even when the photo is plain
 */
export function HeroPattern() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* 1. Dot grid tile */}
      <svg
        aria-hidden
        className="absolute inset-0 h-full w-full text-white/[0.06]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id="hero-dot-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="1" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dot-grid)" />
      </svg>

      {/* 2. Diagonal accent hatching at top-right (technical-drawing feel) */}
      <svg
        aria-hidden
        viewBox="0 0 200 200"
        className="absolute -top-10 right-0 h-72 w-72 text-white/[0.08]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g stroke="currentColor" strokeWidth="1.5">
          <line x1="0" y1="40" x2="200" y2="-160" />
          <line x1="0" y1="80" x2="200" y2="-120" />
          <line x1="0" y1="120" x2="200" y2="-80" />
          <line x1="0" y1="160" x2="200" y2="-40" />
          <line x1="0" y1="200" x2="200" y2="0" />
          <line x1="40" y1="200" x2="200" y2="40" />
          <line x1="80" y1="200" x2="200" y2="80" />
        </g>
      </svg>

      {/* 3. Brand-accent vertical bar near bottom-left */}
      <span className="absolute bottom-12 left-0 h-32 w-1 bg-brand-accent md:bottom-16 md:left-2 md:h-40" />
    </div>
  );
}
