import { create } from "zustand";
import {
  ArtworkSchemaTypes,
  AddressTypes,
  RouteIdentifier,
} from "@omenai/shared-types";
import { ICity, IState } from "country-state-city";

type ActionStoreTypes = {
  recoveryModal: {
    type: RouteIdentifier | "closed";
    value: boolean;
  };
  updateRecoveryModal: (label: RouteIdentifier | "closed") => void;
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
    shipping_address: Pick<AddressTypes, "country" | "state">;
    order_id: string;
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">;
    status: string;
  };
  updateGalleryOrderActionModalData: (
    buyer: string,
    shipping_address: Pick<AddressTypes, "country" | "state">,
    order_id: string,
    status: "completed" | "processing",
    artwork: Pick<ArtworkSchemaTypes, "pricing" | "title" | "url" | "artist">
  ) => void;
  clearGalleryOrderActionModalData: () => void;

  current_order_id: string;

  order_modal_metadata: {
    art_id: string;
    seller_designation: "artist" | "gallery";
  };

  update_current_order_id: (
    id: string,
    metadata: {
      art_id: string;
      seller_designation: "artist" | "gallery";
    }
  ) => void;

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
  openOnboardingCompletedModal: boolean;
  setOpenOnboardingCompletedModal: (value: boolean) => void;
  completed: string[];
  hydrate: (pages: string[]) => void;
  markCompleted: (page: string) => void;
  isCompleted: (page: string) => boolean;
};

export const actionStore = create<ActionStoreTypes>((set, get) => ({
  recoveryModal: {
    type: "closed",
    value: false,
  },

  updateRecoveryModal: (label: RouteIdentifier | "closed") => {
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
    shipping_address: Pick<AddressTypes, "country" | "state">,
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

  order_modal_metadata: {
    art_id: "",
    seller_designation: "gallery",
  },

  update_current_order_id: (
    id: string,
    metadata: {
      art_id: string;
      seller_designation: "artist" | "gallery";
    }
  ) => {
    set({ current_order_id: id, order_modal_metadata: metadata });
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
  openOnboardingCompletedModal: false,
  setOpenOnboardingCompletedModal: (value: boolean) => {
    set({ openOnboardingCompletedModal: value });
  },

  completed: [],
  hydrate: (pages: string[]) => set({ completed: pages }),
  markCompleted: (page: string) =>
    set((state) => ({
      completed: state.completed.includes(page)
        ? state.completed
        : [...state.completed, page],
    })),
  isCompleted: (page: string) => get().completed.includes(page),
}));
