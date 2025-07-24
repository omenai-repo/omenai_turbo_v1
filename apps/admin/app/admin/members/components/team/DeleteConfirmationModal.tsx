import { Modal, Button, Text } from "@mantine/core";
import { TriangleAlert } from "lucide-react";

interface DeleteConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  memberName: string;
}

export default function DeleteConfirmationModal({
  opened,
  onClose,
  onConfirm,
  memberName,
}: DeleteConfirmationModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Remove Team Member"
      centered
      styles={{
        root: {
          ".mantine-Modal-content": {
            backgroundColor: "#1a1a1a",
            border: "1px solid #2a2a2a",
          },
          ".mantine-Modal-header": {
            backgroundColor: "#1a1a1a",
            borderBottom: "1px solid #2a2a2a",
          },
          ".mantine-Modal-title": {
            color: "white",
            fontSize: "1.25rem",
            fontWeight: 600,
          },
          ".mantine-Modal-close": {
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
              Are you sure you want to remove <strong>{memberName}</strong> from
              the team?
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
            onClick={onConfirm}
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
