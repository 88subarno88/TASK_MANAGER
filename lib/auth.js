import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET;
const COOKIE_NAME = "tm_session";
const TOKEN_EXPIRY = "7d";

/**
 * Generate a signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
    issuer: "taskmanager",
    audience: "taskmanager-users",
  });
}

/**
 * Verify a JWT token and return payload
 */
export function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "taskmanager",
    audience: "taskmanager-users",
  });
}

/**
 * Set auth cookie with secure flags
 */
export function setAuthCookie(response, token) {
  const isProduction = process.env.NODE_ENV === "production";
  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    "HttpOnly",
    "Path=/",
    `Max-Age=${7 * 24 * 60 * 60}`, // 7 days in seconds
    "SameSite=Strict",
    isProduction ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  response.headers.set("Set-Cookie", cookieOptions);
}

/**
 * Clear auth cookie
 */
export function clearAuthCookie(response) {
  response.headers.set(
    "Set-Cookie",
    `${COOKIE_NAME}=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict`,
  );
}

/**
 * Get current user from request cookies
 */
export function getUserFromRequest(request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const cookiesMap = Object.fromEntries(
    cookieHeader.split(";").map((c) => {
      const [k, ...v] = c.trim().split("=");
      return [k, v.join("=")];
    }),
  );
  const token = cookiesMap[COOKIE_NAME];
  if (!token) return null;

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

/**
 * Middleware auth check - returns user or throws
 */
export function requireAuth(request) {
  const user = getUserFromRequest(request);
  if (!user) {
    throw { status: 401, message: "Authentication required. Please login." };
  }
  return user;
}
