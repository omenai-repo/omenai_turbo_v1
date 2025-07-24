"use client";

import { useState } from "react";
import { Modal, PasswordInput, Button } from "@mantine/core";
import { Lock } from "lucide-react";

interface ChangePasswordModalProps {
  opened: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({
  opened,
  onClose,
}: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (newPassword !== confirmPassword) {
      //   notifications.show({
      //     title: "Error",
      //     message: "New passwords do not match",
      //     color: "red",
      //   });
      return;
    }

    if (newPassword.length < 8) {
      //   notifications.show({
      //     title: "Error",
      //     message: "Password must be at least 8 characters long",
      //     color: "red",
      //   });
      return;
    }

    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      //   notifications.show({
      //     title: "Success",
      //     message: "Your password has been changed successfully",
      //     color: "green",
      //   });
      handleClose();
    }, 1000);
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title="Change Password"
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
      <div className="space-y-4 p-4">
        <PasswordInput
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.currentTarget.value)}
          leftSection={<Lock size={16} />}
          styles={{
            label: {
              color: "#999",
              marginBottom: "0.5rem",
            },
            input: {
              backgroundColor: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "white",
              "&:focus": {
                borderColor: "#4a4a4a",
              },
            },
          }}
        />

        <PasswordInput
          label="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.currentTarget.value)}
          leftSection={<Lock size={16} />}
          description="Must be at least 8 characters"
          styles={{
            label: {
              color: "#999",
              marginBottom: "0.5rem",
            },
            description: {
              color: "#666",
              marginTop: "0.25rem",
            },
            input: {
              backgroundColor: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "white",
              "&:focus": {
                borderColor: "#4a4a4a",
              },
            },
          }}
        />

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          leftSection={<Lock size={16} />}
          styles={{
            label: {
              color: "#999",
              marginBottom: "0.5rem",
            },
            input: {
              backgroundColor: "#2a2a2a",
              border: "1px solid #3a3a3a",
              color: "white",
              "&:focus": {
                borderColor: "#4a4a4a",
              },
            },
          }}
        />

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="subtle"
            fullWidth
            disabled={loading}
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
            fullWidth
            loading={loading}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            styles={{
              root: {
                backgroundColor: "#3a3a3a",
                "&:hover": {
                  backgroundColor: "#4a4a4a",
                },
                "&:disabled": {
                  backgroundColor: "#2a2a2a",
                  color: "#666",
                },
              },
            }}
          >
            Update Password
          </Button>
        </div>
      </div>
    </Modal>
  );
}
