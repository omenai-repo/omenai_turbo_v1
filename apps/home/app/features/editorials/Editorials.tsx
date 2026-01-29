"use client";
import Link from "next/link";
import EditorialsGrid from "./components/EditorialsGrid";
import { useQuery } from "@tanstack/react-query";
import { editorial_database } from "@omenai/appwrite-config/appwrite";
import React from "react";
import { SectionLoaderContainers } from "../loaders/SectionLoaderContainers";
import { IoArrowForward } from "react-icons/io5";
import { Newspaper } from "lucide-react";

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
    staleTime: 30 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
  });

  if (isLoading) return <SectionLoaderContainers title="Loading Journal" />;

  return (
    <>
      {editorials && editorials?.length === 0 ? null : (
        <section className="w-full bg-[#f5f5f5] py-16 md:py-24 border-t border-neutral-200">
          <div className="px-4 lg:px-12">
            {/* 1. MARKETPLACE HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="flex items-center justify-center h-6 w-6 rounded-full bg-[#091830]/10 text-dark ">
                    <Newspaper />
                  </span>
                  <span className="text-xs font-sans font-bold text-dark  tracking-wide uppercase">
                    The Omenai Editorial
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-serif text-dark ">
                  Stories & Insights
                </h2>
                <p className="mt-2 font-sans text-sm text-neutral-500 max-w-lg">
                  In-depth features, market analysis, and conversations with
                  artists.
                </p>
              </div>

              <div className="hidden md:block">
                <Link
                  href="/articles"
                  className="group flex items-center gap-2 text-sm font-sans font-medium text-neutral-500 hover:text-dark  transition-colors"
                >
                  Read All Articles
                  <IoArrowForward className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* 2. BENTO GRID */}
            <EditorialsGrid editorials={editorials as any} />

            {/* Mobile View All */}
            <div className="mt-10 flex md:hidden justify-center">
              <Link
                href="/articles"
                className="w-full py-3 text-center rounded-md border border-neutral-200 text-sm font-sans font-medium text-neutral-800"
              >
                Read All Articles
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
