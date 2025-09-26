"use client";
import Filter from "./components/filters/Filter";
import { ArtworksListing } from "./components/ArtworksListing";
import Link from "next/link";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { artMediumHistory } from "./artMediumBriefHistory";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import {decodeMediumFromUrl} from "@omenai/shared-utils/src/decodeMediumForUrl"
import { ArtworkMediumTypes } from "@omenai/shared-types";

type ArtMedium = keyof typeof artMediumHistory;

export default function CollectionWrapper({ id }: { id: string }) {
  const { user } = useAuth({ requiredRole: "user" });

const pageTitleParser = (): ArtworkMediumTypes | null => {
  const decodedMedium = decodeMediumFromUrl(id);
  
  if (!decodedMedium) {
    console.warn(`No matching medium found for slug: ${id}`);
    return null;
  }
  
  console.log('Decoded medium:', decodedMedium);
  return decodedMedium;
};
console.log(pageTitleParser())

  let page_title = pageTitleParser() as ArtworkMediumTypes

  return (
    <main className="">
      <DesktopNavbar />
      <div className=" items-start justify-start w-full">
        {/* banner */}
        <div className="h-full text-black pt-10 pb-5">
          <h1 className="text-fluid-lg lg:text-fluid-xl font-semibold">
            {pageTitleParser()}
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href={"/collections"}
              className="text-dark font-light hover:underline"
            >
              {" "}
              Collections
            </Link>
            <p>/</p>
            <Link
              href={`/collections/${id}`}
              className="text-dark font-semibold hover:underline"
            >
              {pageTitleParser()}
            </Link>
          </div>
          {/* History */}
          <div className="my-4 lg:w-1/2 w-full">
            <p className="text-fluid-xs font-medium">
              {artMediumHistory[page_title]}
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* <Filter medium={id} /> */}
        <div className="">
          <ArtworksListing
            medium={pageTitleParser() || ""}
            sessionId={user ? user.id : undefined}
          />
        </div>
      </div>
    </main>
  );
}
