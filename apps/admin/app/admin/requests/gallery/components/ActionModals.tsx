import { Modal, Button, Group, ActionIcon, Menu } from "@mantine/core";
import { Check, Trash, Unlock, X } from "lucide-react";
import { useState } from "react";
import { acceptGalleryVerification } from "@omenai/shared-services/admin/accept_gallery_verification";
import { rejectGalleryVerification } from "@omenai/shared-services/admin/reject_gallery_verification";
import { GalleryType } from "./RequestWrapper";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import React from "react";

export function ActionModals({
  opened,
  close,
  type,
  gallery,
}: {
  opened: boolean;
  close: () => void;
  type: "accept" | "reject" | "unblock";
  gallery: GalleryType;
}) {
  const [loading, setLoading] = useState(false);
  const { gallery_id, name, email } = gallery;
  const queryClient = useQueryClient();

  const { csrf } = useAuth({ requiredRole: "admin" });
  const handleRequestAction = async () => {
    try {
      setLoading(true);

      const response =
        type === "accept"
          ? await acceptGalleryVerification(gallery_id, name, email, csrf || "")
          : await rejectGalleryVerification(
              gallery_id,
              name,
              email,
              csrf || ""
            );

      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");
      await queryClient.invalidateQueries({
        queryKey: ["fetch_galleries_on_verif_status"],
      });
      close();
    } catch (error) {
      toast.error("Error notification ", {
        description:
          "An error was encountered, please try later or contact support",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        withCloseButton={false}
        centered
        size="sm"
        radius="md"
        overlayProps={{
          backgroundOpacity: 0.4,
          blur: 8,
        }}
        styles={{
          content: {
            background:
              "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.15)",
          },
          header: {
            background: "transparent",
            borderBottom: "none",
            paddingBottom: 0,
          },
        }}
      >
        <div className="relative p-3">
          {/* Icon section */}
          <div className="flex justify-center mb-6">
            <div
              className={`
          w-16 h-16 rounded flex items-center justify-center shadow-lg
          ${
            type === "accept"
              ? "bg-gradient-to-br from-green-400 to-emerald-600"
              : type === "reject"
                ? "bg-gradient-to-br from-red-400 to-rose-600"
                : "bg-gradient-to-br from-slate-400 to-slate-600"
          }
        `}
            >
              {type === "accept" ? (
                <Check size={24} color="white" strokeWidth={2.5} />
              ) : type === "reject" ? (
                <X size={24} color="white" strokeWidth={2.5} />
              ) : (
                <Unlock size={24} color="white" strokeWidth={2.5} />
              )}
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-2">
            <h3 className="text-fluid-base font-semiboldtext-dark mb-2">
              {type === "accept"
                ? "Accept Gallery Request"
                : type === "reject"
                  ? "Reject Gallery Request"
                  : "Unblock Gallery"}
            </h3>
            <div
              className={`w-16 h-1 mx-auto rounded ${
                type === "accept"
                  ? "bg-gradient-to-r from-green-400 to-emerald-500"
                  : type === "reject"
                    ? "bg-gradient-to-r from-red-400 to-rose-500"
                    : "bg-gradient-to-r from-slate-400 to-slate-500"
              }`}
            />
          </div>

          {/* Message */}
          <div className="text-center mb-8">
            <p className="text-gray-600 text-fluid-base leading-relaxed">
              {type === "accept"
                ? "Are you sure you want to accept this gallery request? This will establish a partnership."
                : type === "reject"
                  ? "Are you sure you want to reject this gallery request? This action cannot be undone."
                  : "Are you sure you want to unblock this gallery? They will be able to contact you again."}
            </p>
          </div>

          {/* Action Buttons */}
          <Group justify="center" gap="md">
            <Button
              loading={loading}
              disabled={loading}
              size="sm"
              radius="md"
              color={`${type === "accept" ? "green" : type === "unblock" ? "#0f172a" : "red"}`}
              onClick={handleRequestAction}
              className={`
            px-4 py-2 text-fluid-xs font-semibold transition-all duration-300 transform hover:scale-105
            ${
              type === "accept"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-green-200"
                : type === "reject"
                  ? "bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 shadow-red-200"
                  : "bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 shadow-slate-200"
            } text-white shadow-lg hover:shadow-xl
          `}
              leftSection={
                type === "accept" ? (
                  <Check size={18} strokeWidth={2} />
                ) : type === "reject" ? (
                  <X size={18} strokeWidth={2} />
                ) : (
                  <Unlock size={18} strokeWidth={2} />
                )
              }
            >
              {type === "accept"
                ? "Yes, Accept"
                : type === "reject"
                  ? "Yes, Reject"
                  : "Yes, Unblock"}
            </Button>

            <Button
              loading={loading}
              disabled={loading}
              size="sm"
              radius="md"
              variant="outline"
              onClick={close}
              color="#0f172a"
              className="px-4 py-2 text-fluid-xs font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 transform hover:scale-105"
              leftSection={<X size={18} strokeWidth={2} />}
            >
              No, Cancel
            </Button>
          </Group>
        </div>
      </Modal>
    </>
  );
}
