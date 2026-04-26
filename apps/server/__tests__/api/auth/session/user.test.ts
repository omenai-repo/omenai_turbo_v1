import { describe, it, expect, vi, beforeEach } from "vitest";

// mocks must be declared before the route import

vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({}),
}));

vi.mock("@omenai/shared-lib/auth/session", () => ({
  getSessionFromCookie: vi.fn(),
  getSession: vi.fn(),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

import { GET } from "../../../../app/api/auth/session/user/route";
import {
  getSessionFromCookie,
  getSession,
} from "@omenai/shared-lib/auth/session";

function makeRequest(): Request {
  return new Request("http://localhost/api/auth/session/user", {
    method: "GET",
  });
}

const mockSessionData = {
  userId: "user-abc-123",
  userData: {
    email: "user@example.com",
    role: "gallery",
  },
  csrfToken: "csrf-token-xyz",
};

const mockDestroy = vi.fn();

function mockCookieSession(sessionId: string | null) {
  vi.mocked(getSessionFromCookie).mockResolvedValue({
    sessionId,
    destroy: mockDestroy,
  } as any);
}

describe("GET /api/auth/session/user", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with user data and csrfToken for a valid session", async () => {
    mockCookieSession("session-id-123");
    vi.mocked(getSession).mockResolvedValue(mockSessionData as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.csrfToken).toBe("csrf-token-xyz");
    expect(body.user).toBeDefined();
    expect(body.user.csrfToken).toBeUndefined();
  });

  it("does not expose csrfToken inside user object", async () => {
    mockCookieSession("session-id-123");
    vi.mocked(getSession).mockResolvedValue(mockSessionData as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.user.csrfToken).toBeUndefined();
    expect(body.csrfToken).toBe("csrf-token-xyz");
  });

  it("returns 401 when no sessionId is present in the cookie", async () => {
    mockCookieSession(null);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Session not authenticated");
    expect(getSession).not.toHaveBeenCalled();
  });

  it("returns 401 and destroys the cookie when session data is not found in store", async () => {
    mockCookieSession("stale-session-id");
    vi.mocked(getSession).mockResolvedValue(null as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.message).toBe("Session expired or invalid");
    expect(mockDestroy).toHaveBeenCalledOnce();
  });

  it("returns 500 when getSessionFromCookie throws", async () => {
    vi.mocked(getSessionFromCookie).mockRejectedValue(
      new Error("Cookie store failure"),
    );

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.message).toBe("An error occurred");
  });
});
