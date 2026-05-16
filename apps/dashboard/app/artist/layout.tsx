"use client";
import { OnboardingRequestCompleted } from "./modals/OnboardingRequestCompletedModal";
import NoMobileView from "./components/NoMobileView";
import { useDeviceBlock } from "@omenai/shared-hooks/hooks/useDeviceBlock";
export default function ArtistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { shouldBlock, isMounted } = useDeviceBlock();

  if (!isMounted) {
    return null;
  }

  if (shouldBlock) {
    return <NoMobileView />;
  }

  return (
    <main className="relative">
      {children}
      <OnboardingRequestCompleted />
    </main>
  );
}
