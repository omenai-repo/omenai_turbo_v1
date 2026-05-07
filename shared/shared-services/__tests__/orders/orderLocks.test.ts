import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://test-api.com"),
}));

vi.mock("@omenai/rollbar-config", () => ({
  logRollbarServerError: vi.fn(),
}));

import { releaseOrderLock } from "../../orders/releaseOrderLock";
import { checkLockStatus } from "../../orders/checkLockStatus";
import { createOrderLock } from "../../orders/createOrderLock";
import { logRollbarServerError } from "@omenai/rollbar-config";

const NETWORK_ERROR_MSG =
  "An error was encountered, please try again later or contact support";

function mockFetchOk(body: object, ok = true) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok, json: async () => body }),
  );
}

function mockFetchThrows(message = "Network failure") {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(message)));
}

beforeEach(() => {
  vi.clearAllMocks();
});

/* ------------------------------------------------------------------ */
/*                        releaseOrderLock                             */
/* ------------------------------------------------------------------ */

describe("releaseOrderLock", () => {
  it("calls the correct endpoint with art_id and user_id", async () => {
    mockFetchOk({ message: "Lock released" });

    await releaseOrderLock("art-1", "user-1");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/locks/releaseLock",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ art_id: "art-1", user_id: "user-1" }),
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Lock released" });

    const result = await releaseOrderLock("art-1", "user-1");

    expect(result).toEqual({ isOk: true, message: "Lock released" });
  });

  it("returns { isOk: false, message } when server responds with non-ok status", async () => {
    mockFetchOk({ message: "Lock not found" }, false);

    const result = await releaseOrderLock("art-1", "user-1");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Lock not found");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await releaseOrderLock("art-1", "user-1");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                         checkLockStatus                             */
/* ------------------------------------------------------------------ */

describe("checkLockStatus", () => {
  it("calls the correct endpoint with art_id and user_id", async () => {
    mockFetchOk({ message: "Locked", data: { locked: true } });

    await checkLockStatus("art-2", "user-2");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/locks/checkLock",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ art_id: "art-2", user_id: "user-2" }),
      }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    mockFetchOk({ message: "Locked", data: { locked: true } });

    const result = await checkLockStatus("art-2", "user-2");

    expect(result).toEqual({
      isOk: true,
      message: "Locked",
      data: { locked: true },
    });
  });

  it("returns { isOk: false } when server responds with non-ok status", async () => {
    mockFetchOk({ message: "Unauthorized", data: null }, false);

    const result = await checkLockStatus("art-2", "user-2");

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await checkLockStatus("art-2", "user-2");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                          createOrderLock                            */
/* ------------------------------------------------------------------ */

describe("createOrderLock", () => {
  const TOKEN = "csrf-token-abc";

  it("calls the correct endpoint with art_id, user_id, and CSRF token", async () => {
    mockFetchOk({ message: "Lock created", data: { lock_id: "lk-1" } });

    await createOrderLock("art-3", "user-3", TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/locks/createLock",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ art_id: "art-3", user_id: "user-3" }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    mockFetchOk({ message: "Lock created", data: { lock_id: "lk-1" } });

    const result = await createOrderLock("art-3", "user-3", TOKEN);

    expect(result).toEqual({
      isOk: true,
      message: "Lock created",
      data: { lock_id: "lk-1" },
    });
  });

  it("returns { isOk: false } when server responds with non-ok status", async () => {
    mockFetchOk({ message: "Lock already exists", data: null }, false);

    const result = await createOrderLock("art-3", "user-3", TOKEN);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Lock already exists");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await createOrderLock("art-3", "user-3", TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});
