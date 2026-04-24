import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: unknown, init?: ResponseInit) =>
      new Response(JSON.stringify(body), {
        ...init,
        headers: { "Content-Type": "application/json" },
      }),
  },
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/crons/FailedJob", () => ({
  FailedJob: {
    find: vi.fn(),
  },
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/account_service",
  () => ({
    accountService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/categorization_service",
  () => ({
    categorizationService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/device_token_service",
  () => ({
    deviceTokenService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/notification_service",
  () => ({
    notificationService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/order_service",
  () => ({
    orderService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/transaction_service",
  () => ({
    transactionService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/salesService",
  () => ({
    salesService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/paymentService",
  () => ({
    stripePaymentMethodsService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/subscriptionService",
  () => ({
    subscriptionService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/wallet_service",
  () => ({
    walletService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/flutterwave_service",
  () => ({
    flutterwaveService: vi.fn().mockResolvedValue(undefined),
  }),
);

vi.mock(
  "../../../../app/api/cron/failedJobs/deletionServices/services/cloudinary_service",
  () => ({
    cloudinaryService: vi.fn().mockResolvedValue(undefined),
  }),
);

import { GET } from "../../../../app/api/cron/failedJobs/deletionServices/route";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import { accountService } from "../../../../app/api/cron/failedJobs/deletionServices/services/account_service";
import { categorizationService } from "../../../../app/api/cron/failedJobs/deletionServices/services/categorization_service";
import { orderService } from "../../../../app/api/cron/failedJobs/deletionServices/services/order_service";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/failedJobs/deletionServices",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

function makeJob(jobType: string, payload: Record<string, any>) {
  return { jobType, payload, retryCount: 0 };
}

describe("GET /api/cron/failedJobs/deletionServices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);
  });

  it("returns 200 with no-accounts message when no jobs found", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toBe("No accounts to anonymize");
  });

  it("returns 200 with success:true when jobs are processed", async () => {
    const mockJobs = [
      makeJob("anonymize_artist_account", { artist_id: "artist-001" }),
    ];
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockJobs),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.success).toBe(true);
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("dispatches artist accounts to accountService", async () => {
    const mockJobs = [
      makeJob("anonymize_artist_account", { artist_id: "artist-001" }),
    ];
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockJobs),
    } as any);

    await GET(makeRequest());

    expect(accountService).toHaveBeenCalledWith(
      expect.objectContaining({ artistIds: ["artist-001"] }),
    );
  });

  it("dispatches gallery accounts to accountService", async () => {
    const mockJobs = [
      makeJob("anonymize_gallery_account", { gallery_id: "gallery-001" }),
    ];
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(mockJobs),
    } as any);

    await GET(makeRequest());

    expect(accountService).toHaveBeenCalledWith(
      expect.objectContaining({ galleryIds: ["gallery-001"] }),
    );
  });

  it("dispatches categorization jobs to categorizationService", async () => {
    const catJob = makeJob("delete_artist_categorization", {
      artist_id: "artist-001",
    });
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([catJob]),
    } as any);

    await GET(makeRequest());

    expect(categorizationService).toHaveBeenCalledWith([catJob]);
  });

  it("dispatches order jobs to orderService", async () => {
    const orderJob = makeJob("anonymize_order_data", { order_id: "order-001" });
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([orderJob]),
    } as any);

    await GET(makeRequest());

    expect(orderService).toHaveBeenCalledWith([orderJob]);
  });

  it("queries FailedJob with the correct jobTypes and retryCount filter", async () => {
    await GET(makeRequest());

    expect(FailedJob.find).toHaveBeenCalledWith(
      expect.objectContaining({
        retryCount: { $lt: 3 },
        jobType: expect.objectContaining({ $in: expect.any(Array) }),
      }),
    );
  });

  it("returns error message when an unexpected error occurs", async () => {
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("DB failure")),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(body.error).toBe("DB failure");
  });
});
