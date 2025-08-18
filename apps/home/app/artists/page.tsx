import React, { Suspense } from "react";
import ArtistData from "./ArtistData";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <>
      <DesktopNavbar />
      <Suspense>
        <ArtistData />
      </Suspense>
    </>
  );
}
