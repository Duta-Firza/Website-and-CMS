import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import createIntlMiddleware from "next-intl/middleware";
import authConfig from "./auth.config";
import { routing } from "./i18n/routing";

const intl = createIntlMiddleware(routing);
const { auth: withAuth } = NextAuth(authConfig);

// Matches "/id/admin/..." or "/en/admin/..." but NOT "/id/admin/login" or "/en/admin/login".
const ADMIN_PROTECTED = /^\/(id|en)\/admin(?!\/login(?:$|\/))/;

export default withAuth((req) => {
  const pathname = req.nextUrl.pathname;
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
