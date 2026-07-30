import { type NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import authConfig from "./auth.config";
import { type Locale, routing } from "./i18n/routing";
import { DEV_COOKIE, verifyDevToken } from "./lib/devtools/dev-auth";

const intl = createIntlMiddleware(routing);
const { auth: withAuth } = NextAuth(authConfig);

// Matches "/id/admin/..." or "/en/admin/..." but NOT "/id/admin/login" or "/en/admin/login".
const ADMIN_PROTECTED = /^\/(id|en)\/admin(?!\/login(?:$|\/))/;

// Non-localised dev area, gated by a separate password (not NextAuth, not intl).
const DEV_AREA = /^\/(devbooks|devtools|devlogin)(?:$|\/)/;

// The old site 301-redirected "/" → "/newsite". Browsers cached that redirect
// permanently, so returning visitors still hit "/newsite" — and next-intl then
// prefixes the stale path to "/id/newsite" / "/en/newsite", which 404 on the
// new site. Match the bare path and both locale-prefixed forms (plus any
// sub-path) so we can rescue those visitors to the locale home.
const NEWSITE = /^\/(?:(id|en)\/)?newsite(?:\/.*)?$/;

// Mirror next-intl's locale negotiation (cookie → Accept-Language → default)
// for the bare "/newsite" case, which carries no locale in the URL.
function preferredLocale(req: NextRequest): Locale {
  const cookie = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookie && routing.locales.includes(cookie as Locale)) return cookie as Locale;
  const accept = req.headers.get("accept-language")?.toLowerCase() ?? "";
  return routing.locales.find((loc) => accept.includes(loc)) ?? routing.defaultLocale;
}

export default withAuth(async (req) => {
  const pathname = req.nextUrl.pathname;

  // Rescue stale "newsite" URLs left over from the old site's cached 301
  // redirect: send them to the locale home instead of a 404. Temporary (307)
  // on purpose — this is a removable rescue hatch, and the bare-path target
  // depends on the visitor's current language.
  const newsiteMatch = pathname.match(NEWSITE);
  if (newsiteMatch) {
    const locale = (newsiteMatch[1] as Locale | undefined) ?? preferredLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    url.search = "";
    return NextResponse.redirect(url);
  }

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
