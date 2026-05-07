import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/url-config/src/config", () => ({
  getApiUrl: vi.fn().mockReturnValue("http://test-api.com"),
}));

vi.mock("@omenai/rollbar-config", () => ({
  logRollbarServerError: vi.fn(),
}));

import { acceptOrderRequest } from "../../orders/acceptOrderRequest";
import { declineOrderRequest } from "../../orders/declineOrderRequest";
import { confirmOrderDelivery } from "../../orders/confirmOrderDelivery";
import { createShippingOrder } from "../../orders/createShippingOrder";
import { updatePickupAddress } from "../../orders/updateOrderPickupAddress";
import { logRollbarServerError } from "@omenai/rollbar-config";
import type {
  AddressTypes,
  OrderAcceptedStatusTypes,
  ShipmentDimensions,
} from "@omenai/shared-types";

const NETWORK_ERROR_MSG =
  "An error was encountered, please try again later or contact support";

const TOKEN = "csrf-test-token";

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
/*                        acceptOrderRequest                           */
/* ------------------------------------------------------------------ */

describe("acceptOrderRequest", () => {
  const dimensions: ShipmentDimensions = {
    length: 50,
    width: 40,
    height: 10,
    weight: 5,
  };

  it("POSTs to the correct endpoint with required fields and CSRF token", async () => {
    mockFetchOk({ message: "Order accepted" });

    await acceptOrderRequest("order-1", dimensions, null, TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/accept_order_request",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          order_id: "order-1",
          dimensions,
          exhibition_status: null,
          specialInstructions: undefined,
        }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("includes specialInstructions when provided", async () => {
    mockFetchOk({ message: "Accepted" });

    await acceptOrderRequest("order-1", dimensions, null, TOKEN, "Handle with care");

    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.specialInstructions).toBe("Handle with care");
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Order accepted" });

    const result = await acceptOrderRequest("order-1", dimensions, null, TOKEN);

    expect(result).toEqual({ isOk: true, message: "Order accepted" });
  });

  it("returns { isOk: false } for non-ok response", async () => {
    mockFetchOk({ message: "Forbidden" }, false);

    const result = await acceptOrderRequest("order-1", dimensions, null, TOKEN);

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Forbidden");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await acceptOrderRequest("order-1", dimensions, null, TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                       declineOrderRequest                           */
/* ------------------------------------------------------------------ */

describe("declineOrderRequest", () => {
  const declineData: OrderAcceptedStatusTypes = {
    status: "declined",
    reason: "Item no longer available",
    date: "2025-01-01",
  };

  it("POSTs to the correct endpoint with all required fields and CSRF token", async () => {
    mockFetchOk({ message: "Order declined" });

    await declineOrderRequest(declineData, "order-2", "gallery", "art-2", TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/declineOrderRequest",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          data: declineData,
          order_id: "order-2",
          seller_designation: "gallery",
          art_id: "art-2",
        }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Declined" });

    const result = await declineOrderRequest(declineData, "order-2", "artist", "art-2", TOKEN);

    expect(result).toEqual({ isOk: true, message: "Declined" });
  });

  it("returns { isOk: false } for non-ok response", async () => {
    mockFetchOk({ message: "Not found" }, false);

    const result = await declineOrderRequest(declineData, "order-2", "gallery", "art-2", TOKEN);

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await declineOrderRequest(declineData, "order-2", "gallery", "art-2", TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                       confirmOrderDelivery                          */
/* ------------------------------------------------------------------ */

describe("confirmOrderDelivery", () => {
  it("POSTs to the correct endpoint with confirm_delivery and order_id", async () => {
    mockFetchOk({ message: "Delivery confirmed" });

    await confirmOrderDelivery(true, "order-3", TOKEN);

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/confirmOrderDelivery",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ confirm_delivery: true, order_id: "order-3" }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Confirmed" });

    const result = await confirmOrderDelivery(true, "order-3", TOKEN);

    expect(result).toEqual({ isOk: true, message: "Confirmed" });
  });

  it("sends confirm_delivery: false when buyer disputes delivery", async () => {
    mockFetchOk({ message: "Dispute raised" });

    await confirmOrderDelivery(false, "order-3", TOKEN);

    const body = JSON.parse(
      (vi.mocked(fetch).mock.calls[0][1] as RequestInit).body as string,
    );
    expect(body.confirm_delivery).toBe(false);
  });

  it("returns { isOk: false } for non-ok response", async () => {
    mockFetchOk({ message: "Unauthorized" }, false);

    const result = await confirmOrderDelivery(true, "order-3", TOKEN);

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await confirmOrderDelivery(true, "order-3", TOKEN);

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                        createShippingOrder                          */
/* ------------------------------------------------------------------ */

describe("createShippingOrder", () => {
  const shippingAddress: AddressTypes = {
    address_line: "1 Buyer St",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    zip: "10115",
  };

  it("POSTs to the correct endpoint with all required fields and CSRF token", async () => {
    mockFetchOk({ message: "Order created" });

    await createShippingOrder(
      "buyer-1",
      "art-1",
      "seller-1",
      true,
      shippingAddress,
      null,
      "gallery",
      TOKEN,
    );

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/createOrder",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          buyer_id: "buyer-1",
          art_id: "art-1",
          seller_id: "seller-1",
          save_shipping_address: true,
          shipping_address: shippingAddress,
          origin_address: null,
          designation: "gallery",
        }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Order created" });

    const result = await createShippingOrder(
      "buyer-1", "art-1", "seller-1", true, shippingAddress, null, "artist", TOKEN,
    );

    expect(result).toEqual({ isOk: true, message: "Order created" });
  });

  it("returns { isOk: false } for non-ok response", async () => {
    mockFetchOk({ message: "Validation failed" }, false);

    const result = await createShippingOrder(
      "buyer-1", "art-1", "seller-1", false, shippingAddress, null, "gallery", TOKEN,
    );

    expect(result.isOk).toBe(false);
    expect(result.message).toBe("Validation failed");
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await createShippingOrder(
      "buyer-1", "art-1", "seller-1", true, shippingAddress, null, "gallery", TOKEN,
    );

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});

/* ------------------------------------------------------------------ */
/*                        updatePickupAddress                          */
/* ------------------------------------------------------------------ */

describe("updatePickupAddress", () => {
  const pickupAddress: AddressTypes = {
    address_line: "5 Pickup Ave",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    zip: "75001",
  };

  it("PATCHes the correct endpoint with type, pickupAddress and order_id", async () => {
    mockFetchOk({ message: "Address updated" });

    await updatePickupAddress({
      type: "pickup",
      pickupAddress,
      order_id: "order-5",
      token: TOKEN,
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://test-api.com/api/orders/updateOrderPickupAddress",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({
          order_id: "order-5",
          type: "pickup",
          pickupAddress,
        }),
        headers: { "x-csrf-token": TOKEN },
        credentials: "include",
      }),
    );
  });

  it("returns { isOk: true, message } on success", async () => {
    mockFetchOk({ message: "Updated" });

    const result = await updatePickupAddress({
      type: "delivery",
      pickupAddress,
      order_id: "order-5",
      token: TOKEN,
    });

    expect(result).toEqual({ isOk: true, message: "Updated" });
  });

  it("returns { isOk: false } for non-ok response", async () => {
    mockFetchOk({ message: "Order not found" }, false);

    const result = await updatePickupAddress({
      type: "pickup",
      pickupAddress,
      order_id: "order-999",
      token: TOKEN,
    });

    expect(result.isOk).toBe(false);
  });

  it("returns fallback message and logs error when fetch throws", async () => {
    mockFetchThrows();

    const result = await updatePickupAddress({
      type: "pickup",
      pickupAddress,
      order_id: "order-5",
      token: TOKEN,
    });

    expect(result).toEqual({ isOk: false, message: NETWORK_ERROR_MSG });
    expect(logRollbarServerError).toHaveBeenCalledOnce();
  });
});
