import { NextResponse } from "next/server";

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("tm_session")?.value;

  if (pathname.startsWith("/dashboard") && !token) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
