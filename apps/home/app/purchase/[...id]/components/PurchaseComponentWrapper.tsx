"use client";
import { useState, useContext } from "react";
import { toast } from "sonner";
import AddressForm from "./AddressForm";
import DeliveryMethod from "./DeliveryMethod";
import ProductItem from "./ProductItem";
import { fetchUserData } from "@omenai/shared-services/requests/fetchUserData";
import { SessionContext } from "@omenai/package-provider/SessionProvider";
import {
  ArtworkResultTypes,
  IndividualAddressTypes,
  IndividualSchemaTypes,
} from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { fetchSingleArtworkOnPurchase } from "@omenai/shared-services/artworks/fetchSingleArtworkOnPurchase";
import { useQuery } from "@tanstack/react-query";

export default function PurchaseComponentWrapper({ slug }: { slug: string }) {
  const { session } = useContext(SessionContext);
  // const [redirect_uri, set_redirect_uri] = useLocalStorage(
  //   "redirect_uri_on_login",
  //   ""
  // );
  const [address, setAddress] = useState<IndividualAddressTypes>({
    address_line: "",
    city: "",
    country: "",
    state: "",
    zip: "",
  });

  const { data: artwork, isLoading: loading } = useQuery({
    queryKey: ["fetch_artwork_on purchase"],
    queryFn: async () => {
      const user = await fetchUserData(
        (session as IndividualSchemaTypes)?.user_id
      );
      const artwork = await fetchSingleArtworkOnPurchase(slug);
      if (!user?.isOk || !artwork?.isOk) {
        toast.error("Error notification", {
          description: user?.message,
          style: {
            background: "red",
            color: "white",
          },
          className: "class",
        });
        throw new Error("Something went wrong");
      } else {
        setAddress(user.data.address);
        return artwork.data;
      }
    },
  });

  if (loading) {
    return (
      <div className="h-[90vh] w-full grid place-items-center">
        <Load />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <DesktopNavbar />
      <div className="grid-cols-1 grid md:grid-cols-2 xl:grid-cols-3 p-5 md:gap-x-8 lg:gap-x-16 gap-y-8">
        <div className="col-span-1 xl:col-span-2 border border-dark/10 px-5 pt-12">
          <DeliveryMethod />
          <AddressForm
            availability={(artwork as ArtworkResultTypes).availability}
            userAddress={address}
            gallery_id={(artwork as ArtworkResultTypes).gallery_id}
            art_id={(artwork as ArtworkResultTypes).art_id}
          />
        </div>
        <div className="cols-span-1">
          <ProductItem artwork={artwork as ArtworkResultTypes} />
        </div>
      </div>
    </div>
  );
}
