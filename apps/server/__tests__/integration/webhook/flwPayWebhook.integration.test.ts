/**
 * Integration tests for POST /api/webhook/flw-pay
 *
 * Strategy:
 * - Global `fetch` is stubbed so we never hit the Flutterwave API.
 * - Workflow triggers, push-notification dispatch and failure emails are mocked
 *   so we focus on the route's own DB logic and HTTP responses.
 * - `FLW_SECRET_HASH` is stubbed via `vi.stubEnv` before each test that needs
 *   a valid signature.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

vi.mock("@omenai/shared-lib/workflow_runs/createWorkflow", () => ({
  createWorkflow: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/payment/sendPaymentFailedMail", () => ({
  sendPaymentFailedMail: vi.fn().mockResolvedValue(undefined),
}));

// record_tax_transaction uses stripe — already mocked in setup.ts, but
// DeviceManagement lookups for push notifications are in the DB (none in these
// tests), so sendPushNotifications is a safe no-op here.

import { POST } from "../../../app/api/webhook/flw-pay/route";
import { createWorkflow } from "@omenai/shared-lib/workflow_runs/createWorkflow";
import { sendPaymentFailedMail } from "@omenai/shared-emails/src/models/payment/sendPaymentFailedMail";

// ── Constants ────────────────────────────────────────────────────────────────

const TEST_SECRET = "flw-integration-test-hash";

// ── Fixture factories ────────────────────────────────────────────────────────

function makeFlwBody(overrides: Record<string, any> = {}) {
  return {
    event: "charge.completed",
    data: {
      id: 99001,
      tx_ref: "TX_HAPPY_001",
      amount: "1500",
      currency: "USD",
      status: "successful",
      ...overrides,
    },
  };
}

function makeVerifiedTransaction(metaOverrides: Record<string, any> = {}, overrides: Record<string, any> = {}) {
  return {
    status: "success",
    data: {
      id: 99001,
      tx_ref: "TX_HAPPY_001",
      amount: "1500",
      currency: "USD",
      status: "successful",
      meta: {
        buyer_email: "buyer@test.com",
        buyer_id: "buyer-001",
        seller_id: "seller-001",
        art_id: "art-001",
        unit_price: "1000",
        shipping_cost: "200",
        tax_fees: "80",
        ...metaOverrides,
      },
      ...overrides,
    },
  };
}

function makeOrder(overrides: Record<string, any> = {}) {
  return {
    artwork_data: {
      title: "Sunset at Harmattan",
      url: "https://cdn.example.com/art001.jpg",
      artist: "Chidi Okafor",
      art_id: "art-001",
      pricing: { usd_price: 1000, shouldShowPrice: "yes" },
      dimensions: { height: "100", width: "80" },
      packaging_type: "rolled",
    },
    buyer_details: {
      id: "buyer-001",
      email: "buyer@test.com",
      name: "Amara Osei",
    },
    seller_details: {
      id: "seller-001",
      email: "seller@test.com",
      name: "Chidi Okafor",
    },
    order_accepted: { status: "accepted" },
    payment_information: { status: "pending" },
    shipping_details: {
      addresses: {
        destination: {
          address_line: "10 Lagos Road",
          city: "Accra",
          country: "Ghana",
          countryCode: "GH",
          state: "Greater Accra",
          stateCode: "GA",
          zip: "00233",
        },
        origin: {
          address_line: "5 Victoria Island",
          city: "Lagos",
          country: "Nigeria",
          countryCode: "NG",
          state: "Lagos",
          stateCode: "LG",
          zip: "101001",
        },
      },
      shipment_information: {
        quote: { tax_calculation_id: "tax-calc-001" },
      },
    },
    seller_designation: "artist",
    ...overrides,
  };
}

function makeArtist(overrides: Record<string, any> = {}) {
  return {
    name: "Chidi Okafor",
    profile_status: "ghost",
    artist_id: "seller-001",
    exclusivity_uphold_status: { isBreached: false, incident_count: 0 },
    ...overrides,
  };
}

function makeRequest(body: object, signature: string = TEST_SECRET) {
  return new Request("http://localhost/api/webhook/flw-pay", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "verif-hash": signature,
    },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  await Promise.all([
    CreateOrder.deleteMany({}),
    AccountArtist.deleteMany({}),
    PaymentLedger.deleteMany({}),
    PurchaseTransactions.deleteMany({}),
  ]);
});

// ── Signature verification ───────────────────────────────────────────────────

describe("POST /api/webhook/flw-pay — signature verification", () => {
  it("returns 403 when verif-hash header is missing", async () => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
    const req = new Request("http://localhost/api/webhook/flw-pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(makeFlwBody()),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(403);
    expect(body.error).toBe("Invalid webhook signature");
  });

  it("returns 403 when signature does not match the secret", async () => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
    const res = await POST(makeRequest(makeFlwBody(), "wrong-signature-xyz"));
    expect(res.status).toBe(403);
  });

  it("returns 403 when FLW_SECRET_HASH env var is not set (empty secret)", async () => {
    vi.stubEnv("FLW_SECRET_HASH", "");
    const res = await POST(makeRequest(makeFlwBody(), TEST_SECRET));
    expect(res.status).toBe(403);
  });

  it("proceeds past signature check when signature matches the secret exactly", async () => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ status: "success", data: { status: "pending" } }),
    }));

    const res = await POST(makeRequest({ event: "charge.completed", data: { id: 1 } }));
    // Not 403 — went past signature check
    expect(res.status).not.toBe(403);
  });
});

// ── Non-charge events ─────────────────────────────────────────────────────────

describe("POST /api/webhook/flw-pay — non-charge events", () => {
  beforeEach(() => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
  });

  it("returns 200 immediately for non-charge.completed events", async () => {
    const res = await POST(makeRequest({ event: "transfer.completed", data: { id: 1 } }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.status).toBe(200);
    // No Flutterwave API call should have been made
    expect(fetch).not.toHaveBeenCalled?.();
  });
});

// ── Pending / failed transaction exits ───────────────────────────────────────

describe("POST /api/webhook/flw-pay — early exits after FLW verification", () => {
  beforeEach(() => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
  });

  it("returns 200 without DB writes when verified status is 'pending'", async () => {
    const verified = makeVerifiedTransaction({}, { status: "pending" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve(verified),
    }));
    await AccountArtist.create(makeArtist());
    await CreateOrder.create(makeOrder());

    const res = await POST(makeRequest(makeFlwBody({ status: "pending" })));

    expect(res.status).toBe(200);
    const ledger = await PaymentLedger.countDocuments({});
    expect(ledger).toBe(0);
  });

  it("sends payment failed email and returns 200 when verified status is 'failed'", async () => {
    const verified = makeVerifiedTransaction({}, { status: "failed", tx_ref: "TX_HAPPY_001", amount: "1500", currency: "USD" });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve(verified),
    }));
    await AccountArtist.create(makeArtist());
    await CreateOrder.create(makeOrder());

    await POST(makeRequest(makeFlwBody({ status: "failed" })));

    expect(sendPaymentFailedMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "buyer@test.com" }),
    );
  });
});

// ── Happy path — new payment ─────────────────────────────────────────────────

describe("POST /api/webhook/flw-pay — happy path", () => {
  beforeEach(async () => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
    await AccountArtist.create(makeArtist());
    await CreateOrder.create(makeOrder());

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve(makeVerifiedTransaction()),
    }));
  });

  it("creates a PaymentLedger entry with provider=flutterwave", async () => {
    const res = await POST(makeRequest(makeFlwBody()));
    expect(res.status).toBe(200);

    const ledger = await PaymentLedger.findOne({ provider: "flutterwave" });
    expect(ledger).not.toBeNull();
    expect(ledger!.provider_tx_id).toBe("99001");
    expect(ledger!.order_id).toBeTruthy();
  });

  it("updates the order payment_information to 'completed'", async () => {
    await POST(makeRequest(makeFlwBody()));

    const order = await CreateOrder.findOne({ "artwork_data.art_id": "art-001" });
    expect(order!.payment_information.status).toBe("completed");
    expect(order!.hold_status).toBeNull();
  });

  it("fires the payment workflow, shipment workflow, invoice workflow and success-mail workflow", async () => {
    await POST(makeRequest(makeFlwBody()));

    const workflowPaths = (createWorkflow as any).mock.calls.map(
      (call: any[]) => call[0],
    );

    expect(workflowPaths).toContain("/api/workflows/payment/handleArtworkPaymentUpdatesByFlw");
    expect(workflowPaths).toContain("/api/workflows/shipment/create_shipment");
    expect(workflowPaths).toContain("/api/workflows/emails/sendPaymentInvoice");
    expect(workflowPaths).toContain("/api/workflows/emails/sendPaymentSuccessMail");
  });

  it("sets payment_fulfillment initial state to 'failed' on ledger before workflows run", async () => {
    await POST(makeRequest(makeFlwBody()));

    const ledger = await PaymentLedger.findOne({ provider: "flutterwave" });
    // Ledger is created before workflows — all steps start as 'failed'
    const { payment_fulfillment } = ledger!;
    expect(payment_fulfillment.transaction_created).toBe("failed");
    expect(payment_fulfillment.sale_record_created).toBe("failed");
    expect(payment_fulfillment.artwork_marked_sold).toBe("failed");
  });
});

// ── Idempotency ───────────────────────────────────────────────────────────────

describe("POST /api/webhook/flw-pay — idempotency", () => {
  beforeEach(async () => {
    vi.stubEnv("FLW_SECRET_HASH", TEST_SECRET);
    await AccountArtist.create(makeArtist());

    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      json: () => Promise.resolve(makeVerifiedTransaction()),
    }));
  });

  it("returns 200 without creating a second ledger entry when payment is already completed", async () => {
    await CreateOrder.create(makeOrder({
      payment_information: { status: "completed" },
    }));

    const res = await POST(makeRequest(makeFlwBody()));

    expect(res.status).toBe(200);
    const count = await PaymentLedger.countDocuments({});
    expect(count).toBe(0);
  });

  it("returns 200 when a PaymentLedger for the same tx already exists as fulfilled", async () => {
    await CreateOrder.create(makeOrder());
    await PaymentLedger.create({
      provider: "flutterwave",
      provider_tx_id: "99001",
      status: "successful",
      payment_date: new Date(),
      amount: 1500,
      currency: "USD",
      order_id: "order-x",
      payment_fulfillment_checks_done: true,
      payment_fulfillment: {
        transaction_created: "done",
        sale_record_created: "done",
        artwork_marked_sold: "done",
        mass_orders_updated: "done",
        seller_wallet_updated: "done",
      },
    });

    const res = await POST(makeRequest(makeFlwBody()));
    expect(res.status).toBe(200);
    // Should not have created a new ledger
    const count = await PaymentLedger.countDocuments({});
    expect(count).toBe(1);
  });

  it("does not process payments when no matching order exists", async () => {
    // No order created — handler should return 200 without any ledger
    const res = await POST(makeRequest(makeFlwBody()));
    expect(res.status).toBe(200);
    const count = await PaymentLedger.countDocuments({});
    expect(count).toBe(0);
  });
});
