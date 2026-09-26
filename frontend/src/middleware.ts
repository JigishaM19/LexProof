import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper to decode JWT payload safely in Next.js Edge runtime
function parseJwtPayload(token: string): { role?: string; exp?: number; sub?: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  const isIndividualRoute = pathname === "/individual" || pathname.startsWith("/individual/");
  const isOrganizationRoute = pathname === "/organization" || pathname.startsWith("/organization/");
  const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isCasesRoute = pathname === "/cases" || pathname.startsWith("/cases/");

  const isProtectedRoute = isIndividualRoute || isOrganizationRoute || isDashboardRoute || isCasesRoute;

  if (isProtectedRoute) {
    const token = request.cookies.get("LexProof_token")?.value;

    // 1. Unauthenticated: Redirect to login with intended destination
    if (!token || token.trim() === "") {
      const loginUrl = new URL("/login", request.url);
      const fullRedirectPath = search ? `${pathname}${search}` : pathname;
      loginUrl.searchParams.set("redirect", fullRedirectPath);
      return NextResponse.redirect(loginUrl);
    }

    const payload = parseJwtPayload(token);

    // If token is invalid or expired, clear cookie and redirect to login
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("LexProof_token");
      return response;
    }

    const role = (payload.role || "INDIVIDUAL").toUpperCase();

    // 2. Legacy /dashboard redirect based on real account role
    if (isDashboardRoute) {
      const targetWorkspace = role === "ORGANIZATION" ? "/organization" : "/individual";
      return NextResponse.redirect(new URL(targetWorkspace, request.url));
    }

    // 3. Strict Workspace Authorization:
    // Individual account cannot access Organization workspace
    if (isOrganizationRoute && role !== "ORGANIZATION") {
      return NextResponse.redirect(new URL("/individual", request.url));
    }

    // Organization account cannot access Individual workspace
    if (isIndividualRoute && role === "ORGANIZATION") {
      return NextResponse.redirect(new URL("/organization", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/individual/:path*",
    "/organization/:path*",
    "/dashboard/:path*",
    "/cases/:path*",
  ],
};
