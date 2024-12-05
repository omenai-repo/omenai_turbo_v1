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
