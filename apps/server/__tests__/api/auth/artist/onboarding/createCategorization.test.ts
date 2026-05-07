import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

// vi.hoisted so this variable is available inside hoisted vi.mock factories
const mockSession = vi.hoisted(() => ({
  startTransaction: vi.fn(),
  commitTransaction: vi.fn().mockResolvedValue(undefined),
  abortTransaction: vi.fn().mockResolvedValue(undefined),
  endSession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue({
    startSession: vi.fn().mockReturnValue(mockSession),
  }),
}));

vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: {
    findOne: vi.fn(),
    updateOne: vi.fn(),
  },
}));

vi.mock(
  "@omenai/shared-models/models/artist/ArtistCategorizationSchema",
  () => ({
    ArtistCategorization: {
      findOne: vi.fn(),
      create: vi.fn(),
    },
  }),
);

vi.mock("@omenai/shared-lib/algorithms/artistCategorization", () => ({
  calculateArtistRating: vi.fn().mockReturnValue({
    status: "success",
    rating: "Emerging",
    price_range: { min: 1000, max: 2750 },
  }),
}));

vi.mock(
  "@omenai/shared-emails/src/models/verification/sendVerifyArtistMail",
  () => ({
    sendVerifyArtistMail: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));

vi.mock("../../../../../app/api/util", () => {
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

import { POST } from "../../../../../app/api/auth/artist/onboarding/createCategorization/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import { calculateArtistRating } from "@omenai/shared-lib/algorithms/artistCategorization";
import { sendVerifyArtistMail } from "@omenai/shared-emails/src/models/verification/sendVerifyArtistMail";

const validBody = {
  artist_id: "artist-abc-123",
  bio: "A passionate abstract artist.",
  documentation: {
    cv: "https://example.com/cv.pdf",
    socials: {
      instagram: "https://instagram.com/testartist",
    },
  },
  answers: {
    graduate: "yes",
    mfa: "no",
    solo: 2,
    group: 1,
    museum_collection: "no",
    biennale: "none",
    museum_exhibition: "no",
    art_fair: "yes",
  },
};

const mockArtist = {
  artist_id: "artist-abc-123",
  name: "Test Artist",
  email: "artist@example.com",
};

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/auth/artist/onboarding/createCategorization",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

describe("POST /api/auth/artist/onboarding/createCategorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSession.commitTransaction.mockResolvedValue(undefined);
    mockSession.abortTransaction.mockResolvedValue(undefined);
    mockSession.endSession.mockResolvedValue(undefined);

    vi.mocked(AccountArtist.findOne).mockResolvedValue(mockArtist as any);
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue(null);
    vi.mocked(ArtistCategorization.create).mockResolvedValue(undefined as any);
    vi.mocked(AccountArtist.updateOne).mockReturnValue({
      session: vi.fn().mockResolvedValue(undefined),
    } as any);
    vi.mocked(calculateArtistRating).mockReturnValue({
      status: "success",
      rating: "Emerging",
      price_range: { min: 1000, max: 2750 },
    } as any);
  });

  it("returns 200 when categorization is created successfully", async () => {
    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Categorization Algorithm ran successfully");
  });

  it("commits the transaction on success", async () => {
    await POST(makeRequest(validBody));

    expect(mockSession.commitTransaction).toHaveBeenCalledOnce();
    expect(mockSession.abortTransaction).not.toHaveBeenCalled();
  });

  it("ends the session regardless of outcome", async () => {
    await POST(makeRequest(validBody));

    expect(mockSession.endSession).toHaveBeenCalledOnce();
  });

  it("sends a verification email on success", async () => {
    await POST(makeRequest(validBody));

    expect(sendVerifyArtistMail).toHaveBeenCalledWith({
      name: mockArtist.name,
      email: "onboarding@omenai.app",
    });
  });

  it("creates the categorization record with the algorithm result", async () => {
    await POST(makeRequest(validBody));

    expect(ArtistCategorization.create).toHaveBeenCalledOnce();
    const [docs] = vi.mocked(ArtistCategorization.create).mock.calls[0];
    expect(docs[0].artist_id).toBe("artist-abc-123");
    expect(docs[0].request.categorization.artist_categorization).toBe(
      "Emerging",
    );
  });

  it("returns 400 when artist_id is not found", async () => {
    vi.mocked(AccountArtist.findOne).mockResolvedValue(null);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toBe("Artist not found. Invalid ID");
  });

  it("returns 403 when categorization already exists", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue({
      artist_id: "artist-abc-123",
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toBe(
      "Duplicate request detected. Cannot fulfill request.",
    );
  });

  it("aborts the transaction and returns 403 on duplicate categorization", async () => {
    vi.mocked(ArtistCategorization.findOne).mockResolvedValue({
      artist_id: "artist-abc-123",
    } as any);

    await POST(makeRequest(validBody));

    expect(mockSession.abortTransaction).toHaveBeenCalledOnce();
    expect(mockSession.commitTransaction).not.toHaveBeenCalled();
  });

  it("returns 500 when the algorithm fails", async () => {
    vi.mocked(calculateArtistRating).mockReturnValue({
      status: "error",
      rating: null,
      price_range: null,
    } as any);

    const response = await POST(makeRequest(validBody));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe(
      "Something went wrong while processing data, please contact support",
    );
  });

  it("returns 400 when a required field is missing", async () => {
    const { artist_id: _id, ...bodyWithoutId } = validBody;

    const response = await POST(makeRequest(bodyWithoutId));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when answers contain an invalid enum value", async () => {
    const response = await POST(
      makeRequest({
        ...validBody,
        answers: { ...validBody.answers, graduate: "maybe" },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });
});
