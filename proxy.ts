import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute = ["/checkout", "/mi-cuenta", "/pedidos"].some((p) =>
    pathname.startsWith(p)
  );

  if (!session && (isAdminRoute || isProtectedRoute)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (session && isAdminRoute && session.user.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (session && pathname.startsWith("/checkout") && (session.user as any).status === "PENDING") {
    return NextResponse.redirect(new URL("/mi-cuenta", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/checkout/:path*", "/mi-cuenta/:path*", "/pedidos/:path*"],
};
