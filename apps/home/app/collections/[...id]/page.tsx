import Filter from "./components/filters/Filter";
import { ArtworksListing } from "./components/ArtworksListing";

import Link from "next/link";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { IndividualSchemaTypes } from "@omenai/shared-types";

export default async function page({
  params,
}: {
  params: Promise<{ id: string[] }>;
}) {
  const slug = (await params).id;
  const session = await getServerSession();

  const pageTitleParser = () => {
    let decodedId = decodeURIComponent(slug[0]);
    return decodedId;
  };

  return (
    <main>
      <DesktopNavbar />
      <div className="h-full w-full text-black pt-10 pb-5 px-4 md:px-8">
        <h1 className="text-lg lg:text-xl font-normal">{pageTitleParser()}</h1>
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
      </div>
      <div>
        <Filter medium={slug[0]} />
        <div className="px-0 md:px-4">
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
