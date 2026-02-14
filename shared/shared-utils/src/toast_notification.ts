import { createElement } from "react";
import { toast } from "sonner";

// Helper to generate SVG icons without using JSX syntax
const createSvgIcon = (color: string, pathOps: any[]) => {
  return createElement(
    "svg",
    {
      width: 20,
      height: 20,
      viewBox: "0 0 24 24",
      fill: "none",
      stroke: color,
      strokeWidth: 2,
      strokeLinecap: "square", // Square caps for the "boxy" aesthetic
      strokeLinejoin: "miter",
    },
    ...pathOps
  );
};

export const toast_notif = (
  message: string,
  type: "success" | "error" | "info"
) => {
  // 1. Configuration for the "Boxy" look
  const configs = {
    success: {
      label: "Success",
      color: "#10b981", // Emerald 500
      // SVG: Polyline checkmark
      icon: createSvgIcon("#10b981", [
        createElement("polyline", { points: "20 6 9 17 4 12" }),
      ]),
    },
    error: {
      label: "Error",
      color: "#ef4444", // Red 500
      // SVG: X symbol
      icon: createSvgIcon("#ef4444", [
        createElement("line", { x1: "18", y1: "6", x2: "6", y2: "18" }),
        createElement("line", { x1: "6", y1: "6", x2: "18", y2: "18" }),
      ]),
    },
    info: {
      label: "Information",
      color: "#3b82f6", // Blue 500
      // SVG: Info 'i'
      icon: createSvgIcon("#3b82f6", [
        createElement("circle", { cx: "12", cy: "12", r: "10" }),
        createElement("line", { x1: "12", y1: "16", x2: "12", y2: "12" }),
        createElement("line", { x1: "12", y1: "8", x2: "12.01", y2: "8" }),
      ]),
    },
  };

  const current = configs[type];

  // 2. We use generic toast() to override the default icons with our vectors
  return toast(current.label, {
    description: message,
    icon: current.icon,
    duration: 5000,
    // 3. Premium Boxy Styling
    style: {
      backgroundColor: "#FFFFFF",
      color: "#0f172a", // Slate 900
      // The "Boxy" Accent Bar
      border: "1px solid #e2e8f0", // Subtle border
      borderLeft: `5px solid ${current.color}`, // Thick color indicator
      borderRadius: "4px", // Sharp radius (Boxy)
      // Typography & Spacing
      fontSize: "14px",
      fontWeight: "500",
      padding: "16px 20px",
      // Modern diffuse shadow
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    },
  });
};
