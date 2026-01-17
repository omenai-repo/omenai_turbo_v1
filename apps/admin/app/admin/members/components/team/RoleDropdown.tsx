"use client";
import { Select, Modal, Text, Group, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { TeamMember } from "@omenai/shared-types";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Shield, UserRoundCog, UserRoundPen } from "lucide-react";
import { useState } from "react";
import { editMemberRole } from "@omenai/shared-services/admin/edit_member_role";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { resendAdminInvite } from "@omenai/shared-services/admin/resend_admin_invite";
import { useRollbar } from "@rollbar/react";
interface RoleDropdownProps {
  value: TeamMember["access_role"];
  memberName?: string;
  disabled?: boolean;
  isMemberVerified: boolean;
  member_id: string;
}

type RoleOption = {
  value: TeamMember["access_role"];
  label: TeamMember["access_role"];
  icon: React.ReactNode;
};

const roleOptions: RoleOption[] = [
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
  {
    value: "Owner",
    label: "Owner",
    icon: <UserRoundCog size={20} absoluteStrokeWidth />,
  },
];

function getEditableRoleOptions(
  currentRole: TeamMember["access_role"],
  userRole: TeamMember["access_role"]
): RoleOption[] {
  if (userRole !== "Owner" && userRole !== "Admin") {
    return roleOptions.filter((option) => option.value === currentRole);
  }

  switch (currentRole) {
    case "Owner":
      return roleOptions.filter((option) => option.value === "Owner");
    case "Admin":
      return roleOptions.filter((option) => option.value !== "Owner");
    case "Editor":
      return roleOptions.filter((option) => option.value !== "Owner");

    case "Viewer":
      return roleOptions.filter((option) => option.value !== "Owner");
    default:
      return roleOptions;
  }
}

export default function RoleDropdown({
  value,
  memberName = "this member",
  disabled = false,
  isMemberVerified,
  member_id,
}: RoleDropdownProps) {
  const { user, csrf } = useAuth({ requiredRole: "admin" });
  const [opened, { open, close }] = useDisclosure(false);
  const rollbar = useRollbar();
  function logRollbarClientError(error: any) {
    if (error instanceof Error) {
      rollbar.error(error);
    } else {
      rollbar.error(new Error(String(error)));
    }
  }
  const [pendingRole, setPendingRole] = useState<
    TeamMember["access_role"] | null
  >(null);

  const canEdit = user.access_role === "Owner" || user.access_role === "Admin";
  const availableOptions = getEditableRoleOptions(value, user.access_role);

  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<boolean>(false);
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const handleEditMemberRole = async () => {
    setLoading(true);
    if (member_id && pendingRole !== null) {
      try {
        const response = await editMemberRole(
          member_id,
          pendingRole,
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

          setPendingRole(null);
          close();
        }
      } catch (error) {
        logRollbarClientError(error);
        toast_notif("Something went wrong, please contact support", "error");
        return;
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const handleResendInvite = async () => {
    if (member_id) {
      setResendLoading(true);
      try {
        const response = await resendAdminInvite(member_id, csrf || "");

        if (!response.isOk) {
          toast_notif(response.message, "error");
          return;
        } else {
          toast_notif(response.message, "success");
          await queryClient.invalidateQueries({
            queryKey: ["fetch_all_teamMembers"],
          });

          setPendingRole(null);
          close();
        }
      } catch (error) {
        logRollbarClientError(error);
        toast_notif("Something went wrong, please contact support", "error");
        return;
      } finally {
        setResendLoading(false);
      }
    } else {
      return;
    }
  };
  const handleChange = (newRole: string | null) => {
    if (newRole && newRole !== value) {
      setPendingRole(newRole as TeamMember["access_role"]);
      open();
    }
  };

  const confirmChange = async () => {
    if (pendingRole) {
      setPendingRole(null);
    }
    close();
  };

  const cancelChange = () => {
    setPendingRole(null);
    close();
  };

  return (
    <>
      <div className="flex flex-col space-y-1">
        <Select
          value={value}
          disabled={
            disabled ||
            !canEdit ||
            !isMemberVerified ||
            user.admin_id === member_id
          }
          onChange={handleChange}
          data={availableOptions}
          styles={{
            input: {
              backgroundColor: "#fafafa",
              border: "1px solid #e2e8f0",
              color: "black",
              "&:focus": {
                borderColor: "#e2e8f0",
              },
              fontSize: "12px",
            },
            dropdown: {
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
            },
            option: {
              fontSize: "12px",
              color: "#0f172a",
              "&[dataHovered]": {
                backgroundColor: "#f5f5f5",
              },
            },
          }}
        />
        {!isMemberVerified &&
          (user.access_role === "Owner" || user.access_role === "Admin") && (
            <>
              <span className="text-amber-500 text-fluid-xxs">
                Team member is yet to accept this invite
              </span>

              <Button
                onClick={handleResendInvite}
                disabled={resendLoading}
                loading={resendLoading}
                size="compact-xs"
                styles={{
                  root: {
                    backgroundColor: "#2a2a2a",
                    border: "1px solid #3a3a3a",
                    "&:hover": {
                      backgroundColor: "#3a3a3a",
                    },
                  },
                }}
              >
                Resend Invite
              </Button>
            </>
          )}
      </div>

      <Modal
        opened={opened}
        onClose={cancelChange}
        title="Confirm Role Change"
        centered
        size="sm"
      >
        <Text size="sm" mb="sm">
          Are you sure you want to change {memberName}'s role from{" "}
          <strong>{value}</strong> to <strong>{pendingRole}</strong>?
        </Text>

        <Group justify="flex-end">
          <Button
            variant="subtle"
            disabled={loading}
            styles={{
              root: {
                color: "#2a2a2a",
                border: "1px solid #3a3a3a",
                "&:hover": {
                  backgroundColor: "#3a3a3a",
                },
              },
            }}
            onClick={cancelChange}
          >
            Cancel
          </Button>
          <Button
            onClick={handleEditMemberRole}
            disabled={loading}
            loading={loading}
            styles={{
              root: {
                backgroundColor: "#2a2a2a",
                border: "1px solid #3a3a3a",
                "&:hover": {
                  backgroundColor: "#3a3a3a",
                },
              },
            }}
          >
            Confirm Change
          </Button>
        </Group>
      </Modal>
    </>
  );
}
