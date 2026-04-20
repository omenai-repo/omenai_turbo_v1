import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { AllFairsEventsClient } from "./AllFairEventsClient";

export const metadata = {
  title: "Fairs & Events | Omenai",
  description:
    "Explore current, past, and upcoming art fairs and viewing rooms.",
};

export default function AllFairsEventsPage() {
  return (
    <>
      <DesktopNavbar />
      <main className="min-h-screen bg-white py-8">
        <div className="max-w-[1600px] mx-auto">
          {/* High-level Page Header */}
          <div className="mb-16">
            <h1 className="font-serif text-3xl md:text-4xl text-dark font-normal mb-4">
              Current Fairs & Events
            </h1>
            <p className="font-sans text-sm text-neutral-500 max-w-2xl">
              Discover global art fairs, exclusive digital viewing rooms, and
              time-sensitive gallery events.
            </p>
          </div>

          <AllFairsEventsClient />
        </div>
      </main>
    </>
  );
}
