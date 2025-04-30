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
    | Omit<
        ArtistSchemaTypes,
        "password" | "logo" | "address" | "art_style" | "documentation"
      >
  );

type AccessRoleTypes = "artist" | "gallery" | "user" | "admin";

export type ArtistSchemaTypes = {
  name: string;
  email: string;
  password: string;
  artist_id: string;
  verified: boolean;
  artist_verified: boolean;
  logo: string;
  bio?: string;
  address: AddressTypes;
  phone: string;
  bio_video_link?: string | null;
  algo_data_id?: string | null;
  role: AccessRoleTypes;
  wallet_id?: string | null;
  base_currency: string;
  categorization?: ArtistCategorization;
  art_style: string | string[];
  documentation?: ArtistDocumentationTypes;
  isOnboardingCompleted: boolean;
};

export type ArtistSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  art_style: string | string[];
  address: AddressTypes;
  logo: File | null;
  base_currency: string;
};

export type ArtistDocumentationTypes = {
  cv?: string;
  socials?: { [key?: Socials]: string };
};

type Socials = "instagram" | "twitter" | "linkedin";

export type GallerySchemaTypes = {
  name: string;
  email: string;
  password: string;
  gallery_id: string;
  admin: string;
  address: AddressTypes;
  description: string;
  gallery_verified: boolean;
  verified: boolean;
  role: AccessRoleTypes;
  logo?: string;
  phone?: string;
  subscription_status: {
    type: "basic" | "premium" | "pro" | null;
    active: boolean;
  };
  status: "active" | "blocked";
  connected_account_id: string | null;
};

export type IndividualSchemaTypes = {
  name: string;
  email: string;
  password: string;
  user_id: string;
  phone: string;
  preferences: string[];
  verified: boolean;
  role: AccessRoleTypes;
  address?: AddressTypes;
};

export type InputProps = {
  label: string;
  labelText: string;
  type: HTMLInputTypeAttribute;
  placeholder: string;
  disabled?: boolean;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  buttonType?: "button" | "submit";
  buttonText?: "Continue" | "Submit";
  onClick?: () => void;
  id?: number;
  onClickPrev?: () => void;
};

export type IndividualSignupData = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: AddressTypes;
  phone: string;
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
  address: AddressTypes;
  admin: string;
  phone: string;
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
  address: AddressTypes;
};

export type GalleryRegisterData = Pick<
  GallerySignupData,
  "name" | "admin" | "email" | "password" | "description"
> & {
  address: AddressTypes;
  logo: string;
};

export type ArtistRegisterData = Pick<
  ArtistSignupData,
  "name" | "email" | "password" | "art_style"
> & {
  address: AddressTypes;
  logo: string;
  base_currency: string;
};

export type RouteIdentifier = "individual" | "gallery" | "artist";

export type Form = {
  email: string;
  password: string;
};

export type ArtworkSchemaTypes = {
  artist: string;
  year: number;
  title: string;
  medium: ArtworkMediumTypes | "";
  rarity: string;
  materials: string;
  dimensions: ArtworkDimensions;
  url: string;
  pricing: ArtworkPricing;
  art_id: string;
  author_id: string;
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
  role_access: RoleAccess;
};
export type RoleAccess = {
  role: "artist" | "gallery";
  designation: ArtistCategory | null;
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

export type ArtworkMediumTypes =
  | "Photography"
  | "Works on paper"
  | "Acrylic on canvas/linen/panel"
  | "Mixed media on paper/canvas"
  | "Sculpture (Resin/plaster/clay)"
  | "Oil on canvas/panel"
  | "Sculpture (Bronze/stone/metal)";

export type ArtworkPriceFilterData = {
  "pricing.price": number;
  "pricing.usd_price": number;
  "pricing.shouldShowPrice": string;
  "pricing.currency": string;
};

export type ArtistCategory =
  | "Emerging"
  | "Early Mid-Career"
  | "Mid-Career"
  | "Late Mid-Career"
  | "Established"
  | "Elite";

export type FilterOptions = {
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

export type ArtworkResultTypes = ArtworkSchemaTypes & {
  _id: string;
  updatedAt: string;
  createdAt: string;
};

export type ArtworkUploadStateTypes = {
  artist: string;
  year: number;
  title: string;
  medium: ArtworkMediumTypes | "";
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
  artwork_data: Pick<
    ArtworkSchemaTypes,
    "artist" | "pricing" | "title" | "url" | "art_id" | "role_access"
  > & { _id: ObjectId };
  buyer_details: OrderBuyerAndSellerDetails;
  seller_details: OrderBuyerAndSellerDetails;
  order_id: string;
  status: "processing" | "completed";
  shipping_details: OrderShippingDetailsTypes;
  payment_information: PaymentStatusTypes;
  order_accepted: OrderAcceptedStatusTypes;
  seller_designation: "artist" | "gallery";
  exhibition_status: OrderArtworkExhibitionStatus | null;
  hold_status: HoldStatus;
  createdAt: string;
  updatedAt: string;
  availability: boolean;
  expiresAt: Date | null;
};

type OrderArtworkExhibitionStatus = {
  is_on_exhibition: boolean;
  exhibition_end_date: Date;
};

type HoldStatus = {
  is_hold: boolean;
  hold_end_date: Date;
};

export type OrderShippingDetailsTypes = {
  addresses: {
    origin: AddressTypes;
    destination: AddressTypes;
  };
  delivery_confirmed: boolean;
  additional_information?: string;
  shipment_information: {
    carrier: string;
    shipment_product_code: string;
    dimensions: {
      length: number;
      weight: number;
      width: number;
      height: number;
    };
    pickup: {
      additional_information?: string;
      pickup_max_time: string;
      pickup_min_time: string;
    };
    tracking: TrackingInformationTypes;
    quote: ShippingQuoteTypes;
    waybill_document: string;
  };
};

type OrderBuyerAndSellerDetails = {
  id: string;
  name: string;
  email: string;
  address: AddressTypes;
  phone: string;
};
export type OrderAcceptedStatusTypes = {
  status: "accepted" | "declined" | "";
  reason?: string;
};
export type TrackingInformationTypes = {
  id: string;
  link: string;
};
export type ShippingQuoteTypes = {
  fees: string;
  taxes: string;
};
export type AddressTypes = {
  address_line: string;
  city: string;
  country: string;
  countryCode: string;
  state: string;
  stateCode: string;
  zip: string;
};
export type PaymentStatusTypes = {
  status: "pending" | "completed";
  transaction_value: string;
  transaction_date: string;
  transaction_reference: string;
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
  pending_balance: number;
  primary_withdrawal_account?: WithdrawalAccount | null;
  wallet_currency: string;
  base_currency: string;
  wallet_pin: string | null;
};
export type WalletTransactionModelSchemaTypes = {
  wallet_id: string;
  trans_amount: number;
  trans_status: WalletTransactionStatusTypes;
  trans_date: { year: number; month: number; day: number };
  trans_id: string;
  trans_flw_ref_id: string;
};

export type WalletTransactionStatusTypes =
  | "PENDING"
  | "SUCCESSFUL"
  | "FAILED"
  | "NEW";

export type WithdrawalAccount = {
  account_number: number;
  bank_name: string;
  account_name: string;
  bank_id: number;
  bank_code: string;
  branch: BankBranchType | null;
  bank_country: string;
  beneficiary_id: number;
};

export type PurchaseTransactionModelSchemaTypes = {
  trans_id: string;
  trans_reference: string;
  trans_initiator_id: string;
  trans_recipient_id: string;
  trans_pricing: PurchaseTransactionPricing;
  trans_date: Date;
  trans_recipient_role: "gallery" | "artist";
};

export type PurchaseTransactionPricing = {
  unit_price: number;
  commission: number;
  shipping_cost: number;
  amount_total: number;
  tax_fees: number;
};

export type SubscriptionTransactionModelSchemaTypes = {
  trans_id: string;
  reference: string;
  amount: string;
  gallery_id: string;
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
  address: AddressTypes;
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
  role: AccessRoleTypes;
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

export type ArtworkCollectionTypes = "trending" | "curated" | "recent";

export type ArtistPricingSchemaTypes = {
  categorization: string;
  value_range: {
    min: number;
    max: number;
  };
};

export type ArtistCategory =
  | "Emerging"
  | "Early Mid-career"
  | "Mid-career"
  | "Late Mid-career"
  | "Established"
  | "Elite";

export type ArtistCategorizationAnswerTypes = {
  graduate: "yes" | "no";
  mfa: "yes" | "no";
  solo: number;
  group: number;
  museum_collection: "yes" | "no";
  biennale: "venice" | "other" | "none";
  museum_exhibition: "yes" | "no";
  art_fair: "yes" | "no";
};

type ArtistOnboardingData = {
  bio: string;
  cv: File | null;
  graduate: string;
  mfa: string;
  biennale: "venice" | "other" | "none" | string;
  museum_collection: string;
  art_fair: string;
  museum_exhibition: string;
  solo: string;
  group: string;
  socials: { [K in Socials]?: string };
};

type ArtistCategorizationAlgorithmResult = {
  status: "success" | "error";
  totalPoints: number;
  rating: string;
  error?: string;
  price_range: { min: number; max: number };
};

export type ArtistAlgorithmSchemaTypes = {
  artist_id: string;
  history: ArtistAlgorithmData[] | [];
  current: ArtistAlgorithmData | null;
  request: ArtistAlgorithmData | null;
  id?: string;
};

export type ArtistAlgorithmData = {
  date: Date;
  categorization: {
    artist_categorization: ArtistCategory | "Unknown";
    answers: ArtistCategorizationAnswerTypes;
    price_range: { min: number; max: number };
  };
};

export type ArtistCategorizationUpdateDataTypes = {
  answers: ArtistCategorizationAnswerTypes;
  bio: string;
  documentation: ArtistDocumentationTypes;
  artist_id: string;
};
export type ArtistCategorizationAnswerTypes = {
  graduate: "yes" | "no";
  mfa: "yes" | "no";
  solo: number;
  group: number;
  museum_collection: "yes" | "no";
  biennale: "venice" | "other" | "none";
  museum_exhibition: "yes" | "no";
  art_fair: "yes" | "no";
};

// Shipment Types
export type ShipmentDimensions = {
  length: number;
  width: number;
  height: number;
  weight: number;
};
export type ShipmentAddressValidationType = {
  type: "pickup" | "delivery";
  countryCode: string;
  postalCode: string;
  cityName?: string;
  countyName?: string;
  country?: string;
};

export type ShipmentPickupRequestDataTypes = {
  originCountryCode: string;
  specialInstructions?: string;
  artistDetails: {
    address: AddressTypes;
    email: string;
    phone: string;
    fullname: string;
  };
  shipment_product_code: string;
  dimensions: ShipmentDimensions;
};

export type ShipmentRateRequestTypes = {
  originCountryCode: string;
  originCityName: string;
  originPostalCode: string;
  destinationCountryCode: string;
  destinationCityName: string;
  destinationPostalCode: string;
  weight: number;
  length: number;
  width: number;
  height: number;
};

export type ShipmentRequestDataTypes = {
  originCountryCode: string;
  specialInstructions: string;
  artwork_name: string;
  seller_details: {
    address: AddressTypes;
    email: string;
    phone: string;
    fullname: string;
  };
  shipment_product_code: string;
  dimensions: ShipmentDimensions;
  receiver_address: AddressTypes;
  receiver_data: {
    email: string;
    phone: string;
    fullname: string;
  };
  invoice_number: string;
};

// NEXUS THRESHOLDS

export type ThresholdTypeDef =
  | "SALES_ONLY"
  | "SALES_OR_TRANSACTIONS"
  | "SALES_AND_TRANSACTIONS";

export type EvaluationPeriodTypeDef =
  | "PREVIOUS_CALENDAR_YEAR"
  | "PREVIOUS_OR_CURRENT_CALENDAR_YEAR"
  | "ROLLING_12_MONTHS"
  | "TWELVE_MONTHS_ENDING_SEPTEMBER_30"
  | "PREVIOUS_12_MONTHS";

// Nexus Rule Interface
export type NexusRule = {
  sales_threshold: number;
  transactions_threshold: number | null;
  threshold_type: ThresholdType;
  evaluation_period_type: EvaluationPeriodType;
};

// Nexus Calculation Interface
export type NexusCalculation = {
  total_sales: number;
  total_transactions: number;
  sales_exposure_percentage: number;
  transactions_exposure_percentage: number;
};

// Nexus Schema Interface
export type NexusDocument = {
  state: string;
  stateCode: string;
  nexus_rule: NexusRule;
  calculation: NexusCalculation;
  is_nexus_breached: boolean;
  date_of_breach?: Date | null;
  last_reset?: Date;
  tax_withholding_eligibility: boolean;
};

export type US_NEXUS_THRESHOLD_LIST = {
  state: string;
  stateCode: string;
  nexus_rule: Pick<NexusRule, "sales_threshold" | "transactions_threshold"> & {
    threshold_type: ThresholdTypeDef;
    evaluation_period_type: EvaluationPeriodTypeDef;
  };
};
// CRONS
export type FailedCronJobTypes = {
  jobType: string;
  payload: any;
  reason: string;
  retryCount: number;
  status: "pending" | "reprocessed" | "failed";
  lastAttempted: Date;
  jobId: string;
};

export type BankType = { id: number; code: string; name: string };
export type BankBranchType = {
  id: number;
  branch_code: string;
  branch_name: string;
  swift_code: string;
  bic: string;
  bank_id: number;
};
