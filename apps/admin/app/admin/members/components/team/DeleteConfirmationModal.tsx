"use client";

import { Modal, Button, Text } from "@mantine/core";
import { TriangleAlert } from "lucide-react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { deleteMember } from "@omenai/shared-services/admin/delete_member";
import { useState } from "react";
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
  const { csrf } = useAuth({ requiredRole: "admin" });
  const queryClient = useQueryClient();
  const rollbar = useRollbar();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await deleteMember(member_id, member_email, csrf || "");

      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");
      await queryClient.invalidateQueries({
        queryKey: ["fetch_all_teamMembers"],
      });

      onClose();
    } catch (error) {
      rollbar.error(error instanceof Error ? error : new Error(String(error)));
      toast_notif("Something went wrong. Please contact support.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="sm"
      radius="md"
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.6, blur: 4 }}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-red-100">
            <TriangleAlert className="text-red-600" size={20} />
          </div>

          <div>
            <Text fw={600} size="sm">
              Remove team member
            </Text>
            <Text size="sm" c="dimmed" mt={4}>
              This action is permanent and cannot be undone.
            </Text>
          </div>
        </div>

        {/* Body */}
        <div className="rounded bg-red-50 border border-red-200 p-4">
          <Text size="sm" c="red.9">
            You are about to remove{" "}
            <strong>{memberName || member_email}</strong> from your team.
          </Text>
          <Text size="sm" c="red.8" mt={6}>
            They will immediately lose access to all internal tools and
            resources.
          </Text>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="default"
            fullWidth
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            fullWidth
            color="red"
            loading={loading}
            onClick={handleDelete}
          >
            Remove member
          </Button>
        </div>
      </div>
    </Modal>
  );
}
