// Settings for the cookie that holds the Laravel (Sanctum) token.

export const TOKEN_COOKIE = "admin_token";

export const tokenCookieOptions = {
  httpOnly: true, // JavaScript in the browser can't read it (protects against XSS)
  sameSite: "lax" as const, // not sent on cross-site POSTs (protects against CSRF)
  secure: process.env.NODE_ENV === "production", // HTTPS only in production
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
