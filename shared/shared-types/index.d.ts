import { JWTPayload } from "jose";

declare module "next-auth" {
  interface Session {
    user: UserType;
  }

  interface JWT {
    uid: string;
  }
}

export type UserType = JWTPayload &
  (
    | Omit<GallerySchemaTypes, "password">
    | Omit<IndividualSchemaTypes, "password">
    | Omit<AccountAdminSchemaTypes, "password">
    | Omit<ArtistSchemaTypes, "password">
  );

type DataRoleTypes = "artist" | "gallery" | "user" | "admin";

export type ArtistSchemaTypes = {
  name: string;
  email: string;
  password: string;
  artist_id: string;
  verified: boolean;
  artist_verified?: boolean;
  logo?: string | null;
  bio?: string;
  address?: IndividualAddressTypes;
  bio_video_link?: string | null;
  algo_data_id?: string | null;
  role: DataRoleTypes;
  wallet_id?: string | null;
  categorization?: ArtistCategorization;
};

export type ArtistAlgorithmDataSchemaTypes = {};

export type GallerySchemaTypes = {
  name: string;
  email: string;
  password: string;
  gallery_id: string;
  admin: string;
  location: GalleryLocation;
  description: string;
  gallery_verified: boolean;
  verified: boolean;
  role: DataRoleTypes;
  logo?: string;
  subscription_active: boolean;
  status: "active" | "blocked";
  connected_account_id: string | null;
};

export type IndividualSchemaTypes = {
  name: string;
  email: string;
  password: string;
  user_id: string;
  preferences: string[];
  verified: boolean;
  role: DataRoleTypes;
  address?: IndividualAddressTypes;
};

export type InputProps = {
  label: string;
  labelText: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  buttonType?: "button" | "submit";
  buttonText?: "Next" | "Submit";
  onClick?: () => void;
  id?: number;
  onClickPrev?: () => void;
};

export type ArtistSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  bio: string;
};

export type IndividualSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};
export type AdminSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type GallerySignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  country: string;
  admin: string;
  description: string;
  logo: File | null;
};

export type GalleryLocation = {
  address: string;
  country: string;
};

export type IndividualRegisterData = Omit<
  IndividualSignupData,
  "confirmPassword"
> & {
  preferences: string[];
};

export type GalleryRegisterData = Pick<
  GallerySignupData,
  "name" | "admin" | "email" | "password" | "description"
> & {
  location: GalleryLocation;
  logo: string;
};

export type RouteIdentifier = "individual" | "gallery";

export type Form = {
  email: string;
  password: string;
};

export type IndividualAddressTypes = {
  address_line: string;
  city: string;
  country: string;
  state: string;
  zip: string;
  [key: string]: string;
};

export type ArtworkSchemaTypes = {
  artist: string;
  year: number;
  title: string;
  medium: string;
  rarity: string;
  materials: string;
  dimensions: ArtworkDimensions;
  url: string;
  pricing: ArtworkPricing;
  art_id: string;
  gallery_id: string;
  impressions?: number;
  like_IDs?: string[];
  artist_birthyear: string;
  artist_country_origin: string;
  certificate_of_authenticity: string;
  artwork_description?: string;
  framing: string;
  signature: string;
  should_show_on_sub_active?: boolean;
  availability: boolean;
};

export type ArtworkDimensions = {
  width: string;
  height: string;
  depth?: string;
  weight: string;
};

export type ArtworkPricing = {
  price: number;
  usd_price: number;
  currency: string;
  shouldShowPrice: "Yes" | "No" | string;
};

export type ArtworkPriceFilterData = {
  "pricing.price": number;
  "pricing.usd_price": number;
  "pricing.shouldShowPrice": string;
  "pricing.currency": string;
};

export type ArtworkResultTypes = ArtworkSchemaTypes & {
  _id: string;
  updatedAt: string;
  createdAt: string;
};

export type ArtworkUploadStateTypes = {
  artist: string;
  year: number;
  title: string;
  medium: string;
  rarity: string;
  materials: string;
  height: string;
  width: string;
  depth?: string;
  weight: string;
  price: number;
  usd_price: number;
  shouldShowPrice: "Yes" | "No" | string;
  artist_birthyear: string;
  artist_country_origin: string;
  certificate_of_authenticity: string;
  artwork_description?: string;
  framing: string;
  signature: string;
  currency: string;
};

export type CreateOrderModelTypes = {
  createdAt: string | number | Date;
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "artist" | "pricing" | "title" | "url" | "art_id"
  > & { _id: ObjectId };
  buyer: {
    name: string;
    email: string;
    user_id: string;
    _id: ObjectId;
  };
  gallery_details: {
    id: string;
    email: string;
    name: string;
  };
  gallery_id: string;
  order_id: string;
  status: string;
  shipping_address: IndividualAddressTypes;
  shipping_quote: ShippingQuoteTypes;
  payment_information: PaymentStatusTypes;
  tracking_information: TrackingInformationTypes;
  order_accepted: OrderAcceptedStatusTypes;
  delivery_confirmed: boolean;
  availability: boolean;
};

export type OrderAcceptedStatusTypes = {
  status: "accepted" | "declined" | "";
  reason?: string;
};
export type TrackingInformationTypes = {
  tracking_id: string;
  tracking_link: string;
};
export type PaymentStatusTypes = {
  status: "pending" | "completed";
  transaction_value: string;
  transaction_date: string;
  transaction_reference: string;
};

export type ShippingQuoteTypes = {
  package_carrier: string;
  shipping_fees: string;
  taxes: string;
  additional_information?: string;
};

export type LockModelTypes = {
  lock_id: string;
  user_id: string;
  art_id: string;
};

interface Image {
  bucketId: string;
  fileId: string;
}

export type GalleryProfileUpdateData = {
  location?: string;
  admin?: string;
  description?: string;
};
export type IndividualProfileUpdateData = {
  name?: string;
  preferences?: string[];
};

export type InputData = {
  author: string;
  date: Date;
  tag?: string;
  summary: string;
  slug: string;
  cover?: File;
  content: string;
  title: string;
  minutes: string;
};

export type Input = {
  label: string;
  description: string;
  placeholder: string;
  type: string;
  name: string;
  register?: UseFormRegister<FieldValues>;
  onchange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  value?: string;
  disabled?: boolean;
};

interface Image {
  bucketId: string;
  fileId: string;
}

export type EditorialFormData = {
  title: string;
  summary?: string;
  slug?: string;
  minutes?: string;
  content: string;
};

export type WalletModelSchemaTypes = {
  owner_id: string;
  wallet_id: string;
  available_balance: number;
  withdrawable_balance: number;
};

export type PurchaseTransactionModelSchemaTypes = {
  trans_id: string;
  trans_reference: string;
  trans_amount: string;
  trans_owner_id: string;
  trans_owner_role: "user" | "gallery";
  trans_gallery_id: string;
  trans_type: "purchase_payout" | "subscription";
  trans_date: Date;
};

export type SubscriptionTransactionModelSchemaTypes = {
  trans_id: string;
  reference: string;
  amount: string;
  gallery_id: string;
  type: "purchase_payout" | "subscription";
  date: Date;
};

export type SubscriptionModelSchemaTypes = {
  customer: {
    id: number;
    name: string;
    phone_number?: string;
    email: string;
    created_at: string;
    gallery_id: string;
  };
  start_date: Date;
  expiry_date: Date;
  status: "active" | "canceled" | "expired";
  card: SubscriptionCardDetails;
  payment: SubscriptionPaymentTypes;
  plan_details: {
    type: string;
    value: { monthly_price: string; annual_price: string };
    currency: string;
    interval: "monthly" | "yearly";
  };
  next_charge_params: NextChargeParams;
};

export type NextChargeParams = {
  value: number;
  currency: string;
  type: string;
  interval: string;
  id: string;
};
export type SubscriptionPaymentTypes = {
  status: string;
  value: string;
  trans_ref: string;
  flw_ref: string;
  currency: string;
  type: string;
};

export type SubscriptionTokenizationTypes = {
  amount: number;
  email: string;
  tx_ref: string;
  token: string;
  gallery_id: string;
  plan_id: string;
  plan_interval: string;
};

export type SubscriptionCardDetails = {
  first_6digits: string;
  last_4digits: string;
  issuer: string;
  country: string;
  type: string;
  expiry: string;
  token: string;
};

export type CardInputTypes = {
  card: string;
  cvv: string;
  month: string;
  year: string;
  name: string;
};

export type AdminGalleryListItemTypes = {
  name: string;
  location: GalleryLocation;
  description: string;
  _id: string;
  email: string;
  admin: string;
  logo: string;
  gallery_id: string;
  status: "active" | "blocked";
};

export type PromotionalSchemaTypes = {
  headline: string;
  subheadline: string;
  image: string;
  cta: string;
};

export type EditorialSchemaTypes = {
  title: string;
  link: string;
  cover: string;
  date: Date | null;
  minutes: string;
};

export type PromotionalDataUpdateTypes = {
  headline?: string;
  subheadline?: string;
  cta?: string;
};

export type AccountAdminSchemaTypes = {
  name: string;
  email: string;
  password: string;
  admin_id: string;
  role: DataRoleTypes;
};

export type FLWDirectChargeDataTypes = CardInputTypes & {
  card: string;
  cvv: string;
  month: string;
  year: string;
  tx_ref: string;
  amount: string;
  customer: {
    name: string;
    email: string;
    gallery_id: string;
    plan_id?: string;
    plan_interval?: string;
  };
  redirect: string;
  charge_type: string | null;
};

export type SubscriptionPlanDataTypes = {
  name: string;
  pricing: {
    annual_price: string;
    monthly_price: string;
  };
  plan_id: string;
  currency: string;
  benefits: string[];
};

export type PinAuthorizationData = {
  mode: "pin";
  pin: string;
};

export type AvsAuthorizationData = {
  mode: "avs_noauth";
  country?: string;
  state?: string;
  city?: string;
  zip?: string;
  address?: string;
};
export type filterOptionsType = {
  price: {
    min: number;
    max: number;
  }[];
  year: {
    min: number;
    max: number;
  }[];
  medium: string[];
  rarity: string[];
};

export type ProrationSchemaTypes = {
  gallery_id: string;
  value: number;
};

export type artworkCollectionTypes = "trending" | "curated" | "recent";

export type ArtistAlgorithmSchemaTypes = {
  graduate: boolean;
  mfa: boolean;
  exhibitions: {
    solo: number;
    group: number;
    museum: boolean;
  };
  bienalle: "venice" | "other";
  fairs_feature: boolean;
  musesum_collection_feature: boolean;
};

export type ArtistCategorization =
  | "emerging"
  | "early-mid"
  | "mid"
  | "late-mid"
  | "established"
  | "elite";
