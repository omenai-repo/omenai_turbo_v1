import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://test-api.com"),
}));

vi.mock("@omenai/rollbar-config", () => ({
  logRollbarServerError: vi.fn(),
}));

import { getSingleOrder } from "../../orders/getSingleOrder";
import { getOrderByFilter } from "../../orders/getOrdersByFilter";
import { getOrdersForUser } from "../../orders/getOrdersForUser";
import { getOverviewOrders } from "../../orders/getOverviewOrders";
import { getTrackingData } from "../../orders/getTrackingData";
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
/*                          getSingleOrder                             */
/* ------------------------------------------------------------------ */

describe("getSingleOrder", () => {
  it("POSTs to the correct endpoint with order_id in body", async () => {
    mockFetchOk({ message: "Found", data: { order_id: "order-1" } });

    await getSingleOrder("order-1");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/getSingleOrder",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ order_id: "order-1" }),
      }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    const order = { order_id: "order-1", status: "pending" };
    mockFetchOk({ message: "Found", data: order });

    const result = await getSingleOrder("order-1");

    expect(result).toEqual({ isOk: true, message: "Found", data: order });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Not found", data: null }, false);

    const result = await getSingleOrder("order-999");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Not found");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await getSingleOrder("order-1");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                          getOrderByFilter                           */
/* ------------------------------------------------------------------ */

describe("getOrderByFilter", () => {
  it("GETs the correct URL with session_id as query param", async () => {
    mockFetchOk({ message: "Found", data: [] });

    await getOrderByFilter("session-xyz");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/getOrderByFilter?id=session-xyz",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    const orders = [{ order_id: "o1" }];
    mockFetchOk({ message: "OK", data: orders });

    const result = await getOrderByFilter("session-xyz");

    expect(result).toEqual({ isOk: true, message: "OK", data: orders });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Unauthorized", data: null }, false);

    const result = await getOrderByFilter("session-xyz");

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await getOrderByFilter("session-xyz");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                          getOrdersForUser                           */
/* ------------------------------------------------------------------ */

describe("getOrdersForUser", () => {
  it("POSTs to the correct endpoint with user_id wrapped as id", async () => {
    mockFetchOk({ message: "OK", data: [] });

    await getOrdersForUser("user-42");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/getOrdersByUserId",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ id: "user-42" }),
      }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    const orders = [{ order_id: "o1" }, { order_id: "o2" }];
    mockFetchOk({ message: "OK", data: orders });

    const result = await getOrdersForUser("user-42");

    expect(result).toEqual({ isOk: true, message: "OK", data: orders });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Not found", data: null }, false);

    const result = await getOrdersForUser("user-99");

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await getOrdersForUser("user-42");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                         getOverviewOrders                           */
/* ------------------------------------------------------------------ */

describe("getOverviewOrders", () => {
  it("GETs the correct URL with session_id as query param", async () => {
    mockFetchOk({ message: "OK", data: [] });

    await getOverviewOrders("seller-session-1");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/getOrdersBySellerId?id=seller-session-1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    const orders = [{ order_id: "o10" }];
    mockFetchOk({ message: "OK", data: orders });

    const result = await getOverviewOrders("seller-session-1");

    expect(result).toEqual({ isOk: true, message: "OK", data: orders });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Error", data: null }, false);

    const result = await getOverviewOrders("seller-session-1");

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await getOverviewOrders("seller-session-1");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                           getTrackingData                           */
/* ------------------------------------------------------------------ */

describe("getTrackingData", () => {
  it("GETs the correct URL with order_id as query param", async () => {
    mockFetchOk({ message: "OK", data: {} });

    await getTrackingData("order-track-1");

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/shipment/shipment_tracking?order_id=order-track-1",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("returns { isOk, message, data } on success", async () => {
    const tracking = { status: "in_transit", location: "Paris" };
    mockFetchOk({ message: "Tracking found", data: tracking });

    const result = await getTrackingData("order-track-1");

    expect(result).toEqual({
      isOk: true,
      message: "Tracking found",
      data: tracking,
    });
  });

  it("returns { isOk: false } for a non-ok response", async () => {
    mockFetchOk({ message: "Not found", data: null }, false);

    const result = await getTrackingData("order-track-999");

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Not found");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await getTrackingData("order-track-1");

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});
