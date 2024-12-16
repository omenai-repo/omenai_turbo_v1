"use client";

import { fetchSearchKeyWordResults } from "@omenai/shared-services/search/fetchSearchKeywordResults";
import { useSearchParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import NotFoundSearchResult from "./NotFoundSearchResult";
import SearchResultDetails from "./SearchResultDetails";
import {
  ArtworkSchemaTypes,
  IndividualSchemaTypes,
} from "@omenai/shared-types";
import { SessionContext } from "@omenai/package-provider/SessionProvider";

export default function SearchResultWrapper() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("searchTerm");
  const [searchResults, setSearchResults] = useState<
    | (Pick<
        ArtworkSchemaTypes,
        | "art_id"
        | "artist"
        | "pricing"
        | "title"
        | "url"
        | "impressions"
        | "like_IDs"
        | "medium"
        | "rarity"
        | "availability"
      > & { _id: string })[]
    | []
  >([]);

  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    setIsPending(true);
    const getResults = async () => {
      const data = await fetchSearchKeyWordResults(searchTerm as string);
      if (data !== undefined) setSearchResults(data.data);

      if (data === undefined)
        toast.error("Error notification", {
          description:
            "An error has occured, please try again or contact support",
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
      setIsPending(false);
    };

    getResults();
  }, [searchTerm]);

  const { session } = useContext(SessionContext);

  return (
    <>
      <div className="w-full">
        {searchResults.length === 0 ? (
          <NotFoundSearchResult />
        ) : (
          <SearchResultDetails
            data={searchResults}
            searchTerm={searchTerm as string}
            sessionId={
              (session as IndividualSchemaTypes)?.role === "user"
                ? (session as IndividualSchemaTypes)?.user_id
                : undefined
            }
            isPending={isPending}
          />
        )}
      </div>
    </>
  );
}
