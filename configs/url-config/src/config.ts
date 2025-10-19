export const getApiUrl = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://api.omenai.app"
    : "http://localhost:8001";
};
export const session_auth_url = (): string => {
  if (process.env.NODE_ENV === "development") {
    return ".omenai.local";
  } else {
    return ".omenai.app";
  }
};
export const auth_uri = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://auth.omenai.app"
    : "http://localhost:4000";
};

export const dashboard_url = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://dashboard.omenai.app"
    : "http://localhost:5000";
};

export const base_url = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://omenai.app"
    : "http://localhost:3000";
};
export const admin_url = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://admin.omenai.app"
    : "http://localhost:3001";
};

export const tracking_url = (): string => {
  return process.env.NODE_ENV === "production"
    ? "https://tracking.omenai.app"
    : "http://localhost:3002";
};
