import {
  IndividualRegisterData,
  GallerySignupData,
  AdminSignupData,
  ArtistSignupData,
} from "@omenai/shared-types";
import { z } from "zod";

type SignupDataType =
  | Omit<IndividualRegisterData, "confirmPassword">
  | Omit<GallerySignupData, "confirmPassword">
  | Omit<AdminSignupData, "confirmPassword">
  | Omit<ArtistSignupData, "confirmPassword>">;

// Define your schema
export const SignupSchema = z.object({});
