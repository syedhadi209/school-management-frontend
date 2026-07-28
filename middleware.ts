import { NextRequest, NextResponse } from "next/server";

const protectedPrefixes = ["/school-admin", "/manager", "/teacher", "/parent", "/super-admin"];

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

  if (pathname === "/auth/login" || pathname === "/auth/register") {
    const destination =
      role === "super_admin"
        ? "/super-admin"
        : role === "manager"
          ? "/manager"
          : role === "teacher"
            ? "/teacher"
            : role === "parent"
              ? "/parent"
              : "/school-admin";
    return NextResponse.redirect(new URL(destination, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

