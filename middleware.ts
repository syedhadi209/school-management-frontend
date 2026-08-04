import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/school-admin", "/manager", "/teacher", "/parent", "/super-admin"];
const rolePrefixMap: Record<string, string> = {
  super_admin: "/super-admin",
  manager: "/manager",
  teacher: "/teacher",
  parent: "/parent",
  school_admin: "/school-admin",
  accountant: "/school-admin",
  front_desk: "/school-admin",
  student: "/parent",
};

function decodeRole(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString("utf8")) as {
      role?: string;
    };
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const accessToken = request.cookies.get("access_token")?.value;
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected && !accessToken) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (!accessToken) return NextResponse.next();
  const role = decodeRole(accessToken);
  if (!role) return NextResponse.next();
  const allowedPrefix = rolePrefixMap[role] ?? "/school-admin";

  if (
    pathname.startsWith("/school-admin") ||
    pathname.startsWith("/manager") ||
    pathname.startsWith("/teacher") ||
    pathname.startsWith("/parent") ||
    pathname.startsWith("/super-admin")
  ) {
    if (!pathname.startsWith(allowedPrefix)) {
      return NextResponse.redirect(new URL(allowedPrefix, request.url));
    }
  }

  if (pathname === "/auth/login" || pathname === "/auth/register") {
    return NextResponse.redirect(new URL(allowedPrefix, request.url));
  }

  // Logged-in users hitting the public landing page go to their portal dashboard.
  if (pathname === "/") {
    return NextResponse.redirect(new URL(allowedPrefix, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

