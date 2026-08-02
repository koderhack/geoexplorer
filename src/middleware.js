import { NextResponse } from "next/server";
import { matchAcceptLanguage } from "./lib/i18n";

export function middleware(request) {
  if (request.cookies.has("locale")) {
    return NextResponse.next();
  }

  const acceptLanguage = request.headers.get("accept-language") || "";
  const locale = matchAcceptLanguage(acceptLanguage);

  const response = NextResponse.next();
  response.cookies.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  response.cookies.set("locale_source", "auto", {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  return response;
}

export const config = {
  runtime: "experimental-edge",
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
