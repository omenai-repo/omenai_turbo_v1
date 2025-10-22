import mongoose, { Schema } from "mongoose";
import { CreateOrderModelTypes } from "@omenai/shared-types";
import { generateDigit } from "@omenai/shared-utils/src/generateToken";

// -------------------------------
// 🧩 SUB-SCHEMAS
// -------------------------------

// Address
const AddressSchema = new Schema({
  address_line: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  countryCode: { type: String, required: true },
  state: { type: String, required: true },
  stateCode: { type: String, required: true },
  zip: { type: String, required: true },
});

// Tracking Information
const TrackingInformationSchema = new Schema({
  id: { type: String, default: null },
  link: { type: String, default: null },
  delivery_status: {
    type: String,
    enum: ["In Transit", "Delivered", null],
    default: null,
  },
  delivery_date: { type: Date, default: null },
});

// Shipping Quote
const ShippingQuoteSchema = new Schema({
  fees: { type: Number, required: true },
  taxes: { type: Number, required: true },
});

// Shipment Information
const ShipmentInformationSchema = new Schema({
  carrier: { type: String, required: true },
  shipment_product_code: { type: String, required: true },
  dimensions: {
    length: { type: Number, required: true },
    weight: { type: Number, required: true },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  pickup: {
    additional_information: { type: String, default: "" },
    pickup_max_time: { type: String, default: "" },
    pickup_min_time: { type: String, default: "" },
  },
  planned_shipping_date: { type: String, default: "" },
  estimates: {
    estimatedDeliveryDate: { type: String, default: "" },
    estimatedDeliveryType: { type: String, default: "" },
  },
  tracking: { type: TrackingInformationSchema, required: true },
  quote: { type: ShippingQuoteSchema, required: true },
  waybill_document: { type: String, required: true },
  proof_of_delivery: { type: String, default: null },
});

// Shipping Details
const ShippingDetailsSchema = new Schema({
  addresses: {
    origin: { type: AddressSchema, required: true },
    destination: { type: AddressSchema, required: true },
  },
  delivery_confirmed: { type: Boolean, default: false },
  additional_information: { type: String, default: null },
  shipment_information: { type: ShipmentInformationSchema, required: true },
});

// Hold Status
const HoldStatusSchema = new Schema({
  is_hold: { type: Boolean, required: true },
  hold_end_date: { type: Date, required: true },
});

// Order Accepted Status
const OrderAcceptedSchema = new Schema({
  status: {
    type: String,
    enum: ["accepted", "declined", ""],
    default: "",
  },
  reason: { type: String, default: null },
});

// Payment Information
const PaymentInformationSchema = new Schema({
  status: {
    type: String,
    enum: ["pending", "completed", "processing", "failed"],
    required: true,
  },
  transaction_value: { type: Number, required: true },
  transaction_date: { type: String, required: true },
  transaction_reference: { type: String, required: true },
  artist_wallet_increment: { type: Number, default: null },
});

// Buyer / Seller Details
const OrderPersonDetailsSchema = new Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: AddressSchema, required: true },
  phone: { type: String, required: true },
});

// -------------------------------
// 🧱 MAIN ORDER SCHEMA
// -------------------------------

const CreateOrderSchema = new Schema<CreateOrderModelTypes>(
  {
    artwork_data: {
      type: Schema.Types.Mixed,
      required: true,
    },
    buyer_details: {
      type: OrderPersonDetailsSchema,
      required: true,
    },
    seller_details: {
      type: OrderPersonDetailsSchema,
      required: true,
    },
    order_id: {
      type: String,
      default: () => generateDigit(7),
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["processing", "completed"],
      default: "processing",
      index: true,
    },
    shipping_details: {
      type: ShippingDetailsSchema,
      required: true,
    },
    seller_designation: {
      type: String,
      enum: ["artist", "gallery"],
      required: true,
    },
    exhibition_status: {
      type: Schema.Types.Mixed,
      default: null,
    },
    hold_status: {
      type: HoldStatusSchema,
      default: null,
      index: true,
    },
    payment_information: {
      type: PaymentInformationSchema,
      required: true,
    },
    order_accepted: {
      type: OrderAcceptedSchema,
      required: true,
      index: true,
    },
    availability: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

// -------------------------------
// ✅ MODEL EXPORT
// -------------------------------

export const CreateOrder =
  mongoose.models.CreateOrder ||
  mongoose.model("CreateOrder", CreateOrderSchema);
