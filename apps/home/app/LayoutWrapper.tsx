"use client";
import React, { useEffect } from "react";
import posthog from "posthog-js";
import QueryProvider from "@omenai/package-provider/QueryProvider";
import LoginModal from "@omenai/shared-ui-components/components/modal/LoginModal";
import RecoveryModal from "@omenai/shared-ui-components/components/modal/RecoveryModal";
import { OrderReceivedModal } from "@omenai/shared-ui-components/components/modal/OrderConfirmedModal";
import { Analytics } from "@vercel/analytics/react";
import { MantineProvider } from "@mantine/core";
import { SessionProvider } from "@omenai/package-provider";
import LenisProvider from "@omenai/package-provider/ScrollProvider";
import { ClientSessionData } from "@omenai/shared-types";
import { Snowfall } from "react-snowfall";

export const LayoutWrapper = ({
  sessionData,
  children,
}: {
  sessionData: ClientSessionData | null;
  children: React.ReactNode;
}) => {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST as string,
      autocapture: false,
    });
  }, []);

  return (
    <>
      <SessionProvider initialSessionData={sessionData}>
        <QueryProvider>
          <MantineProvider defaultColorScheme="light" forceColorScheme="light">
            <LoginModal />
            <RecoveryModal />
            <OrderReceivedModal />
            <LenisProvider>
              <div className="2xl:px-16 xl:px-8 px-4">{children}</div>
            </LenisProvider>
            <Analytics />
          </MantineProvider>
        </QueryProvider>
      </SessionProvider>
    </>
  );
};
