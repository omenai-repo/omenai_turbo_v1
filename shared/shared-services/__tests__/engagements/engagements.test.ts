import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://test-api.com"),
}));

vi.mock("@omenai/rollbar-config", () => ({
  logRollbarServerError: vi.fn(),
}));

import { addFollow } from "../../engagements/addFollow";
import { deleteFollow } from "../../engagements/deleteFollow";
import { fetchFollows } from "../../engagements/getFollowerIds";
import { logRollbarServerError } from "@omenai/rollbar-config";

const NETWORK_ERROR_MSG =
  "An error was encountered, please try again later or contact support";

const TOKEN = "csrf-engagement-token";

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
/*                             addFollow                               */
/* ------------------------------------------------------------------ */

describe("addFollow", () => {
  const payload = {
    followerId: "user-1",
    followingId: "artist-1",
    followingType: "artist" as const,
  };

  it("POSTs to the correct endpoint with payload and CSRF token", async () => {
    mockFetchOk({ message: "Followed" });

    await addFollow(payload, TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/engagements/follow",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Followed" });

    const result = await addFollow(payload, TOKEN);

    expect(result).toEqual({ isOk: true, message: "Followed" });
  });

  it("supports following a gallery", async () => {
    const galleryPayload = {
      followerId: "user-1",
      followingId: "gallery-1",
      followingType: "gallery" as const,
    };
    mockFetchOk({ message: "Followed" });

    await addFollow(galleryPayload, TOKEN);

    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.followingType).toBe("gallery");
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Already following" }, false);

    const result = await addFollow(payload, TOKEN);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Already following");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await addFollow(payload, TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                            deleteFollow                             */
/* ------------------------------------------------------------------ */

describe("deleteFollow", () => {
  const payload = {
    followerId: "user-1",
    followingId: "artist-1",
    followingType: "artist" as const,
  };

  it("DELETEs to the correct endpoint with payload and CSRF token", async () => {
    mockFetchOk({ message: "Unfollowed" });

    await deleteFollow(payload, TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/engagements/deleteFollow",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify(payload),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Unfollowed" });

    const result = await deleteFollow(payload, TOKEN);

    expect(result).toEqual({ isOk: true, message: "Unfollowed" });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Follow relationship not found" }, false);

    const result = await deleteFollow(payload, TOKEN);

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await deleteFollow(payload, TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                            fetchFollows                             */
/* ------------------------------------------------------------------ */

describe("fetchFollows", () => {
  it("GETs the correct URL with sessionId as query param", async () => {
    mockFetchOk({ message: "OK", followedIds: ["artist-1", "gallery-2"] });

    await fetchFollows("session-abc");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/engagements/fetchFollows?id=session-abc",
    );
  });

  it("returns { isOk, message, followedIds } on success", async () => {
    const followedIds = ["artist-1", "gallery-2"];
    mockFetchOk({ message: "OK", followedIds });

    const result = await fetchFollows("session-abc");

    expect(result).toEqual({ isOk: true, message: "OK", followedIds });
  });

  it("returns empty followedIds array when server returns none", async () => {
    mockFetchOk({ message: "OK", followedIds: [] });

    const result = await fetchFollows("session-new");

    expect(result).toEqual({ isOk: true, message: "OK", followedIds: [] });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Unauthorized", followedIds: null }, false);

    const result = await fetchFollows("session-abc");

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await fetchFollows("session-abc");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});
