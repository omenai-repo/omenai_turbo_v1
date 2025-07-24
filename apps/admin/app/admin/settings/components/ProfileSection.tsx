"use client";

import { useState } from "react";
import { TextInput, Button, Avatar } from "@mantine/core";
import { Mail, Save, User } from "lucide-react";
import { TeamMember } from "@omenai/shared-types";

interface ProfileSectionProps {
  user: TeamMember;
}

export default function ProfileSection({ user }: ProfileSectionProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    setIsEditing(false);
    // todo: toast
    // notifications.show({
    //   title: "Profile updated",
    //   message: "Your profile information has been saved successfully",
    //   color: "green",
    // });
  };

  const handleCancel = () => {
    setName(user.name);
    setEmail(user.email);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#1a1a1a] rounded-lg border border-[#2a2a2a] p-6">
      <h2 className="text-xl font-semibold text-white mb-6">
        Profile Information
      </h2>

      <div className="space-y-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6">
          <Avatar
            src={user.avatar}
            alt={user.name}
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
            <p className="text-gray-400 text-sm">{user.role}</p>
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
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            disabled={!isEditing}
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
