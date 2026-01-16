"use client";

import { useState } from "react";
import { TextInput, Button, Avatar } from "@mantine/core";
import { Mail, Save, User } from "lucide-react";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { resendAdminInvite } from "@omenai/shared-services/admin/resend_admin_invite";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { updateAdminProfile } from "@omenai/shared-services/admin/update_admin_profile";
import { admin_url } from "@omenai/url-config/src/config";
import { useRollbar } from "@rollbar/react";
export default function ProfileSection() {
  const { user, csrf, signOut } = useAuth({
    requiredRole: "admin",
    redirectUrl: `${admin_url()}/auth/login`,
  });
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user.name);
  const [isEditing, setIsEditing] = useState(false);
  const rollbar = useRollbar();
  const handleSave = async () => {
    if (user) {
      setLoading(true);
      try {
        const response = await updateAdminProfile(
          user.admin_id,
          name,
          csrf || ""
        );

        if (!response.isOk) {
          toast_notif(response.message, "error");
          return;
        } else {
          toast_notif(response.message, "success");
          setIsEditing(false);
          await signOut();
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
    } else {
      return;
    }
  };

  const handleCancel = () => {
    setName(user.name);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#0f172a] rounded border border-[#2a2a2a] p-6">
      <h2 className="text-fluid-sm font-semibold text-white mb-6">
        Profile Information
      </h2>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <Avatar
            size={80}
            radius="xl"
            styles={{
              root: {
                border: "3px solid #2a2a2a",
              },
            }}
          />
          <div>
            <p className="text-white font-medium">{user.name}</p>
            <p className="text-gray-400 text-sm">{user.access_role}</p>
          </div>
        </div>

        {/* Form Fields */}
        <div className="space-y-4">
          <TextInput
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={!isEditing}
            leftSection={<User size={16} />}
            styles={{
              label: {
                color: "#999",
                marginBottom: "0.5rem",
              },
              input: {
                backgroundColor: isEditing ? "#2a2a2a" : "#0a0a0a",
                border: "1px solid #3a3a3a",
                color: "white",
                "&:focus": {
                  borderColor: "#4a4a4a",
                },
                "&:disabled": {
                  backgroundColor: "#0a0a0a",
                  color: "#999",
                  opacity: 1,
                },
              },
            }}
          />

          <TextInput
            label="Email Address"
            disabled
            value={user.email}
            leftSection={<Mail size={16} />}
            styles={{
              label: {
                color: "#999",
                marginBottom: "0.5rem",
              },
              input: {
                backgroundColor: isEditing ? "#2a2a2a" : "#0a0a0a",
                border: "1px solid #3a3a3a",
                color: "white",
                "&:focus": {
                  borderColor: "#4a4a4a",
                },
                "&:disabled": {
                  backgroundColor: "#0a0a0a",
                  color: "#999",
                  opacity: 1,
                },
              },
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          {!isEditing ? (
            <Button
              disabled={loading}
              onClick={() => setIsEditing(true)}
              variant="subtle"
              styles={{
                root: {
                  backgroundColor: "#2a2a2a",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "#3a3a3a",
                  },
                },
              }}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                onClick={handleCancel}
                variant="subtle"
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
                onClick={handleSave}
                loading={loading}
                disabled={loading || name === user.name}
                leftSection={<Save size={16} />}
                styles={{
                  root: {
                    backgroundColor: "#3a3a3a",
                    "&:hover": {
                      backgroundColor: "#4a4a4a",
                    },
                  },
                }}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
