"use client";
import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { deletePromotionalData } from "@omenai/shared-services/promotionals/deletePromotionalData";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { deleteEditorialPiece } from "../lib/deleteEditorial";
import { deleteEditorialImage } from "../lib/deleteEditorialImage";
import { useRollbar } from "@rollbar/react";

export default function DeleteEditorialModal({
  document_id,
  image_id,
}: {
  document_id: string;
  image_id: string;
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const rollbar = useRollbar();
  const [loading, setLoading] = useState(false);

  const queryClient = useQueryClient();
  const handleDeleteEditorial = async () => {
    setLoading(true);

    try {
      const [delete_editorial, delete_editorial_image] = await Promise.all([
        deleteEditorialPiece(document_id),
        deleteEditorialImage(image_id),
      ]);

      if (!delete_editorial.isOk) {
        toast_notif(
          delete_editorial.message || "Could not delete editorial",
          "error"
        );
      }

      // Both operations successful - continue with success logic
      toast_notif("Editorial deleted successfully", "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_admin_editorials"],
      });

      close();
    } catch (error) {
      if (error instanceof Error) {
        rollbar.error(error);
      } else {
        rollbar.error(new Error(String(error)));
      }
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
              className="absolute top-4 right-4 w-8 h-8 rounded bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-colors"
              disabled={loading}
            >
              <X size={18} />
            </button>

            {/* Icon and Title */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded flex items-center justify-center">
                <AlertTriangle size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-fluid-md font-semibold">
                  Delete editorial
                </h2>
                <p className="text-red-100 text-fluid-xxs mt-1">
                  This action cannot be undone
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 bg-white">
            <div className="mb-6">
              <p className="text-gray-700 text-base leading-relaxed">
                Are you sure you want to delete this editorial ? This will
                permanently remove this editorial piece.
              </p>
            </div>

            {/* Warning Box */}
            <div className="bg-amber-50 border border-amber-200 rounded p-4 mb-6">
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-amber-100 rounded flex items-center justify-center">
                    <AlertTriangle size={16} className="text-amber-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-800 mb-1">
                    Important Notice
                  </h4>
                  <ul className="text-sm text-amber-700 space-y-1">
                    <li>
                      • This will remove this editorial piece from all features
                      on Omenai
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
                size="sm"
                radius="md"
                fullWidth
                loading={loading}
                onClick={handleDeleteEditorial}
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
                Delete editorial
              </Button>
            </div>
          </div>
        </div>
      </Modal>

      <button
        onClick={open}
        className="absolute -top-1 -right-1 z-30 cursor-pointer rounded h-10 w-10 bg-white shadow-lg grid place-items-center transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95"
      >
        <Trash2 size={20} absoluteStrokeWidth className="text-red-500" />
      </button>
    </>
  );
}
