import { toast } from "sonner";
export const toast_notif = (
  message: string,
  type: "success" | "error" | "info"
) => {
  return toast.error("Error notification", {
    description: message,
    style: {
      background:
        type === "success" ? "green" : type === "info" ? "#1a1a1a" : "red",
      color: "white",
    },
    className: "class",
  });
};
