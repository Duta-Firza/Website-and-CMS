import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations("Common");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row">
        <p>
          &copy; {year} {t("companyName")}. All rights reserved.
        </p>
        <p>Bakrie Tower 18th Floor, Jakarta Selatan</p>
      </div>
    </footer>
  );
}
