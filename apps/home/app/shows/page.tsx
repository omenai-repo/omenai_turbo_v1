import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { AllShowsClient } from "./components/AllShowsClient";

export const metadata = {
  title: "Exhibitions | Omenai",
  description: "Browse current, upcoming, and past gallery exhibitions.",
};

export default function AllShowsPage() {
  return (
    <section>
      <DesktopNavbar />
      <main className="min-h-screen bg-white pb-12">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          <AllShowsClient />
        </div>
      </main>
    </section>
  );
}
