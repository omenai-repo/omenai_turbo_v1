/**
 * Integration tests for the Flutterwave payment fulfillment workflow.
 *
 * We test the exported DB-level functions directly — bypassing the Upstash
 * `serve()` wrapper — so every assertion targets real MongoDB state via the
 * in-memory server wired up in setup.ts.
 */

import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { Wallet } from "@omenai/shared-models/models/wallet/WalletSchema";
import { PurchaseTransactions } from "@omenai/shared-models/models/transactions/PurchaseTransactionSchema";
import { SalesActivity } from "@omenai/shared-models/models/sales/SalesActivity";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { PaymentLedger } from "@omenai/shared-models/models/transactions/PaymentLedgerShema";

// The workflow route uses `serve` at module level — stub it so the import works.
vi.mock("@upstash/workflow/nextjs", () => ({
  serve: vi.fn().mockReturnValue({ POST: vi.fn() }),
}));

import {
  handleWalletIncrement,
  createPurchaseTransactionEntry,
  updateSalesRecord,
  updateArtworkRecordAsSold,
} from "../../../app/api/workflows/payment/handleArtworkPaymentUpdatesByFlw/route";

// ── Fixtures ────────────────────────────────────────────────────────────────

function makeWallet(overrides: Record<string, any> = {}) {
  const id = crypto.randomUUID();
  return {
    owner_id: `artist-${id}`,
    wallet_id: `wallet-${id}`,
    base_currency: "USD",
    available_balance: 0,
    pending_balance: 0,
    applied_payment_refs: [],
    ...overrides,
  };
}

function makeArtwork(overrides: Record<string, any> = {}) {
  const id = crypto.randomUUID();
  return {
    artist: "Test Artist",
    year: 2024,
    title: `Artwork ${id}`,
    medium: "Oil on canvas",
    rarity: "unique",
    materials: "Canvas",
    dimensions: { height: "100", width: "80" },
    pricing: { price: 1000, usd_price: 1000, currency: "USD", shouldShowPrice: "yes" },
    author_id: `author-${id}`,
    url: `https://cdn.example.com/${id}.jpg`,
    artist_birthyear: "1990",
    artist_country_origin: "Nigeria",
    certificate_of_authenticity: "yes",
    signature: "yes",
    packaging_type: "rolled",
    role_access: { role: "artist" },
    availability: true,
    ...overrides,
  };
}

function makePricing(overrides: Partial<{
  amount_total: number;
  unit_price: number;
  shipping_cost: number;
  commission: number;
  tax_fees: number;
  currency: string;
  penalty_fee: number;
}> = {}) {
  return {
    amount_total: 1500,
    unit_price: 1000,
    shipping_cost: 200,
    commission: 390,
    tax_fees: 80,
    currency: "USD",
    penalty_fee: 0,
    ...overrides,
  };
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Promise.all([
    Wallet.deleteMany({}),
    PurchaseTransactions.deleteMany({}),
    SalesActivity.deleteMany({}),
    Artworkuploads.deleteMany({}),
    PaymentLedger.deleteMany({}),
  ]);
});

// ── handleWalletIncrement ────────────────────────────────────────────────────

describe("handleWalletIncrement", () => {
  it("credits pending_balance and records the payment ref on success", async () => {
    const wallet = await Wallet.create(makeWallet({ owner_id: "seller-001" }));
    const pricing = makePricing({ amount_total: 1500, commission: 390, tax_fees: 80, shipping_cost: 200, penalty_fee: 0 });
    const expectedIncrement = 1500 - (390 + 0 + 80 + 200); // = 830

    const result = await handleWalletIncrement(pricing, "seller-001", "tx-ref-001");

    expect(result.step).toBe("seller_wallet_updated");
    expect(result.status).toBe("done");

    const updated = await Wallet.findOne({ owner_id: "seller-001" });
    expect(updated!.pending_balance).toBe(expectedIncrement);
    expect(updated!.applied_payment_refs).toContain("tx-ref-001");
  });

  it("is idempotent — skips and returns done if payment ref already applied", async () => {
    await Wallet.create(
      makeWallet({ owner_id: "seller-002", applied_payment_refs: ["tx-ref-dupe"], pending_balance: 500 }),
    );
    const pricing = makePricing();

    const result = await handleWalletIncrement(pricing, "seller-002", "tx-ref-dupe");

    expect(result.status).toBe("done");
    expect(result.reason).toBe("payment_already_applied");

    // Balance must not have changed
    const wallet = await Wallet.findOne({ owner_id: "seller-002" });
    expect(wallet!.pending_balance).toBe(500);
  });

  it("returns failed status when wallet does not exist", async () => {
    const result = await handleWalletIncrement(makePricing(), "non-existent-seller", "tx-ref-new");

    expect(result.step).toBe("seller_wallet_updated");
    expect(result.status).toBe("failed");
    expect(result.reason).toBe("wallet_not_found_or_unexpected_state");
  });

  it("applies penalty_fee in the deduction when breach is present", async () => {
    await Wallet.create(makeWallet({ owner_id: "breached-artist" }));
    // penalty_fee = 100 means the artist loses more
    const pricing = makePricing({ amount_total: 1500, commission: 390, tax_fees: 80, shipping_cost: 200, penalty_fee: 100 });
    const expectedIncrement = 1500 - (390 + 100 + 80 + 200); // = 730

    await handleWalletIncrement(pricing, "breached-artist", "tx-breach-001");

    const wallet = await Wallet.findOne({ owner_id: "breached-artist" });
    expect(wallet!.pending_balance).toBe(expectedIncrement);
  });

  it("does not double-credit when called twice with the same transaction id", async () => {
    await Wallet.create(makeWallet({ owner_id: "seller-dedup" }));
    const pricing = makePricing({ amount_total: 1000, commission: 390, tax_fees: 0, shipping_cost: 0, penalty_fee: 0 });

    await handleWalletIncrement(pricing, "seller-dedup", "tx-dedup");
    await handleWalletIncrement(pricing, "seller-dedup", "tx-dedup"); // second call

    const wallet = await Wallet.findOne({ owner_id: "seller-dedup" });
    // Should only be credited once: 1000 - 390 = 610
    expect(wallet!.pending_balance).toBe(610);
    expect(wallet!.applied_payment_refs.filter((r: string) => r === "tx-dedup")).toHaveLength(1);
  });
});

// ── createPurchaseTransactionEntry ──────────────────────────────────────────

describe("createPurchaseTransactionEntry", () => {
  it("creates a purchase transaction record in the database", async () => {
    const transaction = {
      trans_pricing: makePricing(),
      trans_date: new Date(),
      trans_recipient_id: "seller-001",
      trans_initiator_id: "buyer-001",
      trans_recipient_role: "artist" as const,
      trans_reference: "tx-create-001",
      status: "successful" as const,
      order_id: "order-001",
      createdBy: "webhook" as const,
      webhookReceivedAt: new Date(),
      webhookConfirmed: true,
      provider: "flutterwave" as const,
    };

    const result = await createPurchaseTransactionEntry(transaction);

    expect(result.step).toBe("transaction_created");
    expect(result.status).toBe("done");

    const created = await PurchaseTransactions.findOne({ trans_reference: "tx-create-001" });
    expect(created).not.toBeNull();
    expect(created!.order_id).toBe("order-001");
    expect(created!.trans_recipient_id).toBe("seller-001");
  });

  it("is idempotent — running twice does not duplicate the transaction", async () => {
    const transaction = {
      trans_pricing: makePricing(),
      trans_date: new Date(),
      trans_recipient_id: "seller-idem",
      trans_initiator_id: "buyer-idem",
      trans_recipient_role: "artist" as const,
      trans_reference: "tx-idem-001",
      status: "successful" as const,
      order_id: "order-idem",
      createdBy: "webhook" as const,
      webhookReceivedAt: new Date(),
      webhookConfirmed: true,
      provider: "flutterwave" as const,
    };

    await createPurchaseTransactionEntry(transaction);
    const result = await createPurchaseTransactionEntry(transaction);

    expect(result.status).toBe("done");

    const count = await PurchaseTransactions.countDocuments({ trans_reference: "tx-idem-001" });
    expect(count).toBe(1); // exactly one record
  });

  it("stores provider field correctly", async () => {
    const transaction = {
      trans_pricing: makePricing(),
      trans_date: new Date(),
      trans_recipient_id: "seller-x",
      trans_initiator_id: "buyer-x",
      trans_recipient_role: "artist" as const,
      trans_reference: "tx-provider-check",
      status: "successful" as const,
      order_id: "order-x",
      createdBy: "webhook" as const,
      webhookReceivedAt: new Date(),
      webhookConfirmed: true,
      provider: "flutterwave" as const,
    };

    await createPurchaseTransactionEntry(transaction);

    const record = await PurchaseTransactions.findOne({ trans_reference: "tx-provider-check" });
    expect(record!.provider).toBe("flutterwave");
  });
});

// ── updateSalesRecord ────────────────────────────────────────────────────────

describe("updateSalesRecord", () => {
  it("creates a sales activity record for the seller", async () => {
    const result = await updateSalesRecord("tx-sales-001", 1000, "seller-sales-001");

    expect(result.step).toBe("sale_record_created");
    expect(result.status).toBe("done");

    const record = await SalesActivity.findOne({ trans_ref: "tx-sales-001" });
    expect(record).not.toBeNull();
    expect(record!.id).toBe("seller-sales-001");
    expect(record!.value).toBe(1000);
  });

  it("is idempotent — running twice does not create a duplicate record", async () => {
    await updateSalesRecord("tx-sales-idem", 500, "seller-idem-2");
    const result = await updateSalesRecord("tx-sales-idem", 500, "seller-idem-2");

    expect(result.status).toBe("done");

    const count = await SalesActivity.countDocuments({ trans_ref: "tx-sales-idem" });
    expect(count).toBe(1);
  });

  it("stores the correct month and year on the record", async () => {
    await updateSalesRecord("tx-date-check", 1200, "seller-date");

    const record = await SalesActivity.findOne({ trans_ref: "tx-date-check" });
    const now = new Date();
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    // getCurrentMonthAndYear() returns string values e.g. { month: "May", year: "2026" }
    expect(record!.year).toBe(String(now.getFullYear()));
    expect(record!.month).toBe(monthNames[now.getMonth()]);
  });
});

// ── updateArtworkRecordAsSold ────────────────────────────────────────────────

describe("updateArtworkRecordAsSold", () => {
  it("marks an available artwork as sold (availability = false)", async () => {
    const artwork = await Artworkuploads.create(makeArtwork({ availability: true }));

    const result = await updateArtworkRecordAsSold(artwork.art_id);

    expect(result.step).toBe("artwork_marked_sold");
    expect(result.status).toBe("done");

    const updated = await Artworkuploads.findOne({ art_id: artwork.art_id });
    expect(updated!.availability).toBe(false);
  });

  it("is idempotent — already-sold artwork returns done with 'already_sold' reason", async () => {
    const artwork = await Artworkuploads.create(makeArtwork({ availability: false }));

    const result = await updateArtworkRecordAsSold(artwork.art_id);

    expect(result.step).toBe("artwork_marked_sold");
    expect(result.status).toBe("done");
    expect(result.reason).toBe("already_sold");
  });

  it("returns failed with artwork_not_found when art_id does not exist", async () => {
    const result = await updateArtworkRecordAsSold("nonexistent-art-id");

    expect(result.step).toBe("artwork_marked_sold");
    expect(result.status).toBe("failed");
    expect(result.reason).toBe("artwork_not_found");
  });

  it("clears the Redis cache entry for the sold artwork", async () => {
    const { redis } = await import("@omenai/upstash-config");
    const artwork = await Artworkuploads.create(makeArtwork({ availability: true }));

    await updateArtworkRecordAsSold(artwork.art_id);

    expect(redis.del).toHaveBeenCalledWith(`artwork:${artwork.art_id}`);
  });
});
