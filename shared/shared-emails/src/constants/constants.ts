// Email template constants for consistent branding and styling
export const COMPANY_INFO = {
  name: "Omenai",
  logo: "https://fra.cloud.appwrite.io/v1/storage/buckets/68d2931900387c9110e6/files/696ee3b60025e2a2c4ff/view?project=682272b1001e9d1609a8",
  address: "123 Main Street Anytown, CA 12345",
  email: "contact@omenai.net",
  phone: "+123456789",
  website: "www.omenai.net",
} as const;

export const EMAIL_COLORS = {
  primary: "#0f172a",
  background: "#ffffff",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    400: "#9ca3af",
    600: "#4b5563",
  },
  link: "#1e40af",
  error: "#dc2626",
  success: "#059669",
  warning: "#d97706",
} as const;

export const EMAIL_STYLES = {
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    backgroundColor: EMAIL_COLORS.background,
  },
  text: {
    base: {
      color: EMAIL_COLORS.primary,
      fontSize: "16px",
      lineHeight: "1.6",
      marginBottom: "16px",
    },
    small: {
      color: EMAIL_COLORS.gray[600],
      fontSize: "14px",
      lineHeight: "1.5",
    },
    tiny: {
      color: EMAIL_COLORS.gray[600],
      fontSize: "12px",
      lineHeight: "1.5",
    },
  },
  heading: {
    h1: {
      color: EMAIL_COLORS.primary,
      fontSize: "24px",
      fontWeight: "600",
      marginBottom: "32px",
      textAlign: "center" as const,
    },
    h2: {
      color: EMAIL_COLORS.primary,
      fontSize: "20px",
      fontWeight: "600",
      marginBottom: "24px",
    },
  },
  button: {
    primary: {
      backgroundColor: EMAIL_COLORS.primary,
      color: EMAIL_COLORS.background,
      padding: "16px 32px",
      borderRadius: "8px",
      textDecoration: "none",
      display: "inline-block",
      fontWeight: "500",
    },
    secondary: {
      backgroundColor: EMAIL_COLORS.gray[200],
      color: EMAIL_COLORS.primary,
      padding: "12px 24px",
      borderRadius: "8px",
      textDecoration: "none",
      display: "inline-block",
      fontWeight: "500",
    },
  },
  link: {
    color: EMAIL_COLORS.link,
    textDecoration: "underline",
  },
} as const;

export const EMAIL_SIGNATURES = {
  default: {
    name: "Moses",
    title: "Customer Success Team",
    company: COMPANY_INFO.name,
  },
  support: {
    name: "Support Team",
    title: "Customer Support",
    company: COMPANY_INFO.name,
  },
} as const;
