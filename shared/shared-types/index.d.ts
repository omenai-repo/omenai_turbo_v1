import { InvoiceLineItemsData } from "./../../node_modules/@omenai/shared-types/index.d";
import { Stripe } from "stripe";
import z from "zod";
// Create discriminated union with role as discriminator
export type SessionDataType = (
  | ({ role: "gallery" } & Omit<
      GallerySchemaTypes,
      "password" | "phone" | "registeration_tracking"
    >)
  | ({ role: "user" } & Omit<
      IndividualSchemaTypes,
      "password" | "phone" | "registeration_tracking"
    >)
  | ({ role: "admin" } & Omit<
      AccountAdminSchemaTypes,
      "password" | "phone" | "registeration_tracking"
    >)
  | ({ role: "artist" } & Omit<
      ArtistSchemaTypes,
      | "password"
      | "art_style"
      | "documentation"
      | "phone"
      | "exclusivity_uphold_status"
      | "pricing_allowances"
      | "registeration_tracking"
    >)
) & { id: string };

type ClientSessionData = {
  isLoggedIn: boolean;
  user: SessionDataType | null;
  csrfToken: string;
};

export type SessionData = {
  userId: string;
  userData: SessionDataType;
  userAgent?: string | null;
};

export type CombinedConfig = {
  maxTokens: number;
  refillRate: number;
  keyGenerator: (request: Request, userId?: string) => Promise<string>;
  keyPrefix?: string;
  allowedRoles?: AccessRoleTypes[];
  allowedAdminAccessRoles?: AdminAccessRoleTypes[];
};

export type AccessRoleTypes = "gallery" | "user" | "admin" | "artist";
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
  clerkUserId?: string;
  exclusivity_uphold_status: Pick<
    ExclusivityUpholdStatus,
    "isBreached" | "incident_count"
  >;
  pricing_allowances: {
    auto_approvals_used: number;
    last_reset_date: Date;
  };
  registeration_tracking: Registeration_Tracking;
};

export type Registeration_Tracking = {
  ip_address: string;
  country: string;
  city: string;
  device_type: string;
  os: string;
  browser: string;
  referrer: string;
};

type ExclusivityUpholdStatus = {
  isBreached: boolean; // Whether artist has breached exclusivity terms
  incident_count: number; // Number of times exclusivity terms have been breached correlating to number of artworks sold in breach of exclusivity
  exclusivity_end_date: Date | null; // Date when exclusivity ends
  exclusivity_type: "exclusive" | "non-exclusive" | null; // Type of exclusivity, attributes to whether artist can sell elsewhere
  order_auto_rejection_count: number; // Number of orders auto-rejected. 3 auto-rejections for a single artwork leads to breach
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
  socials?: { [key: Socials]: string };
};

type Socials =
  | "instagram"
  | "twitter"
  | "linkedin"
  | "behance"
  | "tiktok"
  | "facebook";

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
  subscription_status: SubscriptionStatus;
  status: "active" | "blocked";
  connected_account_id: string | null;
  stripe_customer_id: string | null;
  registeration_tracking: Registeration_Tracking;
};

type SubscriptionStatus = {
  type: "basic" | "premium" | "pro" | null;
  active: boolean;
  discount: {
    active: boolean;
    plan: "pro";
  };
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
  address: AddressTypes;
  registeration_tracking: Registeration_Tracking;
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
  signature: string;
  should_show_on_sub_active?: boolean;
  availability: boolean;
  packaging_type: ArtworkPackagingType;
  role_access: RoleAccess;
  exclusivity_status: {
    exclusivity_type: "exclusive" | "non-exclusive" | null;
    exclusivity_end_date: Date | null;
    order_auto_rejection_count: number;
  };
  image_format: {
    ratio: string;
    orientation: "landscape" | "portrait" | "square";
  };
};

export type RoleAccess = {
  role: "artist" | "gallery";
  designation: ArtistCategory | null;
};

export type ArtworkDimensions = {
  height: string;
  weight: string;
  width: string;
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
  | "Mixed media on canvas"
  | "Oil on canvas/panel";

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
  weight: string;
  price: number;
  usd_price: number;
  shouldShowPrice: "Yes" | "No" | string;
  artist_birthyear: string;
  artist_country_origin: string;
  certificate_of_authenticity: string;
  artwork_description?: string;
  signature: string;
  currency: string;
  packaging_type: ArtworkPackagingType;
};
type ArtworkPackagingType = "rolled" | "stretched";

export type CreateOrderModelTypes = {
  artwork_data: Pick<
    ArtworkSchemaTypes,
    | "artist"
    | "pricing"
    | "title"
    | "url"
    | "art_id"
    | "role_access"
    | "dimensions"
    | "packaging_type"
  > & {
    _id: ObjectId;
    exclusivity_status: Omit<
      ArtworkSchemaTypes["exclusivity_status"],
      "order_auto_rejection_count"
    >;
    deletedEntity: boolean;
  };
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
  exhibition_end_date: Date | string;
  status: "pending" | "scheduled";
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
    carrier: "UPS" | "DHL";
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
    planned_shipping_date: string;
    estimates: {
      estimatedDeliveryDate: string;
      estimatedDeliveryType: string;
    };
    tracking: TrackingInformationTypes;
    quote: ShippingQuoteTypes;
    waybill_document: string;
    proof_of_delivery?: string;
  };
};

export type WaybillCacheTypes = {
  order_id: string;
  pdf_base64: string;
};

export type ScheduledShipments = {
  order_id: string;
  executeAt: Date | string;
  reminderSent: boolean;
  status: "scheduled" | "resolved";
};

export type ShipmentCoords = {
  origin: CoordsType;
  destination: CoordsType;
};
type CoordsType = {
  lat: number;
  lng: number;
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
  id: string | null;
  link: string | null;
  delivery_status: "In Transit" | "Delivered" | null;
  delivery_date: Date | null;
};
export type ShippingQuoteTypes = {
  fees: number;
  taxes: number;
  tax_calculation_id: string;
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

export type VerifyPickupChangePayload = {
  type: string;
  countryCode: string;
  postalCode: string;
  cityName: string;
  countyName: string;
};

export type PriceRequestTypes = {
  request_id: string;
  art_id: string;
  buyer_id: string;
  seller_id: string;

  artwork_snapshot: {
    title: string;
    artist: string;
    url: string;
  };
  funnel_status: {
    requested_at: Date;
    is_order_placed: boolean;
    order_id?: string | null;
    is_order_paid: boolean;
  };
  request_date: Date; // For year and month tracking
  expires_at: Date;
};

export type PaymentStatusTypes = {
  status: "pending" | "completed" | "processing" | "failed";
  transaction_value: number;
  transaction_date: Date;
  transaction_reference: string;
  invoice_reference?: string;
  artist_wallet_increment?: number;
};

export type PaymentLedgerTypes = {
  provider: PurchaseTransactionModelSchemaTypes["provider"];
  provider_tx_id: string;
  status: string;
  payment_date: Date;
  amount: number;
  currency: "USD";
  order_id: string;
  payload: PaymentLedgerPayloadTypes;
  payment_fulfillment: PaymentFulfillmentStatusTypes;
  payment_fulfillment_checks_done: boolean;
  reconciliation_attempts: number;
  needs_manual_review: boolean;
  last_reconciliation_at?: Date;
};

export type MetaSchema = {
  buyer_id: string;
  buyer_email: string;
  seller_email: string;
  seller_name: string;
  seller_id: string;
  artwork_name: string;
  art_id: string;
  shipping_cost: number;
  unit_price: number;
  tax_fees: number;
  seller_designation: string;
};

export type PaymentLedgerPayloadTypes = {
  meta: any;
  paymentObj: any;
  provider: PaymentLedgerTypes["provider"];
  pricing: PurchaseTransactionPricing;
};

export type PaymentFulfillmentStatusTypes = {
  artwork_marked_sold: "done" | "failed";
  transaction_created: "done" | "failed";
  sale_record_created: "done" | "failed";
  mass_orders_updated: "done" | "failed";
  purchase_request_updated: "done" | "failed";
  seller_wallet_updated?: "done" | "failed";
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
  phone?: string;
};

export type ArtistProfileUpdateData = {
  name?: string;
  bio?: string;
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

export type AppwriteImageObject = {
  bucketId: string;
  $id: string;
};

export type EditorialFormData = {
  title: string;
  summary?: string;
  slug: string;
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
  applied_payment_refs: string[];
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
  account_number: string;
  bank_name: string;
  account_name: string;
  bank_id: string;
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
  status: "successful" | "processing" | "failed";
  provider: "flutterwave" | "stripe";
  order_id: string;
  invoice_reference?: string;
  createdBy?: "webhook" | "verification"; // Who created this record
  verifiedAt?: Date; // When verification route processed it
  webhookReceivedAt?: Date; // When webhook received
  webhookConfirmed?: boolean;
};

export type PurchaseTransactionPricing = {
  unit_price: number;
  commission: number;
  shipping_cost: number;
  amount_total: number;
  tax_fees: number;
  currency: string;
  penalty_fee?: number;
};

export type SubscriptionTransactionModelSchemaTypes = {
  trans_id: string;
  payment_ref: string;
  amount: number;
  gallery_id: string;
  date: Date;
  status: "successful" | "failed" | "processing";
  stripe_customer_id: string;
};

export type SubscriptionModelSchemaTypes = {
  customer: {
    name: string;
    phone_number?: string;
    email: string;
    gallery_id: string;
  };
  subscription_id: string;
  stripe_customer_id: string;
  start_date: Date;
  expiry_date: Date;
  status: "active" | "canceled" | "expired" | "incomplete";
  paymentMethod: Stripe.PaymentMethod | null;
  plan_details: {
    type: string;
    value: { monthly_price: string; annual_price: string };
    currency: string;
    interval: "monthly" | "yearly";
  };
  next_charge_params: NextChargeParams;
  upload_tracker: UploadTrackingTypes;
};

export type SubscriptionMetaData = {
  name: string;
  email: string;
  gallery_id: string;
  plan_id: string;
  plan_interval: string;
};

export type UploadTrackingTypes = {
  limit: number;
  next_reset_date: Date | string;
  upload_count: number;
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
  currency: string;
  type: string;
  stripePaymentId: string;
};

export type SubscriptionTokenizationTypes = {
  amount: number;
  email: string;
  tx_ref: string;
  token: string;
  gallery_id: string;
  plan_id: string;
  plan_interval: string;
  redirect?: string;
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
  headline: string;
  summary?: string;
  cover: string;
  date: Date | null;
  content: string;
  slug: string;
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
  verified: boolean;
  access_role: AdminAccessRoleTypes;
  admin_active: boolean;
  joinedAt: string | Date;
};

export type AdminAccessRoleTypes =
  | "Admin"
  | "Owner"
  | "Principal"
  | "Editor"
  | "Viewer";

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
  benefits: {
    annual: string[];
    monthly: string[];
  };
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

export type ArtistCategorizationAnswerTypes = {
  graduate: "yes" | "no";
  mfa: "yes" | "no";
  solo: number;
  group: number;
  museum_collection: "yes" | "no";
  biennale: "venice" | "none" | "other recognized biennale events";
  museum_exhibition: "yes" | "no";
  art_fair: "yes" | "no";
};

export type ArtistCategorizationUpdateDataTypes = {
  answers: ArtistCategorizationAnswerTypes;
  bio: string;
  documentation: ArtistDocumentationTypes;
  artist_id: string;
};
// Shipment Types
export type ShipmentDimensions = {
  length: number;
  width: number;
  height: number;
  weight: number;
};

export type StringShipmentDimensions = {
  length: string;
  width: string;
  height: string;
  weight: string;
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
  artwork_price: number;
  carrier: OrderShippingDetailsTypes["shipment_information"]["carrier"];
};

type ShipmentDeliveryValidation = {
  tracking_id: string;
  estimated_delivery_date: Date | string;
  author_id: string;
  anount_to_inc: number;
};

// NEXUS THRESHOLDS

export type ThresholdTypeDef =
  | "SALES_ONLY"
  | "SALES_OR_TRANSACTIONS"
  | "SALES_AND_TRANSACTIONS"
  | "NO_SALES_TAX";

export type EvaluationPeriodTypeDef =
  | "PREVIOUS_CALENDAR_YEAR"
  | "PREVIOUS_OR_CURRENT_CALENDAR_YEAR"
  | "ROLLING_12_MONTHS"
  | "TWELVE_MONTHS_ENDING_SEPTEMBER_30"
  | "PREVIOUS_12_MONTHS"
  | "PREVIOUS_4_QUARTERS";

// Nexus Rule Interface
export type NexusRule = {
  sales_threshold: number | null;
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
    evaluation_period_type: EvaluationPeriodTypeDef | null;
    effective_date: Date | string | null;
    note?: string;
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

export type BankType = { id: string; code: string; name: string };
export type BankBranchType = {
  id: string;
  branch_code: string;
  branch_name: string;
  swift_code: string;
  bic: string;
  bank_id: string;
};

export type TeamMember = {
  admin_id: string;
  name: string;
  email: string;
  access_role: AdminAccessRoleTypes;
  joinedAt: string;
  verified: boolean;
};

export type NotificationData = {
  id: string;
  title: string;
  body: string;
  data: NotificationDataType;
  sent: boolean;
  sentAt: Date;
  read: boolean;
  readAt: Date;
};

export type NotificationDataType = {
  type: "wallet" | "orders" | "subscriptions" | "updates";
  access_type: "collector" | "gallery" | "artist";
  metadata: T;
  userId: string;
};

export type NotificationPayload = {
  title: NotificationData["title"];
  body: NotificationData["body"];
  data: NotificationData["data"];
  to: string;
};

// types/tracking.ts

// types/tracking.ts
export type TrackingStatus =
  | "CREATED"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "EXCEPTION";

export interface TrackingEvent {
  timestamp: string;
  location: string;
  description: string;
  status_label: TrackingStatus;
}

export interface TrackingData {
  tracking_number: string;
  carrier: "DHL" | "UPS";
  current_status: TrackingStatus;
  estimated_delivery: string | null;
  events: TrackingEvent[];
  // Add other order-specific fields you might be merging
  coordinates?: {
    origin: { lat: number; lng: number };
    destination: { lat: number; lng: number };
  };
  shipping_details?: any; // Keep your existing shape here
}

// export interface TrackingEvent {
//   date: string;
//   time: string;
//   typeCode: string;
//   serviceArea: { code: string; description: string }[];
//   description: string;
//   signedBy?: string;
// }

export interface TrackingDetails {
  id: string;
  service: string;
  origin: AddressTypes;
  destination: AddressTypes;
  status: {
    description: string;
    time: string;
    date: string;
  };
  estimatedDeliveryDate?: string;
  events: TrackingEvent[];
}

export interface TrackingResponse {
  shipments: TrackingDetails[];
}

/*
  ============================================================
  TYPES RELATED TO THE DELETION SERVICE
  ============================================================
*/

export type EntityType = "user" | "artist" | "gallery" | "admin";

export type DeletionRequest = {
  targetId: string; // target user
  initiatedBy: "target" | "admin" | "system"; // user or admin or system initiated
  reason: string;
  status:
    | "requested"
    | "in_progress"
    | "completed"
    | "failed"
    | "cancelled"
    | "tasks_created";
  entityType: Exclude<EntityType, "admin">; // type of entity
  targetEmail: string;
  startedAt?: Date;
  requestedAt: Date;
  gracePeriodUntil: Date; // Deletion process starts at this date
  completedAt?: Date;
  services: DeletionTaskServiceType[]; // references to DeletionTask Service
  metadata?: Record<string, any>;
  requestId: string;
};

export type DeletionTask = {
  requestId: string;
  service: DeletionTaskServiceType; // references deletion service task e.g., 'orders', 'uploads', 'wallet'
  entityId: string; // id to delete
  entityType: Omit<EntityType, "admin">; // type of entity
  status: "pending" | "in_progress" | "done" | "failed";
  attempts: number;
  lastError?: string;
  startedAt?: Date;
  completedAt?: Date;
  idempotencyKey?: string;
  result?: any;
};

export type DeletionTaskServiceType =
  | "order_service" // all order related data
  | "upload_service" // for artwork uploads and related media
  | "wallet_service" // bakes in wallet transaction service
  | "purchase_transaction_service" // for purchase transaction records
  | "account_service" // for user/gallery/artist account data
  | "subscriptions_service" //bakes in prorations service and subscription transaction service
  | "sales_service" // for sales activity records
  | "categorization_service" // for artist categorization data
  | "misc_service"; // miscellaneous service such as device fingerprint and notification_service

export type DeletionRequestBody = {
  id: string;
  reason: string;
};

export type DeletionAuditLog = {
  deletion_request_id: string; // Reference to the corresponding DeletionRequest

  /**
   * Information about the user whose data was deleted
   */
  target_ref: {
    target_id: string; // Internal system identifier (e.g. user_id, artist_id, gallery_id)
    target_email_hash: string; //SHA-256 hash of the user's email or another unique identifier Used for verification without exposing raw PII
  };

  /**
   * Who initiated the deletion
   * - "user" → the user themselves
   * - "admin" → manually triggered by omenai admin
   * - "system" → automatically triggered (e.g. due to account expiry)
   */
  initiated_by: "target" | "admin" | "system";

  /**
   * Summarized results of deletion tasks across different services
   */
  tasks_summary: {
    service: DeletionTaskServiceType; // The service or subsystem name (e.g. "orders", "wallet", "files")
    status: "complete" | "incomplete"; //Status of the deletion task
    note: string; // Note around what happened within the function
    deletedRecordSummary: Record<string, any>; // Number of records deleted within that service
    completed_at?: Date; // When the deletion was completed for this service
    error_message?: string; //Optional error details if task failed
  }[];
  requested_at: Date; // When the deletion request was created

  completed_at?: Date; // When the deletion was fully completed (all tasks done)

  retention_expired_at: Date; // When this audit log should expire (e.g. 3 years from now). Based on Omenai's data retention policy

  signature: string; // HMAC signature to verify record integrity and authenticity. Generated with a signing key
};

// app/onboarding/types.ts

export type QuestionType =
  | "text"
  | "select"
  | "cv"
  | "socials"
  | "confirmation";

export interface OnboardingQuestion {
  question: string;
  type: QuestionType;
  label?: string;
  options?: string[];
}

export type WaitListTypes = {
  waitlistId: string;
  name: string;
  email: string;
  inviteCode?: string;
  isInvited?: boolean;
  inviteAccepted: boolean;
  entity: Exclude<EntityType, "admin">;
  entityId: string;
  referrerKey?: string;
  discount: {
    plan: "pro";
    active: boolean;
    redeemed: boolean;
  } | null;
};

export type InvoiceTypes = {
  invoiceNumber: string;
  recipient: {
    userId: string;
    name: string;
    email: string;
    address: AddressTypes;
  };
  orderId: string;
  currency: string;
  lineItems: InvoiceLineItemsData[];
  pricing: InvoicePriceData;
  paidAt: Date | string;
  storage: InvoiceStorageData;
  document_created: boolean;
  receipt_sent: boolean;
};

export type InvoicePriceData = {
  taxes: number;
  shipping: number;
  unitPrice: number;
  total: number;
  discount: number;
};

export type InvoiceLineItemsData = {
  description: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceStorageData = {
  provider: "appwrite";
  fileId: string;
  url?: string;
};

export type BuyingFrequency = "frequently" | "regularly" | "rarely";
export interface IWaitlistLead extends Document {
  email: string;
  name: string;
  country: string;
  language: string;
  entity: "artist" | "collector";
  kpi: KpiMetrics;
  marketing: Omit<ICampaignVisit, "createdAt">;
  survey: IWaitlistLeadSurveyData;
  survey: IWaitlistLeadSurveyData;
  device: WaitlistCampaignDevice;
  hasConvertedToPaid: boolean;
  createdAt: Date;
}
export type KpiMetrics = {
  collector_type: string | null;
  years_of_collecting?: string | null;
  buying_frequency?: BuyingFrequency;
  age?: string;
  years_of_practice?: string | null;
  formal_education?: "degree" | "workshop" | "self-taught" | null;
};

export type WaitlistCampaignDevice = {
  device: {
    type: string; // 'mobile', 'tablet', 'console', 'smarttv', 'wearable', 'embedded'
    vendor: string; // 'Apple', 'Samsung'
    model: string; // 'iPhone', 'Galaxy S9'
  };
  os: {
    name: string; // 'iOS', 'Android', 'Windows'
    version: string; // '14.0', '10'
  };
  browser: {
    name: string; // 'Chrome', 'Safari'
  };
};
export interface ICampaignVisit extends Document {
  source: string; // utm_source (e.g., 'twitter')
  medium: string; // utm_medium (e.g., 'social')
  campaign: string; // utm_campaign
  referrer: string; // document.referrer
  visitorId: string; // (Optional) To de-duplicate refeshes
  device: WaitlistCampaignDevice;
  createdAt: Date;
}

export type MarketingData = {
  source: string; // utm_source (e.g., 'twitter')
  medium: string; // utm_medium (e.g., 'social')
  campaign: string; // utm_campaign
  referrer: string; // document.referrer
  visitorId: string; // (Optional) To de-duplicate refeshes
};

export type IWaitlistSurveyData = {
  art_discovery_or_share_method: ART_DISCOVERY_METHOD_TYPES;
  current_challenges: CURRENT_CHALLENGES_TYPES;
  app_value_drivers: APP_VALUE_DRIVERS_TYPES;
};

export type IWaitlistSurveyData = {
  art_discovery_or_share_method: ART_DISCOVERY_METHOD_TYPES;
  current_challenges: CURRENT_CHALLENGES_TYPES;
  app_value_drivers: APP_VALUE_DRIVERS_TYPES;
};
export type CURRENT_CHALLENGES_TYPES =
  | "ARTIST_VISIBILITY"
  | "PERSONALIZED_ART_DISCOVERY"
  | "ART_SALES_BALANCE"
  | "PRICE_PROVENANCE_TRANSPARENCY"
  | "LOGISTICS_MANAGEMENT"
  | "ART_OVERWHELM"
  | "OTHER";

export type ART_DISCOVERY_METHOD_TYPES =
  | "SOCIAL_MEDIA"
  | "GALLERIES"
  | "ART_FAIRS"
  | "ONLINE_MARKETPLACES"
  | "PERSONAL_NETWORK"
  | "NO_DISCOVERY_METHOD";

export type APP_VALUE_DRIVERS_TYPES =
  | "ARTIST_DISCOVERY"
  | "SIMPLIFIED_BUY_SELL"
  | "ART_COMMUNITY"
  | "ARTIST_COLLECTOR_CONNECTION"
  | "ART_EDUCATION_CONTEXT"
  | "EARLY_ACCESS";
export interface WaitlistStateData extends Partial<KpiMetrics> {
  name: string;
  email: string;
  language: string;
  country: string;
  art_discovery_or_share_method: ART_DISCOVERY_METHOD_TYPES | null;
  current_challenges: CURRENT_CHALLENGES_TYPES | null;
  app_value_drivers: APP_VALUE_DRIVERS_TYPES | null;
  art_discovery_or_share_method: ART_DISCOVERY_METHOD_TYPES | null;
  current_challenges: CURRENT_CHALLENGES_TYPES | null;
  app_value_drivers: APP_VALUE_DRIVERS_TYPES | null;
}

export type KpiMetrics = {
  collector_type: string | null;
  years_of_collecting?: string | null;
  buying_frequency?: BuyingFrequency;
  age?: string;
  years_of_practice?: string | null;
  formal_education?: "degree" | "workshop" | "self-taught" | null;
};

export type WaitlistCampaignDevice = {
  device: {
    type: string; // 'mobile', 'tablet', 'console', 'smarttv', 'wearable', 'embedded'
    vendor: string; // 'Apple', 'Samsung'
    model: string; // 'iPhone', 'Galaxy S9'
  };
  os: {
    name: string; // 'iOS', 'Android', 'Windows'
    version: string; // '14.0', '10'
  };
  browser: {
    name: string; // 'Chrome', 'Safari'
  };
};

export const SURVEY_VALUE_MAP = {
  CURRENT_CHALLENGES: [
    "ARTIST_VISIBILITY",
    "PERSONALIZED_ART_DISCOVERY",
    "ART_SALES_BALANCE",
    "PRICE_PROVENANCE_TRANSPARENCY",
    "LOGISTICS_MANAGEMENT",
    "ART_OVERWHELM",
    "OTHER",
  ],
  ART_DISCOVERY_METHOD: [
    "SOCIAL_MEDIA",
    "GALLERIES",
    "ART_FAIRS",
    "ONLINE_MARKETPLACES",
    "PERSONAL_NETWORK",
    "NO_DISCOVERY_METHOD",
  ],
  APP_VALUE_DRIVERS: [
    "ARTIST_DISCOVERY",
    "SIMPLIFIED_BUY_SELL",
    "ART_COMMUNITY",
    "ARTIST_COLLECTOR_CONNECTION",
    "ART_EDUCATION_CONTEXT",
    "EARLY_ACCESS",
  ],
} as const;

export type DeletePromise = Promise<
  | {
      success: boolean;
      jobId: string;
      error?: undefined;
    }
  | {
      success: boolean;
      jobId: string;
      error: string;
    }
>;

export type SupportCategory =
  | "GENERAL"
  | "PAYMENT" // Buyer paying for art
  | "ORDER"
  | "SUBSCRIPTION" // Gallery paying Omenai (Billing)
  | "PAYOUT" // Gallery receiving money (Stripe Connect)
  | "WALLET"
  | "AUTH"
  | "UPLOAD"
  | "CHECKOUT";

export type TicketPriority = "LOW" | "NORMAL" | "HIGH" | "CRITICAL";

export type TicketStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface ISupportTicket {
  _id?: string; // MongoDB ID
  userId?: string; // Link to User/Artist/Gallery ID if logged in
  userEmail: string; // REQUIRED: Either from session or typed by Guest
  userType: "GUEST" | "USER" | "ARTIST" | "GALLERY";

  // The Core Issue
  category: SupportCategory;
  subject?: string; // Optional summary (can default to Category name)
  message: string; // The "Description"

  // Context Data (The "Smart" stuff)
  referenceId?: string; // OrderID, TransactionRef, etc.
  pageUrl: string; // Where were they?

  // The Context Container
  meta: {
    referenceType?: string; // e.g. "ORDER_NUMBER", "STRIPE_PAYOUT_ID"
    transactionDate?: string;
    browser?: string; // captured automatically
    device?: string; // captured automatically
    [key: string]: any; // Flexible for future needs (e.g. "upload_error_code")
  };

  // Triage Metadata
  priority: TicketPriority;
  status: TicketStatus;
  ticketId: string; // New Field: e.g., "OM-88421"

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date; // Good for tracking turnaround time later
}

// PRICE REVIEW SYSTEM
// The states the review can be in.
export type PriceReviewStatusType =
  | "PENDING_ADMIN_REVIEW" // Waiting for Omenai admin
  | "PENDING_ARTIST_ACTION" // Admin countered, waiting for Artist
  | "APPROVED_ARTIST_PRICE" // Admin accepted original request
  | "APPROVED_COUNTER_PRICE" // Artist accepted admin's counter
  | "DECLINED_BY_ADMIN" // Admin rejected outright
  | "DECLINED_BY_ARTIST" // Artist rejected counter-offer
  | "AUTO_APPROVED"; // Hit the variance threshold, bypassed admin

// Structured data for the algorithm to eventually learn from
export type JustificationType =
  | "PAST_SALE"
  | "GALLERY_EXHIBITION"
  | "HIGH_COST_MATERIALS"
  | "OTHER";

export type PriceReviewArtistReview = {
  requested_price: number;
  justification_type: JustificationType;
  justification_proof_url?: string; // Optional, but required by UI if PAST_SALE or GALLERY_EXHIBITION
  justification_notes?: string; // The fallback text box for extra context
};

export type AdminPriceReview = {
  counter_offer_price?: number;
  admin_notes?: string; // Internal team notes (e.g., "Link broken")
  decline_reason?: string; // Feedback sent to artist if outright declined
  action_taken_by?: string; // Admin ID for audit trails
  action_date?: Date;
};

export type PriceReviewMetaData = {
  artwork: Omit<
    ArtworkSchemaTypes,
    "art_id" | "availability" | "exclusivity_status"
  >;
  algorithm_recommendation: {
    recommendedPrice: number;
    priceRange: [number, number, number, number, number];
    meanPrice: number;
  };
};

export type PriceReviewRequest = {
  artist_id: string;
  artist_review: PriceReviewArtistReview;
  meta: PriceReviewMetaData;
  review?: AdminPriceReview; // Optional because it doesn't exist when initially created
  status: PriceReviewStatusType;
  createdAt?: Date; // Provided by Mongoose timestamps
  updatedAt?: Date; // Provided by Mongoose timestamps
};

// ==================================================== //
// METRCIS
// ==================================================== //

export type EventType =
  | "page_view"
  | "por_inquiry"
  | "search"
  | "checkout_initiated"
  | "artwork_view"
  | "artist_profile_view"
  | "gallery_profile_view"
  | "artwork_saved";

export interface UserTrackingData {
  ip_address: string;
  country: string;
  city: string;
  device_type: "mobile" | "desktop" | "tablet" | "unknown";
  os: string;
  browser: string;
  referrer: string;
}

export interface PlatformEventSchemaTypes {
  event_type: EventType;
  user_id: string | null; // Nullable for anonymous visitors
  session_id: string; // Group actions by a frontend-generated UUID
  art_id?: string; // Tied to specific artworks (for Price on Request or views)
  entity_id?: string; // Tied to a gallery or artist profile view
  tracking_data: UserTrackingData;
  metadata?: Record<string, any>; // Catch-all for extra data (e.g., search terms)
  createdAt?: Date;
}

// A generic wrapper for all your API responses
export interface ApiResponse<T> {
  isOk?: boolean; // Legacy support for your existing routes
  success?: boolean; // Support for the new routes we just wrote
  message?: string;
  data: T;
}

// A reusable type for Tremor's BarList, DonutChart, and AreaChart data
export interface ChartDataItem {
  name?: string; // For Donut/Bar
  value?: number; // For Donut/Bar
  count?: number; // Legacy fallback
  month?: string; // For AreaChart timeline
  gmv?: number; // For AreaChart timeline
  netRevenue?: number; // For AreaChart timeline
}

export type UserRole = "user" | "artist" | "gallery";

// --- FINANCIAL METRICS (Updated for 2x2 Grid) ---
export interface FinancialMetricsData {
  kpis: {
    realizedGMV: number;
    netPlatformRevenue: number;
    trueAOV: number;
  };
  trendChart: ChartDataItem[];
  funnelChart: ChartDataItem[];
  liabilitiesChart: ChartDataItem[];
}

// --- ACQUISITION METRICS ---

// 1. The new helper interface for our funnel metrics
export interface ActivationMetric {
  count: number;
  percentage: number;
}

// 2. The fully updated Acquisition / Network payload
export interface AcquisitionMetricsData {
  summary: {
    totalCollectors: number;
    totalArtists: number;
    totalGalleries: number;
  };
  waitlist: {
    conversionRate: number | string; // (Note: toFixed() returns a string, so allowing both prevents TS errors)
    converted: number;
    total: number;
  };
  demographics: {
    countries: Record<UserRole, ChartDataItem[]>;
    referrers: Record<UserRole, ChartDataItem[]>;
    devices: Record<UserRole, ChartDataItem[]>;
  };

  // --- NEW: Network Activation Block ---
  activation: {
    collectors: {
      placedOrder: ActivationMetric;
      paidOrder: ActivationMetric;
      repeatBuyer: ActivationMetric;
    };
    artists: {
      hasArtworks: ActivationMetric;
      activeCatalog: ActivationMetric;
      hasSoldArt: ActivationMetric;
    };
    galleries: {
      activeSubscription: ActivationMetric;
      churnedHard: ActivationMetric;
      hasSoldArt: ActivationMetric;
      zeroSaleChurn: ActivationMetric;
    };
  };
}

// --- OPERATIONAL METRICS ---
export interface OperationalMetricsData {
  // 1. Pipeline Velocity
  timeToQuoteHours: number;

  // 2. Collector Friction
  abandonmentRate: number;

  // 3. Supply Friction
  ghostRate: number;
  rejectionRate: number;

  // 4. Raw Totals (Crucial for Tooltips so percentages aren't misleading)
  totals: {
    abandoned: number;
    ghosted: number;
    rejected: number;
    totalOrders: number;
  };

  // 5. Live Actionable Bottlenecks
  activeBottlenecks: {
    inExhibition: number; // status: 'processing', exhibition_status != null, tracking == null
  };
}

// 1. Helper type for the Leaderboard items
export interface ArtworkLeaderboardItem {
  _id: string; // The art_id
  count: number; // Number of views or requests
  title: string;
  artist: string;
  url: string; // The image thumbnail
}

// 3. The Main Engagement Metrics Payload
export interface EngagementMetricsData {
  summary: {
    totalViews: number;
    totalRequests: number;
  };
  funnel: {
    requests: number;
    ordersPlaced: number;
    ordersPaid: number;
    rates: {
      requestToOrder: number; // Intent Velocity
      orderToPaid: number; // Closing Rate
      totalLiquidity: number; // Total Funnel Efficiency
    };
  };
  trends: EngagementTrendItem[];
  leaderboards: {
    topRequested: ArtworkLeaderboardItem[];
    topViewed: ArtworkLeaderboardItem[];
  };
}
export interface EngagementTrendItem {
  year: number;
  month: number;
  requests: number;
  views: number;
  uniqueCollectors: number;
}
