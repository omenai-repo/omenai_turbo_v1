import { vi } from "vitest";

export function buildWorkflowServeMock() {
  return {
    serve: (handler: any) => ({
      POST: async (req: Request) => {
        try {
          const body = await req.json();
          const ctx = {
            requestPayload: body,
            run: async (_name: string, fn: () => any) => fn(),
          };
          const result = await handler(ctx);
          if (result instanceof Response) return result;
          return new Response(JSON.stringify({ data: result ?? null }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        } catch (error: any) {
          return new Response(
            JSON.stringify({ message: error?.message ?? "Internal Server Error" }),
            { status: 500, headers: { "Content-Type": "application/json" } },
          );
        }
      },
    }),
  };
}

class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

const sharedStubs = () => ({
  createErrorRollbarReport: vi.fn(),
  validateDHLAddress: vi.fn(),
  getShipmentRates: vi.fn(),
});

export function buildValidateRequestBodyMock() {
  return {
    ...sharedStubs(),
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
  };
}

export function buildValidateGetRouteParamsMock() {
  return {
    ...sharedStubs(),
    validateGetRouteParams: vi
      .fn()
      .mockImplementation((schema: any, data: any) => {
        const result = schema.safeParse(data);
        if (!result.success)
          throw new BadRequestError("Invalid URL parameters");
        return data;
      }),
  };
}

export function buildCombinedValidatorsMock() {
  return {
    ...sharedStubs(),
    validateRequestBody: vi
      .fn()
      .mockImplementation(async (request: Request, schema: any) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          throw new BadRequestError(
            "Invalid JSON syntax: Request body could not be parsed.",
          );
        }
        const result = schema.safeParse(body);
        if (!result.success) {
          const msg = result.error.issues
            .map((e: any) => `${e.path.join(".")}: ${e.message}`)
            .join(", ");
          throw new BadRequestError(`Validation Failed: ${msg}`);
        }
        return result.data;
      }),
    validateGetRouteParams: vi
      .fn()
      .mockImplementation((schema: any, data: any) => {
        const result = schema.safeParse(data);
        if (!result.success)
          throw new BadRequestError("Invalid URL parameters");
        return data;
      }),
  };
}
