import { InvoiceTypes } from "@omenai/shared-types";

export const meta = {
  art_id: "ddb13ea2-8ff8-416a-b1bb-46106d3c0169",
  artwork_name: "All by myself",
  buyer_email: "dantereus1@gmail.com",
  buyer_id: "6112636c-ec83-48f2-a7a8-d9f1c9e44b4c",
  commission: "1003",
  seller_email: "dantereus1@gmail.com",
  seller_id: "d0a5bff5-cca6-4e82-873d-f9865b6aacb5",
  seller_name: "Visage of Beauty",
  shipping_cost: "435.32",
  tax_fees: "0",
  type: "purchase",
  unit_price: "5013.7",
};
export const paymentIntent = {
  id: "pi_3Slc5JGdH9BZcJwp1eVhUgQ1",
  object: "payment_intent",
  amount: 544902,
  amount_capturable: 0,
  amount_details: {
    shipping: { amount: 0, from_postal_code: null, to_postal_code: null },
    tax: { total_tax_amount: 0 },
    tip: {},
  },
  amount_received: 544902,
  application: null,
  application_fee_amount: 143806,
  automatic_payment_methods: null,
  canceled_at: null,
  cancellation_reason: null,
  capture_method: "automatic_async",
  client_secret: "pi_3Slc5JGdH9BZcJwp1eVhUgQ1_secret_znCM7JbeUPHaGQaEXATIsPyfU",
  confirmation_method: "automatic",
  created: 1767474605,
  currency: "usd",
  customer: null,
  customer_account: null,
  description: null,
  excluded_payment_method_types: null,
  last_payment_error: null,
  latest_charge: "py_3Slc5JGdH9BZcJwp1y15Ig5f",
  livemode: false,
  metadata: {
    art_id: "ddb13ea2-8ff8-416a-b1bb-46106d3c0169",
    artwork_name: "All by myself",
    buyer_email: "dantereus1@gmail.com",
    buyer_id: "6112636c-ec83-48f2-a7a8-d9f1c9e44b4c",
    commission: "1003",
    seller_email: "dantereus1@gmail.com",
    seller_id: "d0a5bff5-cca6-4e82-873d-f9865b6aacb5",
    seller_name: "Visage of Beauty",
    shipping_cost: "435.32",
    tax_fees: "0",
    type: "purchase",
    unit_price: "5013.7",
  },
  next_action: null,
  on_behalf_of: null,
  payment_details: {
    customer_reference: null,
    order_reference: "prod_Tj4D9KdhAyEFmf",
  },
  payment_method: "pm_1Slc5IGdH9BZcJwpvvFxRVCp",
  payment_method_configuration_details: null,
  payment_method_options: { link: { persistent_token: null } },
  payment_method_types: ["link"],
  processing: null,
  receipt_email: "dantereus1@gmail.com",
  review: null,
  setup_future_usage: null,
  shipping: null,
  source: null,
  statement_descriptor: null,
  statement_descriptor_suffix: null,
  status: "succeeded",
  transfer_data: { destination: "acct_1SRvKVGpRw7Ix0VI" },
  transfer_group: "group_py_3Slc5JGdH9BZcJwp1y15Ig5f",
};

export const mockInvoice: Omit<
  InvoiceTypes,
  "storage" | "document_created" | "receipt_sent"
> = {
  invoiceNumber: "OMENAI-INV-000042",
  recipient: {
    address: {
      state: "Lagos",
      country: "Nigeria",
      countryCode: "NG",
      stateCode: "LA",
      city: "Ajah",
      zip: "1234565",
      address_line: "21, Ashela Royal Estate, Ogombo, Ajah",
    },

    userId: "user_8f93kdk29sl",
    name: "Aniebiet Philip Umana",
    email: "dantereus1@gmail.com",
  },

  orderId: "order_20260115_9876",

  currency: "USD",

  lineItems: [
    {
      description: "Original Artwork — “Ethereal Forms” (Oil on Canvas)",
      quantity: 1,
      unitPrice: 1200,
    },
    {
      description: "Certificate of Authenticity",
      quantity: 1,
      unitPrice: 0,
    },
  ],

  pricing: {
    unitPrice: 1200,
    shipping: 85,
    taxes: 60,
    discount: 100,
    total: 1245,
  },

  paidAt: new Date("2026-01-15T14:32:00Z"),
};
