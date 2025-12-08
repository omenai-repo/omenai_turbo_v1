"use client";
import NextTopLoader from "nextjs-toploader";
import NavigationChipTabs from "./LayoutDesign/NavigationTabs";
import { UpdatePasswordModal } from "./modals/UpdatePasswordModal";
import { DeleteAccountConfirmationModal } from "./modals/DeleteAccountConfirmationMdal";
import { ConfirmOrderDeliveryModal } from "./modals/ConfirmOrderDeliveryModal";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";
import { useTourState } from "@omenai/shared-hooks/hooks/useTourStore";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import { toast_notif } from "@omenai/shared-utils/src/toast_notification";
import { useEffect } from "react";
import { NextStepProvider, NextStep } from "nextstepjs";
export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth({ requiredRole: "user" });

  const steps = [
    {
      tour: "mainTour",
      steps: [
        {
          icon: "👋",
          title: "Welcome",
          content: "Let's get started with NextStep!",
          selector: "#step1",
          showControls: true,
          showSkip: true,
        },
      ],
    },
  ];

  // const { loading, fetchComplete, isCompleted, markCompleted } = useTourState(
  //   user.user_id
  // );

  // useEffect(() => {
  //   if (!loading && !isCompleted("orders")) {
  //     // Run your tour here
  //     // startOrdersTour({
  //     //   onFinish: () => markCompleted("orders"),
  //     //   onSkip: () => markCompleted("orders"),
  //     // });
  //   }
  // }, [loading, isCompleted, markCompleted]);

  return (
    <NextStepProvider>
      <NextStep steps={steps}>
        <div className="2xl:px-12 xl:px-8">
          <NextTopLoader color="#0f172a" height={6} />

          <main className="relative">
            <NavigationChipTabs />
            <UpdatePasswordModal />
            <DeleteAccountConfirmationModal />
            <ConfirmOrderDeliveryModal />

            {children}
          </main>
        </div>
      </NextStep>
    </NextStepProvider>
  );
}
