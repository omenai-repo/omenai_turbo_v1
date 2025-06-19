import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { Footer } from "flowbite-react";
import SearchResultWrapper from "./components/SearchResultWrapper";
import { Suspense } from "react";

export default function page() {
  return (
    <div>
      <DesktopNavbar />
      <Suspense>
        <SearchResultWrapper />
      </Suspense>

      <Footer />
    </div>
  );
}
