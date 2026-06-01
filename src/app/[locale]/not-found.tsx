import Link from "next/link";
import { useLocale } from "next-intl";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  const locale = useLocale();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">Page not found.</p>
      <Link href={`/${locale}`} className={buttonVariants()}>
        Back to home
      </Link>
    </div>
  );
}
