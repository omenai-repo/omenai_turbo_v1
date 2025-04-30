import { AddressTypes, ArtworkSchemaTypes } from "@omenai/shared-types";
import { create } from "zustand";

type ArtistActionStoreTypes = {
  artist_sidebar: boolean;
  toggle_artist_sidebar: () => void;
  sales_activity_year: string;
  set_sales_activity_year: (year: string) => void;
  artistOrderActionModalData: {
    buyer: string;
    shipping_address: Pick<AddressTypes, "country" | "state">;
    order_id: string;
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">;
    status: string;
  };
  updateArtistOrderActionModalData: (
    buyer: string,
    shipping_address: Pick<AddressTypes, "country" | "state">,
    order_id: string,
    status: "completed" | "processing",
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">
  ) => void;
  clearArtistOrderActionModalData: () => void;
  current_order_id: string;
  update_current_order_id: (id: string) => void;
  openDeclineOrderModal: boolean;
  toggleDeclineOrderModal: (value: boolean) => void;

  deleteArtistAccountModalPopup: boolean;
  updateDeleteArtistAccountModalPopup: (value: boolean) => void;
  passwordModalPopup: boolean;
  updatePasswordModalPopup: (value: boolean) => void;
  withdrawalFormPopup: boolean;
  toggleWithdrawalFormPopup: (value: boolean) => void;
  walletPinPopup: boolean;
  toggleWalletPinPopup: (value: boolean) => void;
};

const now = new Date();

export const artistActionStore = create<ArtistActionStoreTypes>((set, get) => ({
  artist_sidebar: false,
  toggle_artist_sidebar: () => {
    const current_state = get().artist_sidebar;
    set({ artist_sidebar: !current_state });
  },
  sales_activity_year: now.getFullYear().toString(),
  set_sales_activity_year: (year: string) => {
    set({ sales_activity_year: year });
  },
  artistOrderActionModalData: {
    buyer: "",
    shipping_address: {
      country: "",
      state: "",
    },
    order_id: "",
    artwork: {
      title: "",
      url: "",
      pricing: { price: 0, usd_price: 0, shouldShowPrice: "", currency: "" },
      artist: "",
    },
    status: "",
  },
  updateArtistOrderActionModalData: (
    buyer: string,
    shipping_address: Pick<AddressTypes, "country" | "state">,
    order_id: string,
    status: "completed" | "processing",
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">
  ) => {
    set({
      artistOrderActionModalData: {
        buyer,
        shipping_address,
        order_id,
        artwork,
        status,
      },
    });
  },

  clearArtistOrderActionModalData: () => {
    set({
      artistOrderActionModalData: {
        buyer: "",
        shipping_address: {
          country: "",
          state: "",
        },
        order_id: "",
        artwork: {
          title: "",
          url: "",
          pricing: {
            price: 0,
            usd_price: 0,
            shouldShowPrice: "",
            currency: "",
          },
          artist: "",
        },
        status: "",
      },
    });
    set({ current_order_id: "" });
  },
  current_order_id: "",
  update_current_order_id: (id: string) => {
    set({ current_order_id: id });
  },
  openDeclineOrderModal: false,
  toggleDeclineOrderModal: (value: boolean) => {
    set({ openDeclineOrderModal: value });
  },
  deleteArtistAccountModalPopup: false,
  updateDeleteArtistAccountModalPopup: (value: boolean) => {
    set({ deleteArtistAccountModalPopup: value });
  },
  passwordModalPopup: false,
  updatePasswordModalPopup: (value: boolean) => {
    set({ passwordModalPopup: value });
  },
  withdrawalFormPopup: false,
  toggleWithdrawalFormPopup: (value: boolean) => {
    set({ withdrawalFormPopup: value });
  },
  walletPinPopup: false,
  toggleWalletPinPopup: (value: boolean) => {
    set({ walletPinPopup: value });
  },
}));
