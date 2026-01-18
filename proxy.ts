import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";

const openRoutes = ["/admin/login"];

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const pathname = request.nextUrl.pathname;

  const role = session?.user.role;
  const isAdminRole = role === "admin";
  const isDashboardRoute = pathname.startsWith("/admin");

  // THIS IS NOT SECURE!
  // This is the recommended approach to optimistically redirect users
  // We recommend handling auth checks in each page/route
  if (!session && isDashboardRoute && !openRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  if (session && isAdminRole && openRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)",
  ], // Specify the routes the middleware applies to
};
