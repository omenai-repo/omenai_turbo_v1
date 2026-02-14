"use client";
import { useWindowSize } from "usehooks-ts";

import MobileBlockScreen from "../layout/NoMobileView";
import { DesktopSidebar } from "../layout/features/Sidebar";
import { MobileSidebar } from "../layout/features/MobileLayout";
import { MainContent } from "../layout/features/MainContent";
import { ClientSessionData } from "@omenai/shared-types";
import { AuthGuard } from "@omenai/package-provider/AuthGuard";
export default function LayoutWrapper({
  children,
  initialSessionData,
}: {
  children: React.ReactNode;
  initialSessionData: ClientSessionData | null;
}) {
  const { width } = useWindowSize();
  return (
    <div>
      <>
        {width < 1280 ? (
          <MobileBlockScreen />
        ) : (
          <AuthGuard initialData={initialSessionData}>
            <main className=" w-full h-screen">
              <div className="flex h-full">
                <DesktopSidebar />
                <div className="flex flex-1 flex-col md:ml-16">
                  {/* Mobile header */}
                  <header className="flex items-center gap-4 border-b bg-white px-4 py-3 md:hidden">
                    <MobileSidebar />
                    <span className="text-sm font-medium">Dashboard</span>
                  </header>

                  <MainContent>{children}</MainContent>
                </div>
              </div>
            </main>
          </AuthGuard>
        )}
      </>
    </div>
  );
}
