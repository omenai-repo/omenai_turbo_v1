import { OnboardingRequestCompleted } from "./modals/OnboardingRequestCompletedModal";

export default function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative">
      {children}
      <OnboardingRequestCompleted />
    </main>
  );
}
