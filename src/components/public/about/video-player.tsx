interface Props {
  src: string;
  poster?: string;
  className?: string;
  /**
   * When true the video starts playing automatically. Browsers only allow
   * unattended playback when the video is muted, so autoplay implies a muted,
   * looping, inline video; viewers can unmute via the native controls.
   */
  autoplay?: boolean;
}

/**
 * Brand-themed wrapper for an HTML5 `<video>`. Used by the Who We Are page
 * to render the Company Video Profile uploaded by the editor. If `src` is
 * empty (CMS not filled in yet) renders nothing so the section gracefully
 * collapses.
 */
export function VideoPlayer({ src, poster, className, autoplay = false }: Props) {
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
        autoPlay={autoplay}
        muted={autoplay}
        loop={autoplay}
        playsInline={autoplay}
        preload={autoplay ? "auto" : "metadata"}
        className="aspect-video h-auto w-full bg-black"
      />
    </div>
  );
}
