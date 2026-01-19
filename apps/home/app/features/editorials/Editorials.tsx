"use client";
import Link from "next/link";
import EditorialsGrid from "./components/EditorialsGrid";
import { useQuery } from "@tanstack/react-query";
import { MdArrowRightAlt } from "react-icons/md";
import { editorial_database } from "@omenai/appwrite-config/appwrite";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import React from "react";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { GoArrowRight } from "react-icons/go";

export default function Editorials() {
  const { data: editorials, isLoading } = useQuery({
    queryKey: ["fetch_editorials"],
    queryFn: async () => {
      const response = await editorial_database.listRows({
        databaseId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_DATABASE_ID!,
        tableId: process.env.NEXT_PUBLIC_APPWRITE_EDITORIAL_COLLECTION_ID!,
      });

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
          <section className="w-full  bg-[#FDFDFD]">
            <div className="container mx-auto px-6">
              <div className="relative flex flex-col items-start">
                {/* 1. THE EDITORIAL TAG */}
                <div className="flex items-center gap-8 mb-12 w-full">
                  <span className="text-[10px] font-normal tracking-[0.5em] text-neutral-400 uppercase whitespace-nowrap">
                    Omenai Journal — Vol. 01
                  </span>
                  <div className="h-[1px] w-full bg-neutral-100"></div>
                </div>

                {/* 2. THE CONTENT - Using a 2-column editorial spread feel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-baseline">
                  <div className="lg:col-span-8">
                    <h2 className="text-5xl md:text-6xl font-serif text-neutral-900 leading-tight">
                      Beyond the <br />
                      <span className="italic pl-12 md:pl-24">Canvas.</span>
                    </h2>
                  </div>

                  <div className="lg:col-span-4 space-y-6">
                    <p className="text-neutral-500 text-lg font-light leading-relaxed italic">
                      "Art is the only way to run away without leaving home."
                    </p>
                    <p className="text-neutral-600 text-sm md:text-base font-light leading-relaxed">
                      Our editorial team sits down with visionaries, explores
                      the sociology of the market, and uncovers the stories that
                      defined the masterpieces of tomorrow.
                    </p>

                    <div className="pt-4">
                      <button className="group flex items-center gap-3 text-[10px] font-bold tracking-[0.2em] uppercase text-dark">
                        View All Stories
                        <div className="w-8 h-[1px] bg-dark transition-all duration-500 group-hover:w-16"></div>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. THE NAVIGATION HINT - Anchored to the bottom right */}
                <div className="self-end mt-12 flex items-center gap-4">
                  <span className="text-[10px] text-neutral-300 uppercase tracking-widest font-medium">
                    Slide to Read
                  </span>
                  <GoArrowRight className="text-neutral-300 animate-pulse" />
                </div>
              </div>
            </div>
          </section>
          <EditorialsGrid editorials={editorials as any} />
        </>
      )}
    </>
  );
}
