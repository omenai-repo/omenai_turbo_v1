import React from "react";
import { GalleryType } from "./RequestWrapper";
import GalleryRequest from "./GalleryRequest";

export default function ApprovedGalleryRequests({
  galleries,
}: {
  galleries: GalleryType[];
}) {
  return (
    <>
      {galleries.length === 0 ? (
        <div className="h-[80vh] grid place-items-center">
          <div className="flex flex-col items-center gap-1">
            <p className="text-dark text-fluid-xs font-medium">
              No available data
            </p>
          </div>
        </div>
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
