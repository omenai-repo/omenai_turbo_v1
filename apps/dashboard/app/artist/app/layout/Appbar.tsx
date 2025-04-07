"use client";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";
import { IndividualLogo } from "@omenai/shared-ui-components/components/logo/Logo";

export default function Appbar() {
  const session = useSession();

  const name_split = (session as ArtistSchemaTypes).name.split(" ");
  return (
    <div className="w-full p-5 h-[4rem] flex justify-between items-center">
      <IndividualLogo />
      <div className="w-8 h-8 rounded-full bg-dark text-white flex justify-center items-center">
        <span className="font-semibold text-[14px]">
          {name_split[0][0].toUpperCase()}
        </span>
        <span className="font-semibold text-[14px]">
          {name_split[1][0].toUpperCase()}
        </span>
      </div>
    </div>
  );
}
