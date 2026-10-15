import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PAGE_PROTECTED_PATHS = [
  "/dashboard",
  "/write",
  "/onboarding",
  "/interview",
  "/tools",
  "/pricing/credits",
];

const API_PROTECTED_PATHS = [
  "/api/payment",
  "/api/referral",
  "/api/user",
  "/api/brand-voice",
  "/api/history",
];

const AUTH_PATHS = ["/login", "/register"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Protected page routes: redirect to login if not authenticated
  const isProtectedPage = PAGE_PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
  );

  if (isProtectedPage && !isLoggedIn) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Protected API routes: return 401 if not authenticated
  const isProtectedApi = API_PROTECTED_PATHS.some(
    (p) => pathname.startsWith(p)
  );

  if (isProtectedApi && !isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Auth pages: redirect to dashboard if already logged in
  if (isLoggedIn && AUTH_PATHS.some((p) => pathname === p)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg|.*\\.ico|api/auth).*)",
  ],
};