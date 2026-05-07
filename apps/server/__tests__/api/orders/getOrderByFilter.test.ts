import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@omenai/shared-models/models/orders/CreateOrderSchema", () => ({
  CreateOrder: { find: vi.fn() },
}));

vi.mock("../../../app/api/util", async () => {
  const { buildValidateGetRouteParamsMock } = await import("../../helpers/util-mock");
  return buildValidateGetRouteParamsMock();
});

import { GET } from "../../../app/api/orders/getOrderByFilter/route";
import { CreateOrder } from "@omenai/shared-models/models/orders/CreateOrderSchema";

const mockOrders = [
  { order_id: "order-1", artwork_data: { title: "Piece 1" } },
  { order_id: "order-2", artwork_data: { title: "Piece 2" } },
];

function makeRequest(id?: string) {
  const url = id
    ? `http://localhost/api/orders/getOrderByFilter?id=${id}`
    : "http://localhost/api/orders/getOrderByFilter";
  const req = new Request(url, { method: "GET" }) as any;
  req.nextUrl = new URL(url);
  return req;
}

describe("GET /api/orders/getOrderByFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(CreateOrder.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(mockOrders),
        }),
      }),
    } as any);
  });

  it("returns 200 with pending orders for seller", async () => {
    const response = await GET(makeRequest("seller-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("Successful");
    expect(body.data).toEqual(mockOrders);
    expect(CreateOrder.find).toHaveBeenCalledWith({
      "seller_details.id": "seller-123",
      "order_accepted.status": "",
    });
  });

  it("returns 200 with empty data when no orders found", async () => {
    vi.mocked(CreateOrder.find).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        lean: vi.fn().mockReturnValue({
          exec: vi.fn().mockResolvedValue(null),
        }),
      }),
    } as any);

    const response = await GET(makeRequest("seller-123"));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data).toEqual([]);
  });

  it("returns 400 when id param is missing", async () => {
    const response = await GET(makeRequest());

    expect(response.status).toBe(400);
  });
});
