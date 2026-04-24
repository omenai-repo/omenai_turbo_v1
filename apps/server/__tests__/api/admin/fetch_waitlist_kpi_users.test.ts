import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel",
  () => ({
    default: {
      find: vi.fn(),
      countDocuments: vi.fn(),
      aggregate: vi.fn(),
    },
  }),
);

vi.mock("../../../app/api/util", () => {
  class BadRequestError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "BadRequestError";
    }
  }

  return {
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
    createErrorRollbarReport: vi.fn(),
  };
});

import { POST } from "../../../app/api/admin/fetch_waitlist_kpi_users/route";
import WaitlistLead from "@omenai/shared-models/models/WaitlistFunnel/WaitlistLeadModel";

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/admin/fetch_waitlist_kpi_users",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

const mockUsers = [
  { name: "Alice", entity: "artist", kpi: { formal_education: "self-taught" } },
];

const mockFacets = [
  {
    sources: [{ _id: "instagram", count: 10 }],
    countries: [{ _id: "Nigeria", count: 5 }],
    kpi_primary: [{ _id: "self-taught", count: 8 }],
    kpi_secondary: [{ _id: "1-3 years", count: 4 }],
  },
];

const validBody = {
  entity: "artist",
  page: 1,
  limit: 50,
  filters: {},
};

describe("POST /api/admin/fetch_waitlist_kpi_users", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const mockFind = {
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue(mockUsers),
    };
    vi.mocked(WaitlistLead.find).mockReturnValue(mockFind as any);
    vi.mocked(WaitlistLead.countDocuments).mockResolvedValue(1);
    vi.mocked(WaitlistLead.aggregate).mockResolvedValue(mockFacets as any);
  });

  it("returns 200 with users, pagination, and facets", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.users).toEqual(mockUsers);
    expect(body.pagination.total).toBe(1);
    expect(body.facets.sources).toBeDefined();
  });

  it("returns 200 with collector entity", async () => {
    const response = await POST(
      makeRequest({ ...validBody, entity: "collector" }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("applies filters to the match query", async () => {
    await POST(
      makeRequest({
        ...validBody,
        filters: { buying_frequency: "frequently", country: "Nigeria" },
      }),
    );

    expect(WaitlistLead.find).toHaveBeenCalledWith(
      expect.objectContaining({
        "kpi.buying_frequency": "frequently",
        country: "Nigeria",
      }),
    );
  });

  it("returns 500 when WaitlistLead.find throws", async () => {
    vi.mocked(WaitlistLead.find).mockImplementation(() => {
      throw new Error("DB error");
    });

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.success).toBe(false);
  });
});
