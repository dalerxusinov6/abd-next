import { NextResponse, type NextRequest } from "next/server";

/*
 * Language routing for the public site.
 *   /…      → Uzbek (rewritten internally to /uz/…)
 *   /ru/…   → Russian, /en/… → English
 *   /uz/…   → redirected to the clean URL without the prefix
 * The language also goes to the root layout as the x-lang header (for <html lang>).
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const seg = pathname.split("/")[1];

  if (seg === "uz") {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  const lang = seg === "ru" || seg === "en" ? seg : "uz";
  const headers = new Headers(req.headers);
  headers.set("x-lang", lang);

  if (lang === "uz") {
    const url = req.nextUrl.clone();
    url.pathname = `/uz${pathname === "/" ? "" : pathname}`;
    return NextResponse.rewrite(url, { request: { headers } });
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // admin, uploads, Next internals and static files (anything with a dot) skip the proxy
  matcher: ["/((?!admin|uploads|_next|img|api|apple-icon|icon|.*\\..*).*)"],
};
