import { create } from "zustand";
import {
  ArtworkSchemaTypes,
  AddressTypes,
  RouteIdentifier,
} from "@omenai/shared-types";
import { ICity, IState } from "country-state-city";

type ActionStoreTypes = {
  recoveryModal: {
    type: RouteIdentifier;
    value: boolean;
  };
  updateRecoveryModal: (label: RouteIdentifier) => void;
  openSideNav: boolean;
  updateOpenSideNav: (val: boolean) => void;
  filterModal: boolean;
  toggleFilterModal: (value: boolean) => void;
  openLoginModal: boolean;
  toggleLoginModal: (value: boolean) => void;
  openOrderReceivedModal: boolean;
  toggleOrderReceivedModal: (value: boolean) => void;
  openGalleryOrderActionModal: boolean;
  toggleGalleryOrderActionModal: (value: boolean) => void;
  openUploadTrackingInfoModal: boolean;
  toggleUploadTrackingInfoModal: (value: boolean) => void;
  openUserTrackingInfoModal: boolean;
  toggleUserTrackingInfoModal: (value: boolean) => void;
  openDeclineOrderModal: boolean;
  toggleDeclineOrderModal: (value: boolean) => void;
  openLoginModalRecoveryForm: boolean;
  toggleLoginModalRecoveryForm: (value: boolean) => void;
  selectedCountry: { country: string; code: string };
  setSelectedCountry: (country: string, code: string) => void;
  selectedCityList: ICity[];
  setSelectedCityList: (value: ICity[]) => void;
  selectedStateList: IState[];
  setSelectedStateList: (value: IState[]) => void;

  galleryOrderActionModalData: {
    buyer: string;
    shipping_address: AddressTypes;
    order_id: string;
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">;
    status: string;
  };
  updateGalleryOrderActionModalData: (
    buyer: string,
    shipping_address: AddressTypes,
    order_id: string,
    status: "completed" | "processing",
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">
  ) => void;
  clearGalleryOrderActionModalData: () => void;
  current_order_id: string;
  update_current_order_id: (id: string) => void;
  deletGalleryAccountModal: boolean;
  updateDeleteGalleryAccountModalPopup: (value: boolean) => void;
  passwordModalPopup: boolean;
  updatePasswordModalPopup: (value: boolean) => void;
  deleteUserAccountModal: boolean;
  updateDeleteUserAccountModalPopup: (value: boolean) => void;
  userPasswordModalPopup: boolean;
  userUpdatePasswordModalPopup: (value: boolean) => void;
  confirmOrderDeliveryPopup: { open: boolean; order_id: string };
  updateConfirmOrderDeliveryPopup: (value: boolean, order_id: string) => void;
  curated_preference: string;
  set_curated_preference: (text: string) => void;
  seaDragonZoomableImageViewerUrl: string;
  setSeaDragonZoomableImageViewerUrl: (url: string) => void;
  openSeadragonImageViewer: boolean;
  setOpenSeaDragonImageViewer: (value: boolean) => void;
};

export const actionStore = create<ActionStoreTypes>((set, get) => ({
  recoveryModal: {
    type: "individual",
    value: false,
  },

  updateRecoveryModal: (label: RouteIdentifier) => {
    const modalState = get().recoveryModal;
    set({ recoveryModal: { type: label, value: !modalState.value } });
  },

  openSideNav: false,
  updateOpenSideNav: (val: boolean) => {
    set({ openSideNav: val });
  },

  filterModal: false,
  toggleFilterModal: (value: boolean) => {
    set({ filterModal: value });
  },

  openLoginModal: false,
  toggleLoginModal: (value: boolean) => {
    set({ openLoginModal: value });
  },

  openOrderReceivedModal: false,
  toggleOrderReceivedModal: (value: boolean) => {
    set({ openOrderReceivedModal: value });
  },

  openGalleryOrderActionModal: false,
  toggleGalleryOrderActionModal: (value: boolean) => {
    set({ openGalleryOrderActionModal: value });
  },

  openUploadTrackingInfoModal: false,
  toggleUploadTrackingInfoModal: (value: boolean) => {
    set({ openUploadTrackingInfoModal: value });
  },
  openUserTrackingInfoModal: false,
  toggleUserTrackingInfoModal: (value: boolean) => {
    set({ openUserTrackingInfoModal: value });
  },
  openDeclineOrderModal: false,
  toggleDeclineOrderModal: (value: boolean) => {
    set({ openDeclineOrderModal: value });
  },

  openLoginModalRecoveryForm: false,
  toggleLoginModalRecoveryForm: (value: boolean) => {
    set({ openLoginModalRecoveryForm: value });
  },

  selectedCountry: { country: "", code: "" },
  setSelectedCountry: (country: string, code: string) => {
    set({ selectedCountry: { country, code } });
  },

  selectedCityList: [],
  setSelectedCityList: (value: ICity[]) => {
    set({ selectedCityList: value });
  },
  selectedStateList: [],
  setSelectedStateList: (value: IState[]) => {
    set({ selectedStateList: value });
  },

  galleryOrderActionModalData: {
    buyer: "",
    shipping_address: {
      address_line: "",
      city: "",
      country: "",
      state: "",
      zip: "",
      countryCode: "",
      stateCode: "",
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
  updateGalleryOrderActionModalData: (
    buyer: string,
    shipping_address: AddressTypes,
    order_id: string,
    status: "completed" | "processing",
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">
  ) => {
    set({
      galleryOrderActionModalData: {
        buyer,
        shipping_address,
        order_id,
        artwork,
        status,
      },
    });
  },

  clearGalleryOrderActionModalData: () => {
    set({
      galleryOrderActionModalData: {
        buyer: "",
        shipping_address: {
          address_line: "",
          city: "",
          country: "",
          state: "",
          zip: "",
          countryCode: "",
          stateCode: "",
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
  deletGalleryAccountModal: false,
  updateDeleteGalleryAccountModalPopup: (value: boolean) => {
    set({ deletGalleryAccountModal: value });
  },
  passwordModalPopup: false,
  updatePasswordModalPopup: (value: boolean) => {
    set({ passwordModalPopup: value });
  },

  deleteUserAccountModal: false,
  updateDeleteUserAccountModalPopup: (value: boolean) => {
    set({ deleteUserAccountModal: value });
  },
  userPasswordModalPopup: false,
  userUpdatePasswordModalPopup: (value: boolean) => {
    set({ userPasswordModalPopup: value });
  },
  confirmOrderDeliveryPopup: { open: false, order_id: "" },
  updateConfirmOrderDeliveryPopup: (value: boolean, order_id: string) => {
    set({ confirmOrderDeliveryPopup: { open: value, order_id } });
  },
  curated_preference: "All",
  set_curated_preference: (text: string) => {
    set({ curated_preference: text });
  },
  seaDragonZoomableImageViewerUrl: "",
  setSeaDragonZoomableImageViewerUrl: (url: string) => {
    set({ seaDragonZoomableImageViewerUrl: url });
  },
  openSeadragonImageViewer: false,
  setOpenSeaDragonImageViewer: (value: boolean) => {
    set({ openSeadragonImageViewer: value });
  },
}));
