import { Modal, Button, Group, Paper, Card, Text, Image } from "@mantine/core";
import { Badge } from "lucide-react";
import { GalleryType } from "./RequestWrapper";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";

export function GalleryInfoModal({
  opened,
  close,
  gallery,
}: {
  opened: boolean;
  close: () => void;
  gallery: GalleryType;
}) {
  const image_href = getGalleryLogoFileView(gallery.logo as string, 200);
  console.log(image_href);
  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Gallery Information"
        centered
        className="font-bold text-center"
      >
        <Paper>
          <Card padding="lg" radius="md" withBorder>
            <Card.Section>
              <Image
                src={image_href}
                height={160}
                alt={`${gallery.name} logo`}
                className="max-h-[250px]"
              />
            </Card.Section>

            <div className="text-left py-6">
              <div className="flex flex-col space-y-2">
                <p className="text-fluid-xs text-dark font-normal">
                  Gallery Name: {gallery.name}
                </p>
                <p className="text-fluid-xs text-dark font-normal">
                  Email: {gallery.email}
                </p>
                <p className="text-fluid-xs text-dark font-normal">
                  Admin: {gallery.admin}
                </p>
                <p className="text-fluid-xs text-dark font-normal">
                  Address: {gallery.address.state}, {gallery.address.country}
                </p>
              </div>
            </div>
          </Card>
        </Paper>
      </Modal>
    </>
  );
}
