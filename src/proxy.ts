import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import authConfig from "./auth.config";
import { routing } from "./i18n/routing";
import { DEV_COOKIE, verifyDevToken } from "./lib/devtools/dev-auth";

const intl = createIntlMiddleware(routing);
const { auth: withAuth } = NextAuth(authConfig);

// Matches "/id/admin/..." or "/en/admin/..." but NOT "/id/admin/login" or "/en/admin/login".
const ADMIN_PROTECTED = /^\/(id|en)\/admin(?!\/login(?:$|\/))/;

// Non-localised dev area, gated by a separate password (not NextAuth, not intl).
const DEV_AREA = /^\/(devbooks|devtools|devlogin)(?:$|\/)/;

export default withAuth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Dev area: own password gate; must bypass next-intl so it is never rewritten
  // to /id/... or /en/....
  if (DEV_AREA.test(pathname)) {
    const raw = req.cookies.get(DEV_COOKIE)?.value;
    const authed = await verifyDevToken(raw);
    const isLogin = pathname === "/devlogin" || pathname.startsWith("/devlogin/");

    if (isLogin) {
      if (authed) {
        // Already signed in — send to the requested target or the hub.
        const url = req.nextUrl.clone();
        const from = req.nextUrl.searchParams.get("from");
        url.pathname =
          from && DEV_AREA.test(from) && !from.startsWith("/devlogin") ? from : "/devbooks";
        url.search = "";
        return NextResponse.redirect(url);
      }
      return NextResponse.next();
    }

    if (!authed) {
      const url = req.nextUrl.clone();
      url.pathname = "/devlogin";
      url.search = "";
      url.searchParams.set("from", pathname);
      if (raw) url.searchParams.set("reason", "expired"); // had a cookie → it expired/was tampered
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const adminMatch = pathname.match(ADMIN_PROTECTED);
  if (adminMatch && !req.auth) {
    const locale = adminMatch[1];
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}/admin/login`;
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  return intl(req);
});

export const config = {
  // Match everything except api, _next, _vercel, and static files
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
