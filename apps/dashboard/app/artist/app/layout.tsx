import Appbar from "./layout/Appbar";
import MainAppSection from "./layout/MainAppSection";
import { OnboardingRequestCompleted } from "../modals/OnboardingRequestCompletedModal";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative bg-[#f5f5f5]">
      <Appbar />
      <MainAppSection>{children}</MainAppSection>
      <OnboardingRequestCompleted />
    </main>
  );
}
