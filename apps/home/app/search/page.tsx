import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { Footer } from "flowbite-react";
import SearchResultWrapper from "./components/SearchResultWrapper";

export default function page() {
  return (
    <div>
      <DesktopNavbar />
      <SearchResultWrapper />
      <Footer />
    </div>
  );
}
