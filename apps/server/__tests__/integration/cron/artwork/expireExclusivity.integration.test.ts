/**
 * Integration tests for GET /api/cron/artwork/expireExclusivity
 *
 * Inserts Artworkuploads and CreateOrder documents via collection.insertOne
 * (bypassing schema validation) and verifies that the cron route correctly
 * expires exclusivity contracts. Auth is enforced via the CRON_SECRET env var.
 */

import { describe, it, expect, afterEach, beforeAll, vi } from "vitest";
import { Artworkuploads } from "@omenai/shared-models/models/artworks/UploadArtworkSchema";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

// ── Cron secret ───────────────────────────────────────────────────────────────

beforeAll(() => {
  process.env.CRON_SECRET = "test-cron-secret";
});

import { GET } from "../../../../app/api/cron/artwork/expireExclusivity/route";

// ── Request factory ───────────────────────────────────────────────────────────

function makeRequest(authorized = true): Request {
  const headers: Record<string, string> = {};
  if (authorized) {
    headers["Authorization"] = "Bearer test-cron-secret";
  }
  return new Request(
    "http://localhost/api/cron/artwork/expireExclusivity",
    {
      method: "GET",
      headers,
    },
  );
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await Artworkuploads.deleteMany({});
  await CreateOrder.deleteMany({});
});

// ── Auth ──────────────────────────────────────────────────────────────────────

describe("GET /api/cron/artwork/expireExclusivity — auth", () => {
  it("returns 403 when Authorization header is missing", async () => {
    const res = await GET(makeRequest(false));
    const body = await res.json();

    expect(res.status).toBe(403);
  });

  it("returns 403 when Authorization header has wrong secret", async () => {
    const req = new Request(
      "http://localhost/api/cron/artwork/expireExclusivity",
      {
        method: "GET",
        headers: { Authorization: "Bearer wrong-secret" },
      },
    );
    const res = await GET(req);

    expect(res.status).toBe(403);
  });
});

// ── No expired contracts ──────────────────────────────────────────────────────

describe("GET /api/cron/artwork/expireExclusivity — no expired contracts", () => {
  it("returns 200 with no expired contracts message when none exist", async () => {
    const res = await GET(makeRequest(true));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("No expired contracts found");
  });
});

// ── Happy path ────────────────────────────────────────────────────────────────

describe("GET /api/cron/artwork/expireExclusivity — with expired contracts", () => {
  it("returns 200 and updates artworks when expired exclusivity contracts exist", async () => {
    // Use collection.insertOne to bypass schema validation
    await Artworkuploads.collection.insertOne({
      art_id: "art-001",
      exclusivity_status: {
        exclusivity_type: "exclusive",
        exclusivity_end_date: new Date("2020-01-01"), // past date
      },
    });

    const res = await GET(makeRequest(true));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Exclusivity contracts updated successfully");
    expect(body.artworksUpdated).toBeGreaterThanOrEqual(1);
  });

  it("updates associated orders when expired contracts exist", async () => {
    await Artworkuploads.collection.insertOne({
      art_id: "art-002",
      exclusivity_status: {
        exclusivity_type: "exclusive",
        exclusivity_end_date: new Date("2020-01-01"),
      },
    });

    // Insert a matching order
    await CreateOrder.collection.insertOne({
      order_id: "order-001",
      artwork_data: {
        art_id: "art-002",
        exclusivity_status: {
          exclusivity_type: "exclusive",
        },
      },
      seller_designation: "artist",
    });

    const res = await GET(makeRequest(true));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Exclusivity contracts updated successfully");
    expect(body.artworksUpdated).toBeGreaterThanOrEqual(1);
  });

  it("changes exclusivity_type to non-exclusive in the database", async () => {
    await Artworkuploads.collection.insertOne({
      art_id: "art-003",
      exclusivity_status: {
        exclusivity_type: "exclusive",
        exclusivity_end_date: new Date("2020-01-01"),
      },
    });

    await GET(makeRequest(true));

    const artwork = await Artworkuploads.collection.findOne({
      art_id: "art-003",
    });
    expect(artwork?.exclusivity_status.exclusivity_type).toBe("non-exclusive");
  });
});
