import React from "react";
import AllGalleriesDirectory from "./GalleriesWrapper";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";

export default function page() {
  return (
    <>
      <DesktopNavbar />
      <AllGalleriesDirectory />
    </>
  );
}
