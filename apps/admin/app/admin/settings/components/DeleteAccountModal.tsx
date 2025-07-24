"use client";

import { useState } from "react";
import { Modal, TextInput, Button, Text } from "@mantine/core";
import { TriangleAlert } from "lucide-react";

interface DeleteAccountModalProps {
  opened: boolean;
  onClose: () => void;
  userEmail: string;
}

export default function DeleteAccountModal({
  opened,
  onClose,
  userEmail,
}: DeleteAccountModalProps) {
  const [confirmEmail, setConfirmEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (confirmEmail !== userEmail) {
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      // In real app, this would redirect to login after deletion
      console.log("Account deleted");
      setLoading(false);
      onClose();
    }, 2000);
  };

  const handleClose = () => {
    setConfirmEmail("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Delete Account"
      centered
      styles={{
        root: {
          ".mantine-Modal-content": {
            backgroundColor: "#1a1a1a",
            border: "1px solid #dc2626",
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
            color: "#1a1a1a",
            "&:hover": {
              backgroundColor: "#2a2a2a",
            },
          },
        },
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <TriangleAlert size={24} className="text-red-500 mt-1" />
          <div>
            <Text className="text-white mb-2">
              This action <strong>cannot</strong> be undone. This will
              permanently delete your account and remove all associated data.
            </Text>
            <Text size="sm" className="text-gray-400">
              Please type{" "}
              <strong className="text-dark font-bold">{userEmail}</strong> to
              confirm.
            </Text>
          </div>
        </div>

        <TextInput
          value={confirmEmail}
          variant="default"
          onChange={(e) => setConfirmEmail(e.currentTarget.value)}
          styles={{
            input: {
              border: "1px solid #3a3a3a",
              "&:focus": {
                borderColor: "#dc2626",
              },
              "&::placeholder": {
                color: "#666",
              },
            },
          }}
        />

        <div className="flex gap-3 mt-6">
          <Button
            onClick={handleClose}
            variant="default"
            fullWidth
            disabled={loading}
            styles={{
              root: {
                color: "#1a1a1a",
                "&:hover": {
                  backgroundColor: "#2a2a2a",
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            fullWidth
            color="red"
            loading={loading}
            disabled={confirmEmail !== userEmail}
            styles={{
              root: {
                backgroundColor: "#dc2626",
                "&:hover": {
                  backgroundColor: "#b91c1c",
                },
                "&:disabled": {
                  backgroundColor: "#2a2a2a",
                  color: "#666",
                },
              },
            }}
          >
            Delete Account
          </Button>
        </div>
      </div>
    </Modal>
  );
}
