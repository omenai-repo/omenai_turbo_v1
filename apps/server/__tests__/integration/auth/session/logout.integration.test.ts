/**
 * Integration tests for POST /api/auth/session/logout
 *
 * Verifies the route correctly resolves the session from the cookie store and
 * either calls destroySession (when a sessionId is present) or falls back to
 * session.destroy() (when no sessionId exists). No MongoDB interaction occurs.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// ── Module-level mocks ───────────────────────────────────────────────────────

const { mockGetSessionFromCookie, mockDestroySession } = vi.hoisted(() => ({
  mockGetSessionFromCookie: vi.fn(),
  mockDestroySession: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-lib/auth/session", () => ({
  getSessionFromCookie: mockGetSessionFromCookie,
  destroySession: mockDestroySession,
  createSession: vi.fn(),
}));

import { POST } from "../../../../app/api/auth/session/logout/route";

// ── Fixture factory ──────────────────────────────────────────────────────────

function makeRequest(): Request {
  return new Request("http://localhost/api/auth/session/logout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
}

// ── Cleanup ───────────────────────────────────────────────────────────────────

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Logout with sessionId ─────────────────────────────────────────────────────

describe("POST /api/auth/session/logout — session with sessionId", () => {
  it("returns 200 with logout message when session has a sessionId", async () => {
    mockGetSessionFromCookie.mockResolvedValue({
      sessionId: "sess-123",
      save: vi.fn(),
      destroy: vi.fn(),
    });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("User successfully logged out");
  });

  it("calls destroySession with the sessionId and cookieStore", async () => {
    mockGetSessionFromCookie.mockResolvedValue({
      sessionId: "sess-123",
      save: vi.fn(),
      destroy: vi.fn(),
    });

    await POST(makeRequest());

    expect(mockDestroySession).toHaveBeenCalledWith(
      "sess-123",
      expect.anything(),
    );
  });
});

// ── Logout without sessionId ──────────────────────────────────────────────────

describe("POST /api/auth/session/logout — session without sessionId", () => {
  it("calls session.destroy when session has no sessionId", async () => {
    const mockDestroy = vi.fn();
    mockGetSessionFromCookie.mockResolvedValue({
      sessionId: null,
      save: vi.fn(),
      destroy: mockDestroy,
    });

    const res = await POST(makeRequest());
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("does not call destroySession when session has no sessionId", async () => {
    const mockDestroy = vi.fn();
    mockGetSessionFromCookie.mockResolvedValue({
      sessionId: null,
      save: vi.fn(),
      destroy: mockDestroy,
    });

    await POST(makeRequest());

    expect(mockDestroySession).not.toHaveBeenCalled();
  });
});
