import { useDisclosure } from "@mantine/hooks";
import { Modal, Button, Group, ActionIcon, Menu } from "@mantine/core";
import { Check, Trash } from "lucide-react";
import { useState } from "react";
import { acceptGalleryVerification } from "@omenai/shared-services/admin/accept_gallery_verification";
import { rejectGalleryVerification } from "@omenai/shared-services/admin/reject_gallery_verification";
import { GalleryType } from "./RequestWrapper";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

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
        toast.error("Error notification ", {
          description: response.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      }

      toast.success("Operation successful ", {
        description: response.message,
        style: {
          background: "green",
          color: "white",
        },
        className: "class",
      });
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
        title="Confirm your action"
        centered
        className="font-bold text-center"
      >
        <div className="flex flex-col space-y-4 p-8">
          <>
            <p className="text-fluid-base font-medium">
              {type === "accept"
                ? "Are you sure you want to accept this gallery request?"
                : type === "reject"
                  ? "Are you sure you want to accept this gallery request?"
                  : "Are you sure you want to unblock this gallery?"}
            </p>
            <Group justify="center">
              <Button
                loading={loading}
                disabled={loading}
                radius={"xl"}
                variant="outline"
                onClick={handleRequestAction}
                color={
                  type === "accept"
                    ? "green"
                    : type === "reject"
                      ? "red"
                      : "#1a1a1a"
                }
                leftSection={
                  <Check size={16} strokeWidth={1.5} absoluteStrokeWidth />
                }
              >
                Yes, Proceed
              </Button>

              <Button
                loading={loading}
                disabled={loading}
                radius={"xl"}
                color="#1a1a1a"
                onClick={close}
                leftSection={
                  <Trash size={16} strokeWidth={1.5} absoluteStrokeWidth />
                }
              >
                No, Cancel
              </Button>
            </Group>
          </>
        </div>
      </Modal>
    </>
  );
}
