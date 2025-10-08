import React from "react";
import GalleryRequest from "./GalleryRequest";
import { GalleryType } from "./RequestWrapper";

export default function PendingGalleryRequests({
  galleries,
}: {
  galleries: GalleryType[];
}) {
  return (
    <>
      {galleries.length === 0 ? (
        <div className="h-[80vh] grid place-items-center">
          <div className="flex flex-col items-center gap-1">
            <p className="text-dark text-fluid-xxs font-medium">
              No pending Gallery requests
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
                tab="pending"
              />
            );
          })}
        </div>
      )}
    </>
  );
}
