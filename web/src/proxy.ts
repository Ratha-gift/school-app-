
import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "./lib/session";

export function proxy(request: NextRequest) {
  const hasToken = request.cookies.has(TOKEN_COOKIE);
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!hasToken && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (hasToken && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|session-expired).*)"],
};
