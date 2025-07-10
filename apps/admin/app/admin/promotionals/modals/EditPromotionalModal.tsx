"use client";
import { Button, Input, Modal } from "@mantine/core";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { useDisclosure } from "@mantine/hooks";
export function EditPromotionalModal() {
  const [opened, { open, close }] = useDisclosure(false);

  return (
    <>
      <Modal opened={opened} onClose={close} title="Authentication">
        {/* Modal content */}
      </Modal>

      <Button variant="default" onClick={open}>
        Open modal
      </Button>
    </>
  );
}
function PromotionalModalForm() {
  const imagePickerRef = useRef<HTMLInputElement>(null);
  const [errorList, setErrorList] = useState<string[]>([]);
  const [cover, setCover] = useState<File | null>(null);
  const acceptedFileTypes = ["jpg", "jpeg", "png"];
  const MAX_SIZE_MB = 5; // e.g., 5MB
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Check if input is actaully an image
    const file = e.target.files?.[0];
    if (!file?.type.startsWith("image/")) return;
    const type = file.type.split("/");

    if (file.size > MAX_SIZE_BYTES) {
      toast.error("Error notification", {
        description: "Image file size exceeds the maximum limit of 5MB.",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }

    if (!acceptedFileTypes.includes(type[1])) {
      toast.error("Error notification", {
        description:
          "File type unsupported. Supported file types are: JPEG, JPG, and PNG",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      return;
    }
    setCover(e.target.files![0]);

    setErrorList([]);
    e.target.value = "";
  };
  return (
    <div className="space-y-4">
      <div>
        <Input.Label className="text-fluid-xxs font-normal" required>
          Headline
        </Input.Label>
        <Input size="md" radius="md" placeholder="Enter Promotional Headline" />
      </div>
      <div>
        <Input.Label className="text-fluid-xxs font-normal" required>
          Promotional content
        </Input.Label>
        <Input size="md" radius="md" placeholder="Enter Promotional content" />
      </div>
      <div>
        <Input.Label className="text-fluid-xxs font-normal">
          CTA (Optional: This would be a link to the promotional resource)
        </Input.Label>
        <Input size="md" radius="md" placeholder="Call to action" />
      </div>
    </div>
  );
}
