export const getApiUrl = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://api.omenai.app"
    : "http://localhost:8080";
};
export const session_auth_url = (): string => {
  if (process.env.NODE_ENV === "development") {
    return ".omenai.local";
  } else {
    return ".omenai.app";
  }
};
export const login_url = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://auth.omenai.app/login"
    : "http://localhost:4000/login";
};
