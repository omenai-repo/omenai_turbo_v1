"use client";
import NextTopLoader from "nextjs-toploader";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { ConfirmOrderDeliveryModal } from "./modals/ConfirmOrderDeliveryModal";

import { NextStepProvider, NextStep } from "nextstepjs";
import { DesktopSidebar } from "./LayoutDesign/Sidebar";
import { MobileSidebar } from "./LayoutDesign/MobileLayout";
import { MainContent } from "./LayoutDesign/MainContent";
import { UpdateAddressModal } from "./modals/UpdateAddressModal";
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextStepProvider>
      <>
        <div className="flex h-screen overflow-hidden">
          <NextTopLoader color="#0f172a" height={6} />

          <DesktopSidebar />

          <div className="flex flex-1 flex-col md:ml-16">
            {/* Mobile header */}
            <header className="flex items-center  gap-4 bg-white py-4 md:hidden">
              <MobileSidebar />
            </header>

            <MainContent>
              <UpdateAddressModal />
              <UpdatePasswordModal />
              <DeleteAccountConfirmationModal />
              <ConfirmOrderDeliveryModal />
              {children}
            </MainContent>
          </div>
        </div>
      </>
    </NextStepProvider>
  );
}
