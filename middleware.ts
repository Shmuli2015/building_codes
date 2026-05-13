import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.ADMIN_PASSWORD || "default-secret-change-me"
);

const COOKIE_NAME = "auth_session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;


  if (
    pathname === "/login" ||
    pathname.startsWith("/api/") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error("JWT verify failed", err);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: [

    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
