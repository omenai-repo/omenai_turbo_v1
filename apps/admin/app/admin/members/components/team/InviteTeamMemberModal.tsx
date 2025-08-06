"use client";

import { useState } from "react";
import { Modal, TextInput, Select, Button } from "@mantine/core";
import { TeamMember } from "@omenai/shared-types";
import { Shield, UserRoundPen, Eye, Send } from "lucide-react";
import { inviteNewMember } from "@omenai/shared-services/admin/invite_new_member";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
interface InviteTeamMemberModalProps {
  opened: boolean;
  onClose: () => void;
}

const roleOptions = [
  {
    value: "Admin",
    label: "Admin",
    icon: <Shield size={20} absoluteStrokeWidth />,
  },
  {
    value: "Editor",
    label: "Editor",
    icon: <UserRoundPen size={20} absoluteStrokeWidth />,
  },
  {
    value: "Viewer",
    label: "Viewer",
    icon: <Eye size={20} absoluteStrokeWidth />,
  },
];

export default function InviteTeamMemberModal({
  opened,
  onClose,
}: InviteTeamMemberModalProps) {
  const queryClient = useQueryClient();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<TeamMember["access_role"]>("Viewer");
  const { csrf } = useAuth({ requiredRole: "admin" });
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async () => {
    setLoading(true);
    if (email) {
      try {
        if (!email.includes("omenai.net")) {
          toast_notif(
            "You can only invite members of your organization to this team",
            "error"
          );

          return;
        }
        const response = await inviteNewMember(email, role, csrf || "");

        if (!response.isOk) {
          toast_notif(response.message, "error");
          return;
        } else {
          toast_notif(response.message, "success");
          await queryClient.invalidateQueries({
            queryKey: ["fetch_all_teamMembers"],
          });
          setEmail("");
          setRole("Viewer");
          onClose();
        }
      } catch (error) {
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
      title="Invite Team Member"
      centered
      size="md"
      radius="sm"
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
      <div className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Invite a new member to collaborate with your team
          </p>
        </div>

        <TextInput
          label="Email Address"
          placeholder="colleague@omenai.net"
          value={email}
          radius="md"
          variant="filled"
          onChange={(e) => setEmail(e.currentTarget.value)}
          styles={{
            label: {
              color: "#374151",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              fontWeight: 600,
            },
            input: {
              backgroundColor: "#f9fafb",
              border: "1px solid #e0e0e0",
              color: "#111827",
              fontSize: "1rem",
              height: "3rem",
              transition: "all 0.2s ease",
              "&:focus": {
                borderColor: "#3b82f6",
                backgroundColor: "#ffffff",
              },
              "&::placeholder": {
                color: "#9ca3af",
              },
            },
          }}
        />

        <Select
          label="Role"
          value={role}
          onChange={(val) => setRole(val as TeamMember["access_role"])}
          data={roleOptions}
          variant="filled"
          radius="md"
          leftSection={
            <div className="text-gray-600">
              {roleOptions.find((r) => r.value === role)?.icon ?? null}
            </div>
          }
          styles={{
            label: {
              color: "#374151",
              marginBottom: "0.5rem",
              fontSize: "0.8rem",
              fontWeight: 600,
            },
            input: {
              backgroundColor: "#f9fafb",
              border: "1px solid #e0e0e0",
              height: "3rem",
              fontSize: "1rem",
              transition: "all 0.2s ease",
              "&:focus": {
                borderColor: "#3b82f6",
                backgroundColor: "#ffffff",
              },
            },
            dropdown: {
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "0.75rem",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            },
            option: {
              fontSize: "0.95rem",
              padding: "0.75rem 1rem",
              "&[dataHovered]": {
                backgroundColor: "#f3f4f6",
              },
              "&[dataSelected]": {
                backgroundColor: "#3b82f6",
                color: "white",
              },
            },
          }}
        />

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-800">
            The invited member will receive an email with instructions to join
            your team.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            onClick={onClose}
            disabled={loading}
            variant="subtle"
            fullWidth
            size="sm"
            radius="md"
            styles={{
              root: {
                color: "#6b7280",
                backgroundColor: "#f9fafb",
                fontWeight: 600,
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
            disabled={!email || loading}
            loading={loading}
            leftSection={<Send size={16} absoluteStrokeWidth />}
            styles={{
              root: {
                backgroundColor: "#1a1a1a",
                fontWeight: 600,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#2563eb",
                  transform: "translateY(-1px)",
                  boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
                },
                "&:disabled": {
                  backgroundColor: "#e5e7eb",
                  color: "#9ca3af",
                },
              },
            }}
          >
            Send Invite
          </Button>
        </div>
      </div>
    </Modal>
  );
}
