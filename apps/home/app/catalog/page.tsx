import AllArtworks from "./components/AllArtworks";
import Filter from "./components/Filter";
import Collections from "../features/collections/Collections";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { getServerSession } from "@omenai/shared-utils/src/checkSessionValidity";
import { IndividualSchemaTypes } from "@omenai/shared-types";

export default async function page() {
  const session = await getServerSession();

  return (
    <main className="relative">
      <DesktopNavbar />
      <div className="px-0 md:px-4">
        <Collections />
      </div>

      {/* <Hero /> */}
      <div className="px-4 md:px-8">
        <Filter />
        <AllArtworks
          sessionId={
            (session as IndividualSchemaTypes)?.role === "user"
              ? (session as IndividualSchemaTypes)?.user_id
              : undefined
          }
        />
      </div>
    </main>
  );
}
