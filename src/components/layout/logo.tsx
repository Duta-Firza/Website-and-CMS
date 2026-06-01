import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
  /** Tailwind height class (defaults to h-8). Width auto-derives from intrinsic aspect ratio. */
  className?: string;
  /** Strip color for use on dark surfaces (footer, login eyebrow). */
  variant?: "default" | "on-dark";
}

const LOGO_INTRINSIC = { width: 2052, height: 952 } as const;

export function Logo({ className, variant = "default" }: Props) {
  return (
    <Image
      src="/images/logos/df-logo.png"
      alt="PT Duta Firza"
      width={LOGO_INTRINSIC.width}
      height={LOGO_INTRINSIC.height}
      priority
      sizes="(max-width: 768px) 120px, 160px"
      className={cn(
        "h-8 w-auto select-none",
        variant === "on-dark" && "brightness-0 invert",
        className,
      )}
    />
  );
}
