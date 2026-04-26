import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@omenai/shared-lib/auth/middleware/rate_limit_middleware", () => ({
  withRateLimit: () => (fn: any) => fn,
}));

vi.mock("@omenai/shared-lib/auth/configs/rate_limit_configs", () => ({
  standardRateLimit: {},
}));

vi.mock("@omenai/shared-lib/mongo_connect/mongoConnect", () => ({
  connectMongoDB: vi.fn(),
}));

vi.mock("@omenai/shared-models/models/crons/FailedJob", () => ({
  FailedJob: {
    find: vi.fn(),
  },
}));

vi.mock("@omenai/appwrite-config/serverAppwrite", () => ({
  serverStorage: {
    deleteFile: vi.fn(),
  },
}));

vi.mock("../../../../app/api/cron/utils", () => ({
  verifyAuthVercel: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("../../../../app/api/util", () => ({
  createErrorRollbarReport: vi.fn(),
}));

vi.mock("../../../../custom/errors/handler/errorHandler", () => ({
  handleErrorEdgeCases: vi
    .fn()
    .mockReturnValue({ status: 500, message: "Internal Server Error" }),
}));

import { GET } from "../../../../app/api/cron/failedJobs/deleteFromAppwrite/route";
import { FailedJob } from "@omenai/shared-models/models/crons/FailedJob";
import { serverStorage } from "@omenai/appwrite-config/serverAppwrite";
import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { verifyAuthVercel } from "../../../../app/api/cron/utils";
import { handleErrorEdgeCases } from "../../../../custom/errors/handler/errorHandler";

function makeRequest(): Request {
  return new Request(
    "http://localhost/api/cron/failedJobs/deleteFromAppwrite",
    { method: "GET", headers: { Authorization: "Bearer test-secret" } },
  );
}

const mockJob = {
  _id: "job-001",
  jobType: "delete_artwork_from_appwrite",
  payload: { appwriteId: "file-abc-123" },
};

describe("GET /api/cron/failedJobs/deleteFromAppwrite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(connectMongoDB).mockResolvedValue({} as any);
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([]),
    } as any);
    vi.mocked(serverStorage.deleteFile).mockResolvedValue({} as any);
  });

  it("returns 200 with empty fulfilled and rejected arrays when no jobs found", async () => {
    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toEqual([]);
    expect(body.rejectedUpdates).toEqual([]);
  });

  it("returns 200 with fulfilled job in message when deletion succeeds", async () => {
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([mockJob]),
    } as any);

    const response = await GET(makeRequest());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.message).toHaveLength(1);
    expect(body.message[0].payload.appwriteId).toBe("file-abc-123");
  });

  it("calls verifyAuthVercel to check authorization", async () => {
    await GET(makeRequest());
    expect(verifyAuthVercel).toHaveBeenCalledOnce();
  });

  it("calls connectMongoDB before processing", async () => {
    await GET(makeRequest());
    expect(connectMongoDB).toHaveBeenCalledOnce();
  });

  it("queries FailedJob with jobType delete_artwork_from_appwrite", async () => {
    await GET(makeRequest());

    expect(FailedJob.find).toHaveBeenCalledWith({
      jobType: "delete_artwork_from_appwrite",
    });
  });

  it("calls serverStorage.deleteFile with the correct file id", async () => {
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue([mockJob]),
    } as any);

    await GET(makeRequest());

    expect(serverStorage.deleteFile).toHaveBeenCalledWith(
      expect.objectContaining({ fileId: "file-abc-123" }),
    );
  });

  it("calls deleteFile for each failed job", async () => {
    const jobs = [
      { ...mockJob, payload: { appwriteId: "file-001" } },
      { ...mockJob, _id: "job-002", payload: { appwriteId: "file-002" } },
    ];
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockResolvedValue(jobs),
    } as any);

    await GET(makeRequest());

    expect(serverStorage.deleteFile).toHaveBeenCalledTimes(2);
  });

  it("does not call deleteFile when no jobs are found", async () => {
    await GET(makeRequest());
    expect(serverStorage.deleteFile).not.toHaveBeenCalled();
  });

  it("returns error status when verifyAuthVercel throws", async () => {
    vi.mocked(verifyAuthVercel).mockRejectedValueOnce(new Error("Forbidden"));
    vi.mocked(handleErrorEdgeCases).mockReturnValueOnce({
      status: 403,
      message: "Forbidden",
    });

    const response = await GET(makeRequest());
    expect(response.status).toBe(403);
  });

  it("returns 500 when connectMongoDB throws", async () => {
    vi.mocked(connectMongoDB).mockRejectedValueOnce(new Error("DB Error"));

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });

  it("returns 500 when FailedJob.find throws", async () => {
    vi.mocked(FailedJob.find).mockReturnValue({
      lean: vi.fn().mockRejectedValue(new Error("Query failed")),
    } as any);

    const response = await GET(makeRequest());
    expect(response.status).toBe(500);
  });
});
