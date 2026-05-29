/**
 * Integration tests for POST /api/verification/verifyGallery
 *
 * The actual email sending is mocked.  Tests assert that:
 * - The route rejects invalid payloads with 400
 * - On success it returns 200 with the correct message
 * - It always sends to the fixed Omenai onboarding address
 * - The gallery name from the request is forwarded to the email function
 */

import { describe, it, expect, afterEach, vi } from "vitest";

// ── Module-level mock ────────────────────────────────────────────────────────

const { mockSendVerifyGalleryMail } = vi.hoisted(() => ({
  mockSendVerifyGalleryMail: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-emails/src/models/verification/sendVerifyGalleryMail", () => ({
  sendVerifyGalleryMail: mockSendVerifyGalleryMail,
}));

import { POST } from "../../../app/api/verification/verifyGallery/route";

// ── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(body: object) {
  return new Request("http://localhost/api/verification/verifyGallery", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

// ── Cleanup ──────────────────────────────────────────────────────────────────

afterEach(() => {
  vi.clearAllMocks();
});

// ── Validation ───────────────────────────────────────────────────────────────

describe("POST /api/verification/verifyGallery — validation", () => {
  it("returns 400 when name field is missing", async () => {
    const res = await POST(makeRequest({}));

    expect(res.status).toBe(400);
    expect(mockSendVerifyGalleryMail).not.toHaveBeenCalled();
  });

  it("returns 400 for an entirely empty body", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
  });
});

// ── Successful verification request ─────────────────────────────────────────

describe("POST /api/verification/verifyGallery — success", () => {
  it("returns 200 with the expected success message", async () => {
    const res = await POST(makeRequest({ name: "Gallery Noir Lagos" }));
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Gallery verification request sent");
  });

  it("calls sendVerifyGalleryMail exactly once per request", async () => {
    await POST(makeRequest({ name: "Tafawa Galleries" }));

    expect(mockSendVerifyGalleryMail).toHaveBeenCalledTimes(1);
  });

  it("sends the email to the hardcoded onboarding address 'onboarding@omenai.app'", async () => {
    await POST(makeRequest({ name: "Nairobi Art House" }));

    expect(mockSendVerifyGalleryMail).toHaveBeenCalledWith(
      expect.objectContaining({ email: "onboarding@omenai.app" }),
    );
  });

  it("passes the gallery name from the request body to the email function", async () => {
    await POST(makeRequest({ name: "The Lagos Contemporary" }));

    expect(mockSendVerifyGalleryMail).toHaveBeenCalledWith(
      expect.objectContaining({ name: "The Lagos Contemporary" }),
    );
  });

  it("works correctly with a gallery name that contains special characters", async () => {
    const specialName = "Galerie d'Abidjan & Co.";
    const res = await POST(makeRequest({ name: specialName }));

    expect(res.status).toBe(200);
    expect(mockSendVerifyGalleryMail).toHaveBeenCalledWith(
      expect.objectContaining({ name: specialName }),
    );
  });

  it("does not make duplicate email calls on multiple sequential requests", async () => {
    await POST(makeRequest({ name: "Gallery One" }));
    await POST(makeRequest({ name: "Gallery Two" }));

    expect(mockSendVerifyGalleryMail).toHaveBeenCalledTimes(2);
    const calls = mockSendVerifyGalleryMail.mock.calls;
    expect(calls[0][0].name).toBe("Gallery One");
    expect(calls[1][0].name).toBe("Gallery Two");
  });
});

// ── Email failure resilience ─────────────────────────────────────────────────

describe("POST /api/verification/verifyGallery — email failure handling", () => {
  it("returns a non-200 response when the email function throws", async () => {
    mockSendVerifyGalleryMail.mockRejectedValueOnce(new Error("SMTP timeout"));

    const res = await POST(makeRequest({ name: "Broken Gallery" }));

    // Route's catch block should convert the error to a status code
    expect(res.status).not.toBe(200);
  });
});
