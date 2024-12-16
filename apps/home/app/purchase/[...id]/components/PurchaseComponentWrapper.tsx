"use client";

import { usePathname, useSearchParams, notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect, useContext } from "react";
import { toast } from "sonner";
import { useLocalStorage } from "usehooks-ts";
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
import { getApiUrl } from "@omenai/url-config/src/config";

export default function PurchaseComponentWrapper({
  artwork,
}: {
  artwork: ArtworkResultTypes;
}) {
  const router = useRouter();
  const route = usePathname();
  const url = getApiUrl();
  const { session } = useContext(SessionContext);
  const [redirect_uri, set_redirect_uri] = useLocalStorage(
    "redirect_uri_on_login",
    ""
  );
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [address, setAddress] = useState<IndividualAddressTypes>({
    address_line: "",
    city: "",
    country: "",
    state: "",
    zip: "",
  });

  useEffect(() => {
    if (session === null || session === undefined) {
      toast.error("Error notification", {
        description:
          "Unauthorized access detected. Please login to the appropriate account to view this page",
        style: {
          background: "red",
          color: "white",
        },
        className: "class",
      });
      set_redirect_uri(`${url}${route}`);
      router.replace("/auth/login/");
    }
    if (session !== undefined) {
      setIsLoggedIn(true);
      const fetchUser = async () => {
        const user = await fetchUserData(
          (session as IndividualSchemaTypes)?.user_id
        );
        if (user?.isOk) {
          setAddress(user.data.address);
        } else {
          toast.error("Error notification", {
            description: user?.message,
            style: {
              background: "red",
              color: "white",
            },
            className: "class",
          });
        }
      };

      fetchUser();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (!isLoggedIn)
    return (
      <div className="h-[90vh] w-full grid place-items-center">
        <Load />
      </div>
    );

  return (
    <div>
      <div className="relative h-full">
        <DesktopNavbar />
        <div className="grid-cols-1 grid md:grid-cols-2 xl:grid-cols-3 p-5 md:gap-x-8 lg:gap-x-16 gap-y-8">
          <div className="col-span-1 xl:col-span-2 border border-dark/10 px-5 pt-12">
            <DeliveryMethod />
            <AddressForm
              availability={artwork.availability}
              userAddress={address}
              gallery_id={artwork.gallery_id}
              art_id={artwork.art_id}
            />
          </div>
          <div className="cols-span-1">
            <ProductItem artwork={artwork} />
          </div>
        </div>
        {/* <AskForHelp /> */}
      </div>
    </div>
  );
}
