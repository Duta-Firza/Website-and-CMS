"use client";

import { useEffect } from "react";

/**
 * Keeps `<html lang>` in sync with the active locale on the client.
 *
 * The root layout owns the `<html>` element and sets `lang` statically to the
 * default locale. This component runs inside the `[locale]` subtree and patches
 * the attribute after hydration whenever the URL locale differs — without
 * forcing the ThemeProvider above us to remount on every locale switch (which
 * would trip React 19's "<script> rendered on the client" warning from
 * next-themes' inline no-FOUC script).
 */
export function LangSync({ locale }: { locale: string }) {
  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = locale;
    }
  }, [locale]);
  return null;
}
