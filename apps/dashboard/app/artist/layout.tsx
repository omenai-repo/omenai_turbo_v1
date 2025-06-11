"use client";
import { useWindowSize } from "usehooks-ts";
import { OnboardingRequestCompleted } from "./modals/OnboardingRequestCompletedModal";
import NoMobileView from "../components/NoMobileView";
import { useSession } from "@omenai/package-provider/SessionProvider";
import { ArtistSchemaTypes } from "@omenai/shared-types";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { width } = useWindowSize();
  const session = useSession() as ArtistSchemaTypes;
  return (
    <>
      {width < 1024 ? (
        <NoMobileView />
      ) : (
        <>
          <main className="relative">
            {children}
            <OnboardingRequestCompleted />
          </main>
        </>
      )}
    </>
  );
}
