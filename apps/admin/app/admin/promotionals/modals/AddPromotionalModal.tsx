"use client";

import { Button, Input, Modal, Text } from "@mantine/core";
import { Plus, Image, Ban } from "lucide-react";
import React, { ChangeEvent, useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { PromotionalSchemaTypes } from "@omenai/shared-types";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { upload_promotional_image } from "../../lib/createPromotional";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createPromotionalData } from "@omenai/shared-services/promotionals/createPromotionalData";
import { useQueryClient } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useRollbar } from "@rollbar/react";

export function AddPromotionalModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        centered
        size="sm"
        radius="sm"
        styles={{
          header: { display: "none" },
          body: { padding: 0 },
        }}
      >
        <PromotionalModalForm close={close} />
      </Modal>

      <Button
        onClick={open}
        size="xs"
        radius="md"
        leftSection={<Plus size={16} />}
        className="
          bg-slate-900 text-white
          hover:bg-slate-800
          transition
        "
      >
        Add promotional
      </Button>
    </>
  );
}

function PromotionalModalForm({ close }: { close: () => void }) {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const rollbar = useRollbar();

  const acceptedFileTypes = ["jpg", "jpeg", "png"];
  const MAX_SIZE_BYTES = 5 * 1024 * 1024;

  const [promotionalData, setPromotionalData] = useState<
    Omit<PromotionalSchemaTypes, "image">
  >({
    headline: "",
    subheadline: "",
    cta: "",
  });

  const queryClient = useQueryClient();
  const { csrf } = useAuth({ requiredRole: "admin" });

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    if (file.size > MAX_SIZE_BYTES) {
      toast_notif("Image must be under 5MB.", "error");
      return;
    }

    const ext = file.type.split("/")[1];
    if (!acceptedFileTypes.includes(ext)) {
      toast_notif("Only JPG and PNG files are supported.", "error");
      return;
    }

    setCover(file);
    e.target.value = "";
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPromotionalData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePromotionalUpload = async () => {
    try {
      if (allKeysEmpty(promotionalData)) {
        toast_notif("Please complete all fields.", "error");
        return;
      }

      if (!cover) {
        toast_notif("Please upload a promotional image.", "error");
        return;
      }

      setLoading(true);

      const uploaded = await upload_promotional_image(cover);
      if (!uploaded?.$id) throw new Error("Upload failed");

      const response = await createPromotionalData(
        { ...promotionalData, image: uploaded.$id },
        csrf || "",
      );

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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex max-h-[85vh] flex-col">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-5">
        <h2 className="text-base font-semibold text-slate-900">
          New promotional
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Create an editorial promotional banner for discovery.
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 space-y-5 overflow-y-auto px-6 py-4">
        <Input.Wrapper label="Headline" required>
          <Input
            name="headline"
            placeholder="Short, attention-grabbing headline"
            onChange={handleInputChange}
          />
        </Input.Wrapper>

        <Input.Wrapper label="Description" required>
          <Input
            name="subheadline"
            placeholder="Brief supporting copy"
            onChange={handleInputChange}
          />
        </Input.Wrapper>

        <Input.Wrapper label="Call to action URL" required>
          <Input
            name="cta"
            placeholder="https://…"
            onChange={handleInputChange}
          />
        </Input.Wrapper>

        {/* Image upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">
            Promotional image
          </label>

          <div
            className="
              relative flex h-[220px] cursor-pointer
              items-center justify-center
              rounded border border-dashed border-slate-300
              bg-slate-50
              transition hover:border-slate-400
            "
            onClick={() => imagePickerRef.current?.click()}
          >
            {cover ? (
              <img
                src={URL.createObjectURL(cover)}
                alt="Preview"
                className="h-full w-full rounded object-cover object-top"
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-slate-500">
                <Image size={28} />
                <span className="text-xs">
                  Click to upload (JPG / PNG, max 5MB)
                </span>
              </div>
            )}
          </div>

          <input
            ref={imagePickerRef}
            type="file"
            hidden
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
        <Button variant="subtle" onClick={close}>
          Cancel
        </Button>
        <Button
          loading={loading}
          onClick={handlePromotionalUpload}
          className="bg-slate-900 hover:bg-slate-800"
        >
          Add promotional
        </Button>
      </div>
    </div>
  );
}
