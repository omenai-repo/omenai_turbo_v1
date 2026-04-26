import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("@omenai/shared-lib/auth/middleware/combined_middleware", () => ({
  withRateLimitHighlightAndCsrf: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  lenientRateLimit: {},
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@omenai/shared-lib/auth/session", () => ({
  getSessionFromCookie: vi.fn(),
  destroySession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { POST } from "../../../../app/api/auth/session/logout/route";
import {
  getSessionFromCookie,
  destroySession,
} from "@omenai/shared-lib/auth/session";

const mockDestroy = vi.fn();

function mockCookieSession(sessionId: string | null) {
  vi.mocked(getSessionFromCookie).mockResolvedValue({
    sessionId,
    destroy: mockDestroy,
  } as any);
}

describe("POST /api/auth/session/logout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with logout message when session exists", async () => {
    mockCookieSession("session-id-123");

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("User successfully logged out");
  });

  it("calls destroySession with the sessionId when one is present", async () => {
    mockCookieSession("session-id-123");

    await POST();

    expect(destroySession).toHaveBeenCalledWith(
      "session-id-123",
      expect.anything(),
    );
    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it("calls session.destroy() instead of destroySession when no sessionId", async () => {
    mockCookieSession(null);

    await POST();

    expect(destroySession).not.toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it("returns 200 even when there is no active session", async () => {
    mockCookieSession(null);

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("User successfully logged out");
  });

  it("returns 500 when getSessionFromCookie throws", async () => {
    vi.mocked(getSessionFromCookie).mockRejectedValue(
      new Error("Cookie store failure"),
    );

    const response = await POST();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("An error occurred. Please contact support");
  });
});
