import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import SearchResultWrapper from "./components/SearchResultWrapper";
import { Suspense } from "react";
import AppStoreAd from "../features/appStoreAd/AppStoreAd";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import Newsletter from "../Newsletter";
export const dynamic = "force-dynamic";
export default function page() {
  return (
    <div>
      <DesktopNavbar />
      <Suspense>
        <SearchResultWrapper />
      </Suspense>
      <AppStoreAd />
      <Newsletter />
      <Footer />
    </div>
  );
}
