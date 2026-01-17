"use client";

import { Modal, Button } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
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
  const [loading, setLoading] = useState(false);
  const rollbar = useRollbar();
  const queryClient = useQueryClient();

  const handleDeleteEditorial = async () => {
    setLoading(true);
    try {
      const [deleteEditorial, deleteImage] = await Promise.all([
        deleteEditorialPiece(document_id),
        deleteEditorialImage(image_id),
      ]);

      if (!deleteEditorial.isOk) {
        toast_notif(
          deleteEditorial.message || "Failed to delete editorial",
          "error"
        );
        return;
      }

      toast_notif("Editorial deleted successfully", "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_admin_editorials"],
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
        radius="sm"
        withCloseButton={false}
        overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
        styles={{ body: { padding: 0 } }}
      >
        <div className="flex flex-col overflow-hidden rounded bg-white">
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
              <div className="mt-0.5 rounded bg-red-50 p-2">
                <AlertTriangle size={18} className="text-red-600" />
              </div>

              <div>
                <h2 className="text-base font-semibold text-neutral-900">
                  Delete editorial
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
              Are you sure you want to permanently delete this editorial? This
              will remove the article and its associated media from all public
              surfaces.
            </p>

            <div className="rounded border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-medium text-amber-800 mb-1">
                Please note
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-amber-700">
                <li>This action is irreversible</li>
                <li>The editorial will disappear immediately</li>
                <li>Users will not be notified</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 border-t border-neutral-100 px-6 py-4">
            <Button variant="subtle" onClick={close} disabled={loading}>
              Cancel
            </Button>

            <Button
              color="red"
              loading={loading}
              onClick={handleDeleteEditorial}
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
          rounded bg-white
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
