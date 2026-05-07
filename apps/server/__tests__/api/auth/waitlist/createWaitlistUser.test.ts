import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));
vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  strictRateLimit: {},
}));
vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/shared-models/models/auth/ArtistSchema", () => ({
  AccountArtist: { exists: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/auth/GallerySchema", () => ({
  AccountGallery: { exists: vi.fn() },
}));
vi.mock("@omenai/shared-models/models/auth/WaitlistSchema", () => ({
  Waitlist: { findOne: vi.fn(), create: vi.fn() },
}));
vi.mock("@omenai/shared-emails/src/models/waitlist/SendWaitlistRegistrationEmail", () => ({
  SendWaitlistRegistrationEmail: vi.fn().mockResolvedValue(undefined),
}));
vi.mock("@omenai/rollbar-config", () => ({
  rollbarServerInstance: { error: vi.fn() },
}));
vi.mock("../../../../app/api/util", async () => {
  const { buildValidateRequestBodyMock } = await import("../../../helpers/util-mock");
  return buildValidateRequestBodyMock();
});

import { POST } from "../../../../app/api/auth/waitlist/createWaitlistUser/route";
import { AccountArtist } from "@omenai/shared-models/models/auth/ArtistSchema";
import { AccountGallery } from "@omenai/shared-models/models/auth/GallerySchema";
import { Waitlist } from "@omenai/shared-models/models/auth/WaitlistSchema";

function makeRequest(body: object) {
  return new Request("http://localhost/api/auth/waitlist/createWaitlistUser", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const validPayload = { name: "Alice", email: "alice@example.com", entity: "gallery" };

describe("POST /api/auth/waitlist/createWaitlistUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 201 when new user is added to waitlist", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockResolvedValue(null);
    vi.mocked(Waitlist.create).mockResolvedValue({} as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body.message).toBe("Successfully added to waitlist");
  });

  it("returns 403 when user is already registered as a gallery", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue({ _id: "existing" } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already part of the Omenai/i);
  });

  it("returns 403 when user is already on waitlist and not invited", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockResolvedValue({ isInvited: false } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/already signed up/i);
  });

  it("returns 403 when user is already invited", async () => {
    vi.mocked(AccountGallery.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockResolvedValue({ isInvited: true } as any);

    const response = await POST(makeRequest(validPayload));
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.message).toMatch(/invitation.*already been sent/i);
  });

  it("uses AccountArtist model when entity is artist", async () => {
    vi.mocked(AccountArtist.exists).mockResolvedValue(null);
    vi.mocked(Waitlist.findOne).mockResolvedValue(null);
    vi.mocked(Waitlist.create).mockResolvedValue({} as any);

    await POST(makeRequest({ ...validPayload, entity: "artist" }));

    expect(AccountArtist.exists).toHaveBeenCalledWith({ email: "alice@example.com" });
  });

  it("returns 400 when required fields are missing", async () => {
    const response = await POST(makeRequest({ name: "Alice" }));
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.message).toMatch(/Validation Failed/i);
  });

  it("returns 400 when entity is invalid", async () => {
    const response = await POST(makeRequest({ ...validPayload, entity: "admin" }));
    const body = await response.json();

    expect(response.status).toBe(400);
  });
});
