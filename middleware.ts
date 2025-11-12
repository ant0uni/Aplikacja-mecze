import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const publicPaths = ["/", "/login", "/register"];
const protectedPaths = ["/auth", "/profile"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookie
  const token = request.cookies.get("auth-token")?.value;

  // Check if current path is public
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

  // Add security headers
  const response = NextResponse.next();
  
  // Security headers for production
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  return response;
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
