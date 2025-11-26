import { Modal, Button, Text } from "@mantine/core";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { TriangleAlert } from "lucide-react";
import { useState } from "react";
import { deleteMember } from "@omenai/shared-services/admin/delete_member";
import { useRollbar } from "@rollbar/react";
interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  memberName: string;
  member_email: string;
  member_id: string;
}

export default function DeleteConfirmationModal({
  opened,
  onClose,
  memberName,
  member_email,
  member_id,
}: DeleteConfirmationModalProps) {
  const queryClient = useQueryClient();
  const { csrf } = useAuth({ requiredRole: "admin" });
  const [loading, setLoading] = useState<boolean>(false);
  const rollbar = useRollbar();
  const handleSubmit = async () => {
    setLoading(true);
    if (member_id) {
      try {
        const response = await deleteMember(
          member_id,
          member_email,
          csrf || ""
        );

        if (!response.isOk) {
          toast_notif(response.message, "error");
          return;
        } else {
          toast_notif(response.message, "success");
          await queryClient.invalidateQueries({
            queryKey: ["fetch_all_teamMembers"],
          });

          onClose();
        }
      } catch (error) {
        if (error instanceof Error) {
          rollbar.error(error);
        } else {
          rollbar.error(new Error(String(error)));
        }
        toast_notif("Something went wrong, please contact support", "error");
        return;
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Remove Team Member"
      centered
      styles={{
        root: {
          ".mantineModalContent": {
            backgroundColor: "#0f172a",
            border: "1px solid #2a2a2a",
          },
          ".mantineModalHeader": {
            backgroundColor: "#0f172a",
            borderBottom: "1px solid #2a2a2a",
          },
          ".mantineModalTitle": {
            color: "white",
            fontSize: "1.25rem",
            fontWeight: 600,
          },
          ".mantineModalClose": {
            color: "#999",
            "&:hover": {
              backgroundColor: "#2a2a2a",
            },
          },
        },
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <TriangleAlert
            size={20}
            absoluteStrokeWidth
            className="text-red-500 mt-1"
          />
          <div>
            <Text className="text-white mb-2">
              Are you sure you want to remove{" "}
              <strong>{memberName || member_email}</strong> from the team?
            </Text>
            <Text size="sm" className="text-gray-400">
              This action cannot be undone. They will lose access to all team
              resources.
            </Text>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            variant="subtle"
            disabled={loading}
            fullWidth
            styles={{
              root: {
                color: "#999",
                "&:hover": {
                  backgroundColor: "#2a2a2a",
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            loading={loading}
            fullWidth
            color="red"
            styles={{
              root: {
                backgroundColor: "#dc2626",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
              },
            }}
          >
            Remove Member
          </Button>
        </div>
      </div>
    </Modal>
  );
}
