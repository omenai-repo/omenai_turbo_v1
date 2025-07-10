import { Indicator, Avatar, Button } from "@mantine/core";
import { getGalleryLogoFileView } from "@omenai/shared-lib/storage/getGalleryLogoFileView";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { ArtistType } from "./ArtistRequestWrapper";

interface SingleArtistRequestType {
  artist: ArtistType;
  tab: "approved" | "pending";
}
export default function ArtistRequest({
  artist,
  tab,
}: SingleArtistRequestType) {
  const image_href = getGalleryLogoFileView(artist.logo as string, 200);

  return (
    <div className="w-full p-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-x-3 items-center">
          <Indicator
            inline
            disabled={tab === "approved"}
            processing={tab === "pending"}
            color="red"
            size={12}
          >
            <Avatar size="lg" radius="sm" src={image_href} />
          </Indicator>
          <div className="flex flex-col">
            <h4 className="text-fluid-xs font-medium">{artist.name}</h4>
            <p className="text-fluid-xxs text-dark/70 font-normal">
              {artist.email}
            </p>
          </div>
        </div>
        {tab === "approved" ? (
          <>
            <Button
              variant="default"
              size="sm"
              radius="xl"
              className="text-fluid-xxs font-normal"
            >
              Block this artist
            </Button>
          </>
        ) : (
          <Link
            href={`/admin/requests/artist/info?id=${artist.artist_id}`}
            className="flex gap-x-3 items-center"
          >
            <Button
              variant="default"
              size="sm"
              radius="xl"
              className="text-fluid-xxs font-normal"
            >
              View Artist Information
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}
