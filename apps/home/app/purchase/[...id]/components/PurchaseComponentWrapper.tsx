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
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";

export default function PurchaseComponentWrapper({ slug }: { slug: string }) {
  const { session } = useContext(SessionContext);
  const { set_address_on_order, address } = orderStore();
  // const [redirect_uri, set_redirect_uri] = useLocalStorage(
  //   "redirect_uri_on_login",
  //   ""
  // );
  // const [address, setAddress] = useState<IndividualAddressTypes>({
  //   address_line: "",
  //   city: "",
  //   country: "",
  //   state: "",
  //   zip: "",
  // });

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
        set_address_on_order(user.data.address);
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
    <>
      <DesktopNavbar />

      <div className="grid place-items-center h-screen w-full">
        <div className="relative h-full container">
          <div className="grid-cols-1 grid md:grid-cols-2 xl:grid-cols-3 md:gap-x-8 lg:gap-x-16 gap-y-8">
            <div className="col-span-1 xl:col-span-2 border-1 border-dark/10 pt-6">
              <DeliveryMethod />
              <hr className="border-1 border-dark/10 my-12" />
              <AddressForm
                availability={(artwork as ArtworkResultTypes).availability}
                userAddress={address}
                author_id={(artwork as ArtworkResultTypes).author_id}
                art_id={(artwork as ArtworkResultTypes).art_id}
              />
            </div>
            <div className="cols-span-1">
              <ProductItem artwork={artwork as ArtworkResultTypes} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
