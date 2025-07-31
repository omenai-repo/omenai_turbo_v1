"use client";
import { Button, Input, Text, Modal } from "@mantine/core";
import React, { ChangeEvent, useRef, useState } from "react";
import { Plus, Image, Ban } from "lucide-react";
import { toast } from "sonner";
import { useDisclosure } from "@mantine/hooks";
import {
  PromotionalDataUpdateTypes,
  PromotionalSchemaTypes,
} from "@omenai/shared-types";
import { allKeysEmpty } from "@omenai/shared-utils/src/checkIfObjectEmpty";
import { upload_promotional_image } from "../../lib/createPromotional";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { createPromotionalData } from "@omenai/shared-services/promotionals/createPromotionalData";
import { useQueryClient } from "@tanstack/react-query";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
export function AddPromotionalModal() {
  const [opened, { open, close }] = useDisclosure(false);
  return (
    <>
      <Modal opened={opened} onClose={close} title="Add new promotional Advert">
        <PromotionalModalForm close={close} />
      </Modal>

      <Button
        onClick={open}
        rightSection={<Plus size={20} strokeWidth={1.5} absoluteStrokeWidth />}
        radius={"sm"}
        color="#1a1a1a"
      >
        <Text className="text-fluid-xxs font-normal">
          Add a new promotional
        </Text>
      </Button>
    </>
  );
}

function PromotionalModalForm({ close }: { close: () => void }) {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const acceptedFileTypes = ["jpg", "jpeg", "png"];
  const MAX_SIZE_MB = 5; // e.g., 5MB
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;
  const [promotionalData, setPromotionalData] = useState<
    Omit<PromotionalSchemaTypes, "image">
  >({
    headline: "",
    subheadline: "",
    cta: "",
  });

  const queryClient = useQueryClient();
  const { csrf } = useAuth({ requiredRole: "admin" });

  const [loading, setLoading] = useState<boolean>(false);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if input is actaully an image
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const type = file.type.split("/");

    if (file.size > MAX_SIZE_BYTES) {
      toast_notif("Image file size exceeds the maximum limit of 5MB.", "error");
      return;
    }

    if (!acceptedFileTypes.includes(type[1])) {
      toast_notif(
        "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
        "error"
      );

      return;
    }
    setCover(e.target.files![0]);

    setErrorList([]);
    e.target.value = "";
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const name = e.target.name;
    const value = e.target.value;

    setPromotionalData((prev) => {
      return { ...prev, [name]: value };
    });
  };
  const handlePromotionalUpload = async () => {
    try {
      if (allKeysEmpty(promotionalData)) {
        toast_notif(
          "All form fields must be filled out before submission.",
          "error"
        );

        return;
      }
      setLoading(true);

      if (cover === null) {
        toast_notif("Please upload an image to proceed", "error");
        return;
      }

      const fileUploaded = await upload_promotional_image(cover);

      if (!fileUploaded?.$id) {
        toast_notif(
          "Something went wrong, please try again or contact IT support",
          "error"
        );

        return;
      }

      let file: { bucketId: string; fileId: string } = {
        bucketId: fileUploaded.bucketId,
        fileId: fileUploaded.$id,
      };

      const data = { ...promotionalData, image: file.fileId };

      const response = await createPromotionalData(data, csrf || "");

      if (!response.isOk) {
        toast_notif(response.message, "error");
        return;
      }

      toast_notif(response.message, "success");

      await queryClient.invalidateQueries({
        queryKey: ["fetch_promotional_data"],
      });

      close();
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-4">
      <div>
        <Input.Label className="text-fluid-xxs font-normal" required>
          Headline
        </Input.Label>
        <Input
          size="md"
          radius="md"
          name="headline"
          placeholder="Enter Promotional Headline"
          onChange={(e) => handleInputChange(e)}
        />
      </div>
      <div>
        <Input.Label className="text-fluid-xxs font-normal" required>
          Promotional content
        </Input.Label>
        <Input
          size="md"
          radius="md"
          name="subheadline"
          placeholder="Enter Promotional content"
          onChange={(e) => handleInputChange(e)}
        />
      </div>
      <div>
        <Input.Label className="text-fluid-xxs font-normal" required>
          CTA (This would be a link to the prootional resource)
        </Input.Label>
        <Input
          onChange={(e) => handleInputChange(e)}
          size="md"
          radius="md"
          name="cta"
          placeholder="Call to action"
        />
      </div>

      <div>
        <Input.Label className="text-fluid-xxs font-normal">
          Upload promotional Image
        </Input.Label>
        <div className="flex flex-col space-y-6 w-full items-center">
          <div className="w-full h-[250px]">
            {cover ? (
              <img
                src={URL.createObjectURL(cover as File)}
                alt="uploaded image"
                width={350}
                height={250}
                className="w-full h-[250px] object-cover object-center mt-2 filter hover:grayscale transition-all duration-200 rounded-lg cursor-not-allowed"
                onClick={() => {
                  setCover(null);
                }}
              />
            ) : (
              <button
                type="button"
                className="w-full h-full border text-fluid-xs grid place-items-center duration-300 border-dark/50 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 hover:border-dark"
                onClick={() => {
                  imagePickerRef.current?.click();
                }}
              >
                <Image className="text-fluid-2xl" />
              </button>
            )}

            <input
              type="file"
              hidden
              ref={imagePickerRef}
              onChange={handleFileChange}
            />
          </div>

          {errorList.length > 0 &&
            errorList.map((error, index) => {
              return (
                <div
                  key={`${index}-error_list`}
                  className="flex items-center gap-x-2"
                >
                  <Ban
                    size={20}
                    color="#ff0000"
                    strokeWidth={1.5}
                    absoluteStrokeWidth
                  />
                  <p className="text-red-600 text-fluid-xs">{error}</p>
                </div>
              );
            })}
        </div>
      </div>

      <div className="flex justify-end gap-x-6 my-8">
        <Button
          onClick={close}
          variant="default"
          className="ring-1 ring-dark border-0"
        >
          Cancel
        </Button>
        <Button
          loading={loading}
          radius={"sm"}
          color="#1a1a1a"
          onClick={handlePromotionalUpload}
        >
          <Text className="text-fluid-xxs font-normal">Add promotional</Text>
        </Button>
      </div>
    </div>
  );
}
