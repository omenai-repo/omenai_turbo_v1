import Filter from "./components/filters/Filter";
import { ArtworksListing } from "./components/ArtworksListing";

import Link from "next/link";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import { artMediumHistory } from "./artMediumBriefHistory";

type ArtMedium = keyof typeof artMediumHistory;

export default async function page({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const slug = (await params).id;
  const session = await getServerSession();

  const pageTitleParser = () => {
    let decodedId = decodeURIComponent(slug[0]);
    return decodedId as ArtMedium;
  };

  let page_title = pageTitleParser();

  return (
    <main className="">
      <DesktopNavbar />
      <div className=" items-start justify-start w-full">
        {/* banner */}
        <div className="h-full text-black pt-10 pb-5">
          <h1 className="text-lg lg:text-xl font-semibold">
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
              href={`/collections/${slug[0]}`}
              className="text-dark font-semibold hover:underline"
            >
              {pageTitleParser()}
            </Link>
          </div>
          {/* History */}
          <div className="my-4 lg:w-1/2 w-full">
            <p className="text-xs font-medium">
              {artMediumHistory[page_title]}
            </p>
          </div>
        </div>
      </div>

      <div>
        <Filter medium={slug[0]} />
        <div className="">
          <ArtworksListing
            medium={pageTitleParser()}
            sessionId={
              (session as IndividualSchemaTypes)?.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
          />
        </div>
      </div>
    </main>
  );
}
