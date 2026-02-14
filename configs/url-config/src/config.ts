export const getApiUrl = (): string => {
  if (process.env.APP_ENV === "production") {
    return "https://api.omenai.app";
  } else {
    return process.env.NODE_ENV === "production"
      ? "https://staging.api.omenai.app"
      : "http://localhost:8001";
  }
};
export const session_auth_url = (): string => {
  if (process.env.NODE_ENV === "development") {
    return ".omenai.local";
  } else {
    return ".omenai.app";
  }
};
export const auth_uri = (): string => {
  if (process.env.APP_ENV === "production") {
    return "https://auth.omenai.app";
  } else
    return process.env.NODE_ENV === "production"
      ? "https://staging.auth.omenai.app"
      : "http://localhost:4000";
};

export const dashboard_url = (): string => {
  if (process.env.APP_ENV === "production") {
    return "https://dashboard.omenai.app";
  } else
    return process.env.NODE_ENV === "production"
      ? "https://staging.dashboard.omenai.app"
      : "http://localhost:5000";
};

export const base_url = (): string => {
  if (process.env.APP_ENV === "production") {
    return "https://omenai.app";
  } else
    return process.env.NODE_ENV === "production"
      ? "https://staging.omenai.app"
      : "http://localhost:3000";
};
export const admin_url = (): string => {
  if (process.env.APP_ENV === "production") {
    return "https://admin.omenai.app";
  } else
    return process.env.NODE_ENV === "production"
      ? "https://staging.admin.omenai.app"
      : "http://localhost:3001";
};

export const tracking_url = (): string => {
  if (process.env.APP_ENV === "production") {
    return "https://tracking.omenai.app";
  } else
    return process.env.NODE_ENV === "production"
      ? "https://staging.tracking.omenai.app"
      : "http://localhost:3002";
};
