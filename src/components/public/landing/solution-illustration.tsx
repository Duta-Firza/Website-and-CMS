"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// `lottie-react` is heavy + only needed when a JSON file is actually present
// in /public/animations/solutions/. Dynamic + ssr:false keeps it out of the
// initial landing bundle when the editor hasn't uploaded the Lottie assets yet.
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

interface Props {
  solutionKey: string;
  /** True once the card has entered the viewport — drives both Lottie autoplay
   *  and the SVG fallback's `.is-playing` class that runs the pop-in keyframes. */
  playing: boolean;
  /** Increments on hover so the Lottie component remounts (cheapest way to
   *  restart playback from frame 0); SVG fallback uses it as a key too so the
   *  pop-in keyframes restart from the beginning. */
  hoverKey: number;
}

export function SolutionIllustration({ solutionKey, playing, hoverKey }: Props) {
  const [animationData, setAnimationData] = useState<object | null>(null);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (tried) return;
    let cancelled = false;
    fetch(`/animations/solutions/${solutionKey}.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (cancelled) return;
        if (data) setAnimationData(data);
        setTried(true);
      })
      .catch(() => {
        if (!cancelled) setTried(true);
      });
    return () => {
      cancelled = true;
    };
  }, [solutionKey, tried]);

  if (animationData) {
    return (
      <Lottie
        key={`${solutionKey}-${hoverKey}`}
        animationData={animationData}
        loop={false}
        autoplay={playing}
        className="h-full w-full"
      />
    );
  }

  return (
    <div
      key={`fallback-${solutionKey}-${hoverKey}`}
      className={cn(
        "relative flex h-full w-full items-center justify-center",
        playing && "is-playing",
      )}
    >
      {solutionKey === "trading" && <TradingIllustration />}
      {solutionKey === "manufacturing" && <ManufacturingIllustration />}
      {solutionKey === "epc" && <EpcIllustration />}
    </div>
  );
}

// ─── Line-art SVG illustrations ──────────────────────────────────────────────
//
// Stroke-based compositions evoking a technical-drawing / blueprint feel,
// pairing two related subjects per solution. All three share the same
// architectural rhythm: a horizontal ground line at the bottom and one or
// more rectilinear structures rising vertically from it.
//   - Trading       → Stacked shipping containers + ascending bar chart
//   - Manufacturing → Factory (pitched roof + chimney + smoke) + safety helmet
//   - EPC           → Tower crane + cog/gear
//
// Main strokes use `text-brand-deep` via currentColor; the accent stroke uses
// `--brand-accent` to keep the brand presence even in line form.
// CSS classes `anim-pop` + `:nth-of-type` delays in globals.css stagger a
// fade+slide pop-in once an `.is-playing` ancestor toggles on.

const svgProps = {
  viewBox: "0 0 200 200",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-full w-auto text-brand-deep dark:text-foreground",
  "aria-hidden": true,
};

function TradingIllustration() {
  return (
    <svg {...svgProps}>
      {/* Ground line */}
      <g className="anim-pop">
        <path d="M10 178 H 190" />
      </g>

      {/* Stacked shipping containers */}
      <g className="anim-pop">
        {/* Bottom row — two containers side by side */}
        <path d="M14 178 V 144 H 60 V 178 Z" />
        <path d="M60 178 V 144 H 106 V 178 Z" />
        {/* Top container stacked on the left */}
        <path d="M14 144 V 110 H 60 V 144 Z" />
        {/* Corrugated panel ribs — bottom row */}
        <path d="M26 150 V 172" />
        <path d="M37 150 V 172" />
        <path d="M48 150 V 172" />
        <path d="M72 150 V 172" />
        <path d="M83 150 V 172" />
        <path d="M94 150 V 172" />
        {/* Corrugated panel ribs — top container */}
        <path d="M26 116 V 138" />
        <path d="M37 116 V 138" />
        <path d="M48 116 V 138" />
      </g>

      {/* Ascending bar chart (accent) — rises from the same ground line */}
      <g className="anim-pop" stroke="var(--brand-accent)">
        <path d="M118 178 V 156 H 132 V 178" />
        <path d="M138 178 V 140 H 152 V 178" />
        <path d="M158 178 V 120 H 172 V 178" />
        <path d="M178 178 V 96 H 192 V 178" />
      </g>

      {/* Trending arrow above the bars (accent) */}
      <g className="anim-pop" stroke="var(--brand-accent)">
        <path d="M122 148 L 186 86" />
        <path d="M186 86 L 176 86 M 186 86 L 186 96" />
      </g>
    </svg>
  );
}

function ManufacturingIllustration() {
  return (
    <svg {...svgProps}>
      {/* Safety helmet (accent) — upper-left */}
      <g className="anim-pop" stroke="var(--brand-accent)">
        {/* Dome */}
        <path d="M14 52 Q 14 16 48 16 Q 82 16 82 52" />
        {/* Brim */}
        <path d="M8 52 H 88" />
        {/* Front ridge */}
        <path d="M48 16 V 52" />
        {/* Side facets */}
        <path d="M28 22 V 52" />
        <path d="M68 22 V 52" />
      </g>

      {/* Factory body */}
      <g className="anim-pop">
        {/* Ground line */}
        <path d="M10 178 H 190" />
        {/* Walls */}
        <path d="M30 178 V 110 H 138 V 178" />
        {/* Pitched roof */}
        <path d="M22 110 L 84 72 L 146 110" />
        {/* Door */}
        <path d="M74 178 V 142 H 94 V 178" />
        {/* Windows — front-left pair */}
        <rect x="42" y="124" width="14" height="14" />
        <rect x="42" y="152" width="14" height="14" />
        {/* Windows — front-right pair */}
        <rect x="112" y="124" width="14" height="14" />
        <rect x="112" y="152" width="14" height="14" />
        {/* Chimney */}
        <path d="M158 178 V 80 H 178 V 178" />
        {/* Chimney rim */}
        <path d="M154 80 H 182" />
      </g>

      {/* Smoke puffs */}
      <g className="anim-pop" opacity="0.45">
        <path d="M165 72 Q 158 64 166 58 Q 174 50 170 40" />
        <path d="M176 72 Q 182 64 178 56" />
      </g>
    </svg>
  );
}

function EpcIllustration() {
  return (
    <svg {...svgProps}>
      {/* Ground line */}
      <g className="anim-pop">
        <path d="M10 178 H 190" />
      </g>

      {/* Tower crane silhouette */}
      <g className="anim-pop">
        {/* Mast — two vertical rails */}
        <path d="M70 178 V 58" />
        <path d="M88 178 V 58" />
        {/* X-bracing (zigzag) */}
        <path d="M70 68 L 88 78 L 70 88 L 88 98 L 70 108 L 88 118 L 70 128 L 88 138 L 70 148 L 88 158 L 70 168" />
        {/* Splay base */}
        <path d="M58 178 L 70 168" />
        <path d="M100 178 L 88 168" />
        {/* Operator cabin */}
        <path d="M60 58 H 98 V 44 H 60 Z" />
        {/* Counter-jib (left) */}
        <path d="M28 44 H 60" />
        <path d="M28 50 H 60" />
        {/* Counterweight block */}
        <path d="M28 44 V 56 H 40 V 44" />
        {/* Main jib (right) — longer */}
        <path d="M98 44 H 168" />
        <path d="M98 50 H 168" />
        {/* Jib triangulation */}
        <path d="M106 44 L 114 50 L 122 44 L 130 50 L 138 44 L 146 50 L 154 44 L 162 50" />
        {/* Hoist cable + hook block */}
        <path d="M144 50 V 102" />
        <path d="M138 102 H 150 V 112 H 138 Z" />
      </g>

      {/* Gear (accent) — bottom-right */}
      <g className="anim-pop" stroke="var(--brand-accent)">
        {/* 8-tooth gear silhouette at (160, 146) */}
        <path
          d="M160 124 L 165 134 L 176 130 L 173 141 L 183 146 L 173 151 L 176 162 L 165 158 L 160 168 L 155 158 L 144 162 L 147 151 L 137 146 L 147 141 L 144 130 L 155 134 Z"
          strokeLinejoin="miter"
        />
        {/* Hub ring */}
        <circle cx="160" cy="146" r="7" />
        {/* Center pin */}
        <circle cx="160" cy="146" r="2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
