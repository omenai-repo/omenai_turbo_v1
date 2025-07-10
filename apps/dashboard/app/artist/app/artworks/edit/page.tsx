import React, { Suspense } from "react";
import EditArtwork from "./EditArtwork";
export const dynamic = "force-dynamic";

export default function page() {
  return (
    <Suspense>
      <EditArtwork />
    </Suspense>
  );
}
