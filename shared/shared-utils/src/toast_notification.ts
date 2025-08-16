import { toast } from "sonner";
export const toast_notif = (
  message: string,
  type: "success" | "error" | "info"
) => {
  return toast.error(
    type === "success"
      ? "Operation Successful"
      : type === "error"
        ? "Error Notification"
        : "Operation status",
    {
      description: message,
      style: {
        background:
          type === "success" ? "green" : type === "info" ? "#0f172a" : "red",
        color: "white",
      },
      className: "class",
    }
  );
};
