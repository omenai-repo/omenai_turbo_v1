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
      const response = await editorial_database.listDocuments(
        process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
        process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!
      );

      if (response?.documents) {
        return response.documents;
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
                <p className="text-[12px] ring-1 px-3 w-fit py-1 rounded-md ring-dark font-medium text-[#000000] my-5">
                  Editorial articles
                </p>
                <p className="text-fluid-sm sm:text-fluid-md font-bold text-[#000000] mt-[20px]">
                  Beyond the Canvas: Our Curated Editorials
                </p>
              </div>

              <div className="hidden sm:flex flex-col items-end">
                <p className="text-fluid-base font-bold">
                  Unveiling the Stories Behind the Canvas:
                </p>
                <p className="justify-self-end font-medium text-fluid-xxs">
                  Stories and Perspectives
                </p>
                <p className="justify-self-end font-medium text-fluid-xxs">
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
