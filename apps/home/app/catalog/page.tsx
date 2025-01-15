import AllArtworks from "./components/AllArtworks";
import Collections from "../features/collections/Collections";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { IndividualSchemaTypes } from "@omenai/shared-types";
import Footer from "@omenai/shared-ui-components/components/footer/Footer";
import AppStoreAd from "../features/appStoreAd/AppStoreAd";
import Filter from "./components/Filter";

export default async function page() {
  const session = await getServerSession();

  return (
    <main className="relative">
      <DesktopNavbar />
      <div className="">
        <Collections isCatalog={true} />
      </div>

      {/* <Hero /> */}
      <div className="">
        <Filter />
        <AllArtworks
          sessionId={
            (session as IndividualSchemaTypes)?.role === "user"
              ? (session as IndividualSchemaTypes)?.user_id
              : undefined
          }
        />
        <AppStoreAd />
        <Footer />
      </div>
    </main>
  );
}
