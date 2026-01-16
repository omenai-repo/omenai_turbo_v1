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
import { useRollbar } from "@rollbar/react";

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
  const rollbar = useRollbar();
  const { csrf } = useAuth({ requiredRole: "admin" });
  const queryClient = useQueryClient();

  const handleDeletePromotional = async () => {
    setLoading(true);
    try {
      const response = await deletePromotionalData(id, csrf || "");
      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");
      await queryClient.invalidateQueries({
        queryKey: ["fetch_promotional_data"],
      });
      close();
    } catch (err) {
      rollbar.error(err instanceof Error ? err : new Error(String(err)));
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
        size="sm"
        radius="lg"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col overflow-hidden rounded-lg bg-white">
          {/* Header */}
          <div className="relative border-b border-neutral-100 px-6 py-5">
            <button
              onClick={close}
              disabled={loading}
              className="absolute right-4 top-4 rounded p-1 text-neutral-500 hover:bg-neutral-100"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-md bg-red-50 p-2">
                <AlertTriangle size={18} className="text-red-600" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Delete promotional
                </h2>
                <p className="mt-1 text-sm text-neutral-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <p className="text-sm text-neutral-700 leading-relaxed">
              Are you sure you want to permanently delete{" "}
              <span className="font-medium text-neutral-900">
                {advertTitle}
              </span>
              ? This promotional will be removed from all surfaces across
              Omenai.
            </p>

            <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800 mb-1">
                Please note
              </p>
              <ul className="text-sm text-amber-700 list-disc list-inside space-y-1">
                <li>This action is irreversible</li>
                <li>Users will not be notified</li>
                <li>The promotional will disappear immediately</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4">
            <Button variant="subtle" onClick={close} disabled={loading}>
              Cancel
            </Button>

            <Button
              loading={loading}
              color="red"
              onClick={handleDeletePromotional}
              leftSection={!loading && <Trash2 size={16} />}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Trigger */}
      <button
        onClick={open}
        className="
          absolute -top-1 -right-1 z-30
          grid h-9 w-9 place-items-center
          rounded-md bg-white
          border border-neutral-200
          text-red-600
          hover:bg-red-50
          transition
        "
      >
        <Trash2 size={16} />
      </button>
    </>
  );
}
