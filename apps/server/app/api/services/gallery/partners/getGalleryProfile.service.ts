// @omenai/shared-services/gallery/getGalleryProfileLayout.ts

import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { handleErrorEdgeCases } from "../../../../../custom/errors/handler/errorHandler";
import { AddressTypes } from "@omenai/shared-types";

export async function getGalleryProfile(gallery_id: string) {
  try {
    // Fetch only the lightweight fields needed for the Hero and Navigation
    const gallery = (await AccountGallery.findOne(
      { gallery_id },
      "gallery_id name logo address",
    ).lean()) as {
      gallery_id: string;
      name: string;
      logo: string;
      address: AddressTypes;
    } | null;

    if (!gallery) {
      return { isOk: false, message: "Gallery not found" };
    }

    return { isOk: true, data: gallery };
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    return { isOk: false, message: error_response?.message };
  }
}
