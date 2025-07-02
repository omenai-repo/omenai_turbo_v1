import { Menu, Button, Text, ActionIcon } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  ChartNoAxesGantt,
  Check,
  Ellipsis,
  LockKeyholeOpen,
  Trash,
} from "lucide-react";
import { ActionModals } from "./ActionModals";
import { useState } from "react";
import { GalleryType } from "./RequestWrapper";
import { acceptGalleryVerification } from "@omenai/shared-services/admin/accept_gallery_verification";
import { rejectGalleryVerification } from "@omenai/shared-services/admin/reject_gallery_verification";
export function MenuDropdown({
  tab,
  gallery,
}: {
  tab: "approved" | "rejected" | "pending";
  gallery: GalleryType;
}) {
  const [opened, { open, close }] = useDisclosure(false);

  const [action_tab, set_action_tab] = useState<
    "accept" | "reject" | "unblock"
  >("accept");

  const handleActionClick = (type: "accept" | "reject" | "unblock") => {
    set_action_tab(type);
    open();
  };

  return (
    <>
      <ActionModals
        opened={opened}
        close={close}
        type={action_tab}
        gallery={gallery}
      />

      <Menu disabled={tab === "approved"} shadow="md" width={200}>
        <Menu.Target>
          <ActionIcon
            variant="filled"
            color="#1a1a1a"
            size="lg"
            radius="sm"
            aria-label="Options"
          >
            <Ellipsis size={20} strokeWidth={1.5} absoluteStrokeWidth />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Actions</Menu.Label>
          {tab === "rejected" ? (
            <Menu.Item
              leftSection={
                <LockKeyholeOpen
                  size={20}
                  strokeWidth={1.5}
                  absoluteStrokeWidth
                />
              }
              onClick={() => handleActionClick("unblock")}
            >
              Unblock Gallery
            </Menu.Item>
          ) : (
            <>
              <Menu.Item
                leftSection={
                  <Check size={20} strokeWidth={1.5} absoluteStrokeWidth />
                }
                onClick={() => handleActionClick("accept")}
              >
                Accept Gallery
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={
                  <Trash size={20} strokeWidth={1.5} absoluteStrokeWidth />
                }
                onClick={() => handleActionClick("reject")}
              >
                Reject Gallery
              </Menu.Item>{" "}
            </>
          )}
        </Menu.Dropdown>
      </Menu>
    </>
  );
}
