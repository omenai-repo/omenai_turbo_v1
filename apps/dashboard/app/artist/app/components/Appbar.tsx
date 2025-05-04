"use client";

import { useContext } from "react";
import DashboardIndicator from "./DashboardIndicator";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";

export default function Appbar() {
  const { session } = useContext(SessionContext);
  return (
    <>
      <div className="flex justify-between items-center w-full pt-4 sticky top-0 z-10 bg-white ">
        <DashboardIndicator artist_name={(session as ArtistSchemaTypes).name} />
      </div>
    </>
  );
}
