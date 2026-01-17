"use client";
import { toast } from "sonner";
import AddressForm from "./AddressForm";
import ProductItem from "./ProductItem";
import { fetchUserData } from "@omenai/shared-services/requests/fetchUserData";
import { ArtworkResultTypes } from "@omenai/shared-types";
import Load from "@omenai/shared-ui-components/components/loader/Load";
import DesktopNavbar from "@omenai/shared-ui-components/components/navbar/desktop/DesktopNavbar";
import { fetchSingleArtworkOnPurchase } from "@omenai/shared-services/artworks/fetchSingleArtworkOnPurchase";
import { useQuery } from "@tanstack/react-query";
import { orderStore } from "@omenai/shared-state-store/src/orders/ordersStore";
import { useAuth } from "@omenai/shared-hooks/hooks/useAuth";

export default function PurchaseComponentWrapper({ slug }: { slug: string }) {
  const { user } = useAuth({ requiredRole: "user" });
  const { set_address_on_order, address } = orderStore();

  const { data: artwork, isLoading: loading } = useQuery({
    queryKey: ["fetch_artwork_on purchase"],
    queryFn: async () => {
      const [userData, artwork] = await Promise.all([
        fetchUserData(user.id),
        fetchSingleArtworkOnPurchase(slug),
      ]);

      if (!userData?.isOk || !artwork?.isOk) {
        toast.error("Error notification", {
          description: "Something went wrong, please try again later",
          style: {
            background: "red",
            color: "white",
            borderRadius: "0px", // Sharp corners for errors
          },
        });
        throw new Error("Something went wrong");
      } else {
        set_address_on_order(userData.data.address);
        return artwork.data;
      }
    },
  });

  if (loading) {
    return (
      <div className="h-screen w-full grid place-items-center bg-white">
        <Load />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-dark">
      <DesktopNavbar />

      {/* LEDGER LAYOUT: Split screen with vertical divider */}
      <div className="container mx-auto px-6 lg:px-12 pt-12 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-24">
          {/* LEFT COLUMN: THE CONTRACT (Address Form) */}
          <div className="lg:col-span-7 lg:border-r lg:border-neutral-200 lg:pr-12">
            <div className="mb-8">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-400">
                Step 01 / 02
              </span>
              <h1 className="font-serif text-4xl italic text-dark mt-2">
                Shipping & Acquisition Details.
              </h1>
            </div>

            <AddressForm
              availability={(artwork as ArtworkResultTypes).availability}
              userAddress={address}
              author_id={(artwork as ArtworkResultTypes).author_id}
              art_id={(artwork as ArtworkResultTypes).art_id}
              role_access={(artwork as ArtworkResultTypes).role_access}
            />
          </div>

          {/* RIGHT COLUMN: THE ASSET (Product Item) - Sticky on Desktop */}
          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <ProductItem artwork={artwork as ArtworkResultTypes} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
