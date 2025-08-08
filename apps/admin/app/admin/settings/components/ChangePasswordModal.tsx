"use client";

import { useState } from "react";
import { Modal, PasswordInput, Button } from "@mantine/core";
import { Lock } from "lucide-react";
import { updateAdminCredentials } from "@omenai/shared-services/admin/update_admin_credentials";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

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
  const { user, csrf } = useAuth({ requiredRole: "admin" });
  const handleSubmit = async () => {
    if (user) {
      setLoading(true);
      try {
        const response = await updateAdminCredentials(
          user.admin_id,
          newPassword,
          currentPassword,
          csrf || ""
        );

        if (!response.isOk) {
          toast_notif(response.message, "error");
          return;
        } else {
          toast_notif(response.message, "success");
          onClose();
        }
      } catch (error) {
        toast_notif("Something went wrong, please contact support", "error");
        return;
      } finally {
        setLoading(false);
      }
    } else {
      return;
    }
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
      size="md"
      radius="md"
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
      styles={{
        root: {
          ".mantineModalContent": {
            backgroundColor: "#ffffff",
            border: "1px solid rgba(0, 0, 0, 0.08)",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          },
          ".mantineModalHeader": {
            backgroundColor: "#ffffff",
            borderBottom: "1px solid #f3f4f6",
            padding: "1.5rem 2rem",
          },
          ".mantineModalTitle": {
            color: "#111827",
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.025em",
          },
          ".mantineModalClose": {
            color: "#6b7280",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            "&:hover": {
              backgroundColor: "#f3f4f6",
              color: "#111827",
            },
          },
          ".mantineModalBody": {
            padding: "2rem",
          },
        },
      }}
    >
      <div className="space-y-5">
        {/* Security notice */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">
                Secure Password Update
              </p>
              <p className="text-xs text-blue-700">
                Your password will be encrypted and stored securely
              </p>
            </div>
          </div>
        </div>

        <PasswordInput
          label="Current Password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.currentTarget.value)}
          leftSection={
            <div className="text-gray-500">
              <Lock size={18} />
            </div>
          }
          radius="md"
          size="md"
          variant="filled"
          styles={{
            label: {
              color: "#374151",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 400,
            },
            input: {
              backgroundColor: "#f9fafb",
              border: "1px solid #e0e0e0",
              color: "#111827",
              fontSize: "1rem",

              transition: "all 0.2s ease",
              "&:focus": {
                borderColor: "#6366f1",
                backgroundColor: "#ffffff",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
              },
              "&::placeholder": {
                color: "#9ca3af",
              },
            },
            innerInput: {
              fontSize: "1rem",
            },
          }}
        />

        <div className="space-y-2">
          <PasswordInput
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.currentTarget.value)}
            leftSection={
              <div className="text-gray-500">
                <Lock size={18} />
              </div>
            }
            radius="md"
            size="md"
            variant="filled"
            description="Must be at least 8 characters with mixed case and numbers"
            styles={{
              label: {
                color: "#374151",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                fontWeight: 400,
              },
              description: {
                color: "#6b7280",
                marginTop: "0.5rem",
                fontSize: "0.75rem",
              },
              input: {
                backgroundColor: "#f9fafb",
                border: "1px solid #e0e0e0",
                color: "#111827",
                fontSize: "1rem",

                transition: "all 0.2s ease",
                "&:focus": {
                  borderColor: "#6366f1",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
                },
                "&::placeholder": {
                  color: "#9ca3af",
                },
              },
              innerInput: {
                fontSize: "1rem",
              },
            }}
          />

          {/* Password strength indicator */}
          {newPassword && (
            <div className="px-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex gap-1 flex-1">
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      newPassword.length >= 8 ? "bg-green-500" : "bg-dark/20"
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      newPassword.length >= 10 &&
                      /[A-Z]/.test(newPassword) &&
                      /[0-9]/.test(newPassword)
                        ? "bg-green-500"
                        : "bg-dark/20"
                    }`}
                  />
                  <div
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      newPassword.length >= 12 &&
                      /[A-Z]/.test(newPassword) &&
                      /[0-9]/.test(newPassword) &&
                      /[^A-Za-z0-9]/.test(newPassword)
                        ? "bg-green-500"
                        : "bg-dark/20"
                    }`}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {newPassword.length < 8
                    ? "Weak"
                    : newPassword.length < 12
                      ? "Good"
                      : "Strong"}
                </span>
              </div>
            </div>
          )}
        </div>

        <PasswordInput
          label="Confirm New Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.currentTarget.value)}
          leftSection={
            <div className="text-gray-500">
              <Lock size={18} />
            </div>
          }
          radius="md"
          size="md"
          variant="filled"
          error={
            confirmPassword && newPassword !== confirmPassword
              ? "Passwords do not match"
              : ""
          }
          styles={{
            label: {
              color: "#374151",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 400,
            },
            input: {
              backgroundColor: "#f9fafb",
              border: "1px solid #e0e0e0",
              color: "#111827",
              fontSize: "1rem",

              transition: "all 0.2s ease",
              "&:focus": {
                borderColor: "#6366f1",
                backgroundColor: "#ffffff",
                boxShadow: "0 0 0 3px rgba(99, 102, 241, 0.1)",
              },
              "&::placeholder": {
                color: "#9ca3af",
              },
              "&[dataInvalid]": {
                borderColor: "#ef4444",
                "&:focus": {
                  borderColor: "#ef4444",
                  boxShadow: "0 0 0 3px rgba(239, 68, 68, 0.1)",
                },
              },
            },
            innerInput: {
              fontSize: "1rem",
            },
            error: {
              fontSize: "0.75rem",
              marginTop: "0.5rem",
            },
          }}
        />

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleClose}
            variant="subtle"
            fullWidth
            size="sm"
            radius="md"
            disabled={loading}
            styles={{
              root: {
                color: "#6b7280",
                backgroundColor: "#f9fafb",

                fontWeight: 400,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#f3f4f6",
                  color: "#111827",
                },
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            fullWidth
            size="sm"
            radius="md"
            loading={loading}
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              loading
            }
            leftSection={!loading && <Lock size={18} />}
            styles={{
              root: {
                backgroundColor: "#0f172a",

                fontWeight: 400,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#4f46e5",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 11px rgba(99, 102, 241, 0.4)",
                },
                "&:disabled": {
                  backgroundColor: "#e5e7eb",
                  color: "#9ca3af",
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
