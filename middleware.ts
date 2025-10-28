import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/", "/login", "/register"];
const protectedPaths = ["/auth"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // Check if current path is public
  const isPublicPath = publicPaths.some((path) => pathname === path || pathname.startsWith(path));
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));

  // If no token and trying to access protected route, redirect to login
  if (!token && isProtectedPath) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If token exists, verify it
  if (token) {
    const payload = await verifyToken(token);

    // If token is invalid and trying to access protected route
    if (!payload && isProtectedPath) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("auth-token");
      return response;
    }

    // If logged in and trying to access login/register, redirect to dashboard
    if (payload && (pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/auth/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
