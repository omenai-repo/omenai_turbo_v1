import React, { Suspense } from "react";
import EditArtwork from "./EditArtwork";

export default function page() {
  return (
    <Suspense>
      <EditArtwork />
    </Suspense>
  );
}
