interface Props {
  src: string;
  poster?: string;
  className?: string;
}

/**
 * Brand-themed wrapper for an HTML5 `<video>`. Used by the Who We Are page
 * to render the Company Video Profile uploaded by the editor. If `src` is
 * empty (CMS not filled in yet) renders nothing so the section gracefully
 * collapses.
 */
export function VideoPlayer({ src, poster, className }: Props) {
  if (!src) return null;
  return (
    <div
      className={`relative overflow-hidden rounded-xl border bg-brand-deep shadow-sm ${
        className ?? ""
      }`}
    >
      {/* biome-ignore lint/a11y/useMediaCaption: editor uploads raw mp4 — no caption track available */}
      <video
        src={src}
        poster={poster}
        controls
        preload="metadata"
        className="aspect-video h-auto w-full bg-black"
      />
    </div>
  );
}
