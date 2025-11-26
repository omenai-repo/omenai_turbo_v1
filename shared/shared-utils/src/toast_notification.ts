import { toast } from "sonner";
export const toast_notif = (
  message: string,
  type: "success" | "error" | "info"
) => {
  let backgroundColor = "";
  let textColor = "";

  switch (type) {
    case "success":
      backgroundColor = "#22c55e"; // Tailwind green-500
      textColor = "#ffffff";
      break;
    case "error":
      backgroundColor = "#ef4444"; // Tailwind red-500
      textColor = "#ffffff";
      break;
    case "info":
      backgroundColor = "#ffffff"; // White background
      textColor = "#0f172a"; // Dark text
      break;
  }
  return toast.error(
    type === "success"
      ? "Operation Successful"
      : type === "error"
        ? "Error Notification"
        : "Operation status",
    {
      description: message,
      style: {
        background: backgroundColor,
        color: textColor,
        padding: "16px 24px",
        borderRadius: "12px",
        boxShadow: "0 4px 14px rgba(0,0,0,0.1)",
        fontWeight: "500",
        border: type === "info" ? "1px solid #e5e7eb" : "none",
      },
      duration: 5000,
      icon: type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️",
      className: "shadow-sm",
    }
  );
};
