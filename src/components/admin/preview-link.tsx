import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

interface Props {
  /** Absolute path on the public site, e.g. `/en/solutions/trading`. */
  href: string;
  /** Button copy — typically `Admin.buttons.viewPublic` from the parent server
   * component so it can call `getTranslations` directly. */
  label: string;
}

/**
 * "View public page" button used in the admin page header. Opens in a new
 * tab so the editor keeps the form open while previewing.
 */
export function PreviewLink({ href, label }: Props) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className={buttonVariants({ variant: "outline", size: "sm" })}
    >
      <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
      {label}
    </Link>
  );
}
