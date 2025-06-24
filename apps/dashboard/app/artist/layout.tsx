"use client";
import { useWindowSize } from "usehooks-ts";
import { OnboardingRequestCompleted } from "./modals/OnboardingRequestCompletedModal";
import NoMobileView from "../components/NoMobileView";

export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { width } = useWindowSize();
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
