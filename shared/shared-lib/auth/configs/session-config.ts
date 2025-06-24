export const sessionOptions = {
  cookieName: "omenai_session", // A unique name for your cookie
  password: process.env.SECRET_COOKIE_PASSWORD as string, // A long, secret password. STORE THIS IN ENV VARS
  cookieOptions: {
    domain: process.env.NODE_ENV === "production" ? ".omenai.app" : "localhost",
    path: "/",
    secure: process.env.NODE_ENV === "production", // Only send cookie over HTTPS in production
    httpOnly: true, // Prevents client-side JS from accessing the cookie
    sameSite: "lax" as "lax", // CSRF protection
    maxAge: 60 * 60 * 24, // 24 hours
  },
};
