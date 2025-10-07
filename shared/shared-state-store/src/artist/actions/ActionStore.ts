import { metadata } from "./../../../../../apps/tracking/app/layout";
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

  order_modal_metadata: {
    is_current_order_exclusive: boolean;
    art_id: string;
    seller_designation: "artist" | "gallery";
  };
  update_current_order_id: (
    id: string,
    metadata: {
      is_current_order_exclusive: boolean;
      art_id: string;
      seller_designation: "artist" | "gallery";
    }
  ) => void;
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
  addressModalPopup: boolean;
  updateAddressModalPopup: (value: boolean) => void;
  address_temp: AddressTypes;
  updateAddress: (key: keyof AddressTypes, value: string) => void;
  clearAddress: () => void;
  logoModalPopup: boolean;
  updateLogoModalPopup: (value: boolean) => void;
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
  order_modal_metadata: {
    is_current_order_exclusive: false,
    art_id: "",
    seller_designation: "artist",
  },
  current_order_id: "",
  update_current_order_id: (
    id: string,
    metadata: {
      is_current_order_exclusive: boolean;
      art_id: string;
      seller_designation: "artist" | "gallery";
    }
  ) => {
    set({ current_order_id: id, order_modal_metadata: metadata });
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
  addressModalPopup: false,
  updateAddressModalPopup: (value: boolean) => {
    set({ addressModalPopup: value });
  },
  address_temp: {
    address_line: "",
    city: "",
    country: "",
    state: "",
    countryCode: "",
    stateCode: "",
    zip: "",
  },
  updateAddress: (key: keyof AddressTypes, value: string) => {
    const address_snapshot = get().address_temp;
    const updatedAddress = {
      ...address_snapshot,
      [key]: value,
    };
    set({ address_temp: updatedAddress });
  },
  clearAddress: () => {
    set({
      address_temp: {
        address_line: "",
        city: "",
        country: "",
        state: "",
        countryCode: "",
        stateCode: "",
        zip: "",
      },
    });
  },
  logoModalPopup: false,
  updateLogoModalPopup: (value: boolean) => {
    set({ logoModalPopup: value });
  },
}));
