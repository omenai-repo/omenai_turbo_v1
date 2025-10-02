"use client";
import Link from "next/link";
import EditorialsGrid from "./components/EditorialsGrid";
import { useQuery } from "@tanstack/react-query";
import { MdArrowRightAlt } from "react-icons/md";
import { editorial_database } from "@omenai/appwrite-config/appwrite";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";

export default function Editorials() {
  const { data: editorials, isLoading } = useQuery({
    queryKey: ["fetch_editorials"],
    queryFn: async () => {
      const response = await editorial_database.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      });

      console.log(response);

      if (response?.rows) {
        return response.rows;
      } else throw new Error("Something went wrong");
    },
    refetchOnWindowFocus: false,
    staleTime: 30 * 60 * 1000, // Data is fresh for 5 minutes
    gcTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
    refetchOnMount: false, // Don't refetch if we have cached data
  });

  if (isLoading) return <SectionLoaderContainers title="Latest artworks" />;

  return (
    <>
      {editorials && editorials?.length === 0 ? null : (
        <>
          <div className="flex md:flex-row flex-col gap-4 mt-16 mb-5">
            <div className="flex justify-between items-center w-full my-5">
              <div>
                <p className="text-fluid-xs font-normal text-dark border-b border-dark/20 pb-1 my-5 w-fit">
                  Editorial articles
                </p>
                <p className="text-fluid-base sm:text-fluid-md font-semibold text-[#000000] mt-[20px]">
                  Beyond the Canvas: Our Curated Editorials
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <p className="text-fluid-base font-semibold">
                  Unveiling the Stories Behind the Canvas:
                </p>
                <p className="justify-self-end font-normal leading-snug text-fluid-xs">
                  Stories and Perspectives
                </p>
                <p className="justify-self-end font-normal leading-snug text-fluid-xs">
                  from the Art World
                </p>
              </div>
            </div>
          </div>
          <EditorialsGrid editorials={editorials as any} />
        </>
      )}
    </>
  );
}
