"use client";

import { ChevronUp } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Floating "TOP" button that appears after the user has scrolled past one
 * viewport height. Click smooth-scrolls back to the top. Mono label gives
 * the same technical-drawing detail as the section index marks.
 */
export function ScrollToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={cn(
        "fixed bottom-6 right-6 z-40 flex h-12 w-12 flex-col items-center justify-center rounded-full border bg-background/80 text-brand-deep shadow-md backdrop-blur transition-all duration-300 hover:bg-background hover:shadow-lg dark:text-foreground",
        show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
      )}
    >
      <span className="font-mono text-[8px] font-semibold tracking-wider text-brand-deep/60 dark:text-foreground/60">
        TOP
      </span>
      <ChevronUp className="h-4 w-4" />
    </button>
  );
}
