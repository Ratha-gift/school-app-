
import { NextResponse, type NextRequest } from "next/server";
import { TOKEN_COOKIE } from "@/lib/session";

export async function GET(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;

  if (token && (await tokenStillValid(token))) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(TOKEN_COOKIE);
  return response;
}

async function tokenStillValid(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${process.env.API_URL}/me`, {
      headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return true; // Laravel unreachable: keep the cookie, the page will show an error
  }
}
