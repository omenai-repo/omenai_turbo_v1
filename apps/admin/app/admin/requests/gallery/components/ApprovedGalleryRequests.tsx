import React from "react";
import { GalleryType } from "./RequestWrapper";
import GalleryRequest from "./GalleryRequest";
import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";

export default function ApprovedGalleryRequests({
  galleries,
}: {
  galleries: GalleryType[];
}) {
  return (
    <>
      {galleries.length === 0 ? (
        <NotFoundData />
      ) : (
        <div className="flex flex-col space-y-4">
          {galleries.map((gallery) => {
            return (
              <GalleryRequest
                key={gallery.gallery_id}
                gallery={gallery}
                tab="approved"
              />
            );
          })}
        </div>
      )}
    </>
  );
}
