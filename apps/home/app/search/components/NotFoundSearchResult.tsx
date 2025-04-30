"use client";

import NotFoundData from "@omenai/shared-ui-components/components/notFound/NotFoundData";
import { useSearchParams } from "next/navigation";

export default function NotFoundSearchResult() {
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("searchTerm");

  return (
    <>
      <div className="w-full h-[60svh]">
        <div className="px-5 py-8">
          <h1 className="text-fluid-base font-normal text-dark">
            No results found for term{" "}
            <span className="text-blue-600">&apos;{searchTerm}&apos;</span>
          </h1>
          <h2 className="text-fluid-base md:text-fluid-sm lg:text-fluid-md font-normal text-dark">
            Try checking for spelling errors or try another search term.
          </h2>
        </div>
        <hr className=" border-dark/10" />
        <div className="w-full h-[40vh] md:h-[50vh] grid place-items-center">
          <NotFoundData />
        </div>
      </div>
    </>
  );
}
