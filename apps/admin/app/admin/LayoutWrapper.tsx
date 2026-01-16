"use client";
import { useWindowSize } from "usehooks-ts";

import MobileBlockScreen from "../layout/NoMobileView";
import { DesktopSidebar } from "../layout/features/Sidebar";
import { MobileSidebar } from "../layout/features/MobileLayout";
import { MainContent } from "../layout/features/MainContent";
export default function LayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { width } = useWindowSize();
  return (
    <div>
      <>
        {width < 1280 ? (
          <MobileBlockScreen />
        ) : (
          <div className=" w-full h-screen">
            <main className="flex h-full">
              <DesktopSidebar />
              <div className="flex flex-1 flex-col md:ml-16">
                {/* Mobile header */}
                <header className="flex items-center gap-4 border-b bg-white px-4 py-3 md:hidden">
                  <MobileSidebar />
                  <span className="text-sm font-medium">Dashboard</span>
                </header>

                <MainContent>{children}</MainContent>
              </div>
            </main>
          </div>
        )}
      </>
    </div>
  );
}
