/**
 * Integration tests for POST /api/auth/individual/sendPasswordResetLink
 *
 * Seeds AccountIndividual and VerificationCodes documents and verifies the route
 * correctly sends password reset links against the real in-memory MongoDB
 * instance. The email utility is mocked so tests remain fast and deterministic.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { AccountIndividual } from "@omenai/shared-models/models/auth/IndividualSchema";
import { VerificationCodes } from "@omenai/shared-models/models/auth/verification/codeTimeoutSchema";

// ── Module-level mocks ───────────────────────────────────────────────────────

vi.mock(
  "@omenai/shared-emails/src/models/recovery/sendPasswordRecoveryMail",
  () => ({
    sendPasswordRecoveryMail: vi.fn().mockResolvedValue(undefined),
  }),
);

import { POST } from "../../../../app/api/auth/individual/sendPasswordResetLink/route";

// ── Fixture factories ─────────────────────────────────────────────────────────

function makeIndividual(overrides: Record<string, any> = {}) {
  return {
    name: "Test User",
    email: "user@test.com",
    password: "hashed",
    user_id: "user-001",
    verified: true,
    preferences: [],
    address: { city: "NY", country: "US" },
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request(
    "http://localhost/api/auth/individual/sendPasswordResetLink",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

afterEach(async () => {
  await AccountIndividual.deleteMany({});
  await VerificationCodes.deleteMany({});
  vi.clearAllMocks();
});

// ── Validation ────────────────────────────────────────────────────────────────

describe(
  "POST /api/auth/individual/sendPasswordResetLink — validation",
  () => {
    it("returns 400 when recoveryEmail is invalid", async () => {
      const res = await POST(
        makeRequest({ recoveryEmail: "not-an-email" }),
      );
      const body = await res.json();

      expect(res.status).toBe(400);
      expect(body.message).toBeTruthy();
    });
  },
);

// ── Not found ─────────────────────────────────────────────────────────────────

describe(
  "POST /api/auth/individual/sendPasswordResetLink — not found",
  () => {
    it("returns 404 when email is not associated with any account", async () => {
      const res = await POST(
        makeRequest({ recoveryEmail: "unknown@test.com" }),
      );
      const body = await res.json();

      expect(res.status).toBe(404);
      expect(body.message).toBeTruthy();
    });
  },
);

// ── Forbidden ─────────────────────────────────────────────────────────────────

describe(
  "POST /api/auth/individual/sendPasswordResetLink — forbidden",
  () => {
    it("returns 403 when account is not verified", async () => {
      await AccountIndividual.create(
        makeIndividual({ verified: false }),
      );

      const res = await POST(
        makeRequest({ recoveryEmail: "user@test.com" }),
      );
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.message).toBeTruthy();
    });

    it("returns 403 when a verification token is already active", async () => {
      await AccountIndividual.create(
        makeIndividual({ verified: true, user_id: "user-001" }),
      );
      await VerificationCodes.create({
        code: "1234567",
        author: "user-001",
      });

      const res = await POST(
        makeRequest({ recoveryEmail: "user@test.com" }),
      );
      const body = await res.json();

      expect(res.status).toBe(403);
      expect(body.message).toBeTruthy();
    });
  },
);

// ── Success ───────────────────────────────────────────────────────────────────

describe(
  "POST /api/auth/individual/sendPasswordResetLink — success",
  () => {
    it("returns 200 with verification link sent message on success", async () => {
      await AccountIndividual.create(makeIndividual({ verified: true }));

      const res = await POST(
        makeRequest({ recoveryEmail: "user@test.com" }),
      );
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.message).toBe("Verification link sent");
    });
  },
);
