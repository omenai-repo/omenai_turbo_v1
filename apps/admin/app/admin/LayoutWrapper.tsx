"use client";
import NextTopLoader from "nextjs-toploader";
import { useWindowSize } from "usehooks-ts";

import { QueryProvider } from "@omenai/package-provider";
import { Toaster } from "sonner";
import PageLayout from "../layout/PageLayout";
import Appbar from "../layout/Appbar";
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { width } = useWindowSize();
  return (
    <div>
      <>
        <div className=" w-full h-screen">
          <main className="flex h-full">
            <PageLayout />
            <div className="w-full xl:ml-[20rem] md:ml-[15rem] px-5 rounded-xl relative duration-200">
              <Appbar />
              <div className="h-auto rounded-lg relative my-5">{children}</div>
            </div>
          </main>
        </div>
      </>
    </div>
  );
}
