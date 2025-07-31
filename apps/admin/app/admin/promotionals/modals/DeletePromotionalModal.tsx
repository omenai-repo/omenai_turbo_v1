"use client";
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deletePromotionalData } from "@omenai/shared-services/promotionals/deletePromotionalData";

import { ObjectId } from "mongoose";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";

interface DeleteAdvertModalProps {
  advertTitle?: string;
  id: ObjectId;
}

export default function DeletePromotionalModal({
  advertTitle = "this promotional advert",
  id,
}: DeleteAdvertModalProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const { csrf } = useAuth({ requiredRole: "admin" });

  const queryClient = useQueryClient();
  const handleDeletePromotional = async () => {
    setLoading(true);

    try {
      const delete_promotional = await deletePromotionalData(id, csrf || "");

      if (!delete_promotional.isOk) {
        toast_notif(delete_promotional.message, "error");
        return;
      }

      toast_notif(delete_promotional.message, "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_promotional_data"],
      });

      close();
    } catch (error) {
      toast_notif("Something went wrong, please contact support", "error");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="md"
        radius="md"
        padding={0}
        withCloseButton={false}
        overlayProps={{
          backgroundOpacity: 0.55,
          blur: 3,
        }}
        styles={{
          content: {
            overflow: "hidden",
          },
        }}
      >
        {/* Modal Content */}
        <div className="relative">
          {/* Header with gradient background */}
          <div className="relative bg-gradient-to-br from-red-500 to-rose-400 p-6 text-white">
            {/* Close button */}
            <button
              onClick={close}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              disabled={loading}
            >
              <X size={18} />
            </button>

            {/* Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-fluid-md font-semibold">
                  Delete promotional
                </h2>
                <p className="text-red-100 text-fluid-xs mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-white">
            <div className="mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900">
                  {advertTitle}
                </span>
                ? This will permanently remove the promotional advert from them
                Omenai homepage.
              </p>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">
                    Important Notice
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>
                      • This will remove this promotional from all features on
                      Omenai
                    </li>
                    <li>• Users will not be notified of this change</li>
                    <li>• This action is irreversible</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                onClick={close}
                variant="subtle"
                size="sm"
                radius="md"
                fullWidth
                disabled={loading}
                styles={{
                  root: {
                    height: "48px",
                    backgroundColor: "#f3f4f6",
                    color: "#374151",
                    fontWeight: 400,
                    "&:hover": {
                      backgroundColor: "#e5e7eb",
                    },
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeletePromotional}
                size="sm"
                radius="md"
                fullWidth
                loading={loading}
                leftSection={!loading && <Trash2 size={18} />}
                styles={{
                  root: {
                    height: "48px",
                    backgroundColor: "#ef4444",
                    fontWeight: 400,
                    "&:hover": {
                      backgroundColor: "#dc2626",
                      transform: "translateY(-1px)",
                      boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                    },
                    "&:active": {
                      transform: "translateY(0)",
                    },
                  },
                }}
              >
                Delete Promotional
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <div
        onClick={open}
        className="absolute -top-1 -right-1 z-30 cursor-pointer rounded-md h-10 w-10 bg-white shadow-lg grid place-items-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
      >
        <Trash2 size={20} absoluteStrokeWidth className="text-red-500" />
      </div>
    </>
  );
}
