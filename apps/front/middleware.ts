import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { HOME_BY_ROLE } from "./lib/config";

/**
 * Contrôle d'accès (BNF05) : il faut être connecté pour /admin et /ouvrier,
 * et chaque espace est réservé à son rôle.
 */
export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const { pathname } = req.nextUrl;
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL(HOME_BY_ROLE.OUVRIER, req.url));
    }
    if (pathname.startsWith("/ouvrier") && role !== "OUVRIER") {
      return NextResponse.redirect(new URL(HOME_BY_ROLE.ADMIN, req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: { authorized: ({ token }) => !!token },
    pages: { signIn: "/" },
  },
);

export const config = { matcher: ["/admin/:path*", "/ouvrier/:path*"] };
