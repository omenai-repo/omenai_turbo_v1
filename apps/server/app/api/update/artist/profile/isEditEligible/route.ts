import { daysLeft } from "@omenai/shared-utils/src/daysLeft";
import { NextRequest, NextResponse } from "next/server";
import { handleErrorEdgeCases } from "../../../../../../custom/errors/handler/errorHandler";
import { ArtistCategorization } from "@omenai/shared-models/models/artist/ArtistCategorizationSchema";
import {
  ForbiddenError,
  NotFoundError,
} from "../../../../../../custom/errors/dictionary/errorDictionary";

import {
  addYears,
  differenceInCalendarDays,
  isAfter,
  startOfDay,
} from "date-fns";

import {
  standardRateLimit,
  strictRateLimit,
} from "@omenai/shared-lib/auth/configs/rate_limit_configs";
import { withRateLimitHighlightAndCsrf } from "@omenai/shared-lib/auth/middleware/combined_middleware";
import { CombinedConfig } from "@omenai/shared-types";
import { createErrorRollbarReport } from "../../../../util";

type Result = {
  isOneYearPassed: boolean;
  daysLeft: number;
};

const checkIfOneYearPassed = (ts: string): Result => {
  const givenDate = startOfDay(new Date(ts));
  const oneYearLater = startOfDay(addYears(givenDate, 1));
  const today = startOfDay(new Date());
  const daysLeft = differenceInCalendarDays(oneYearLater, today);
  if (!isAfter(oneYearLater, today)) {
    return { isOneYearPassed: true, daysLeft: 0 };
  }

  return { isOneYearPassed: false, daysLeft };
};

const config: CombinedConfig = {
  ...standardRateLimit,
  allowedRoles: ["artist"],
};

export const POST = withRateLimitHighlightAndCsrf(config)(async function POST(
  request: Request,
) {
  try {
    const { artist_id } = await request.json();

    const find_artist_categorization = await ArtistCategorization.findOne(
      { artist_id },
      "updatedAt request",
    );
    if (!find_artist_categorization)
      throw new NotFoundError("Categorization data not found for this Artist");

    const { updatedAt } = find_artist_categorization;

    if (find_artist_categorization.request !== null)
      throw new ForbiddenError(
        "A request to update your credentials is already in progress. Please be patient while we process your request.",
      );

    const isEligible: Result = checkIfOneYearPassed(updatedAt);
    const eligibility = {
      isEligible: isEligible.isOneYearPassed,
      daysLeft: isEligible.daysLeft,
    };

    return NextResponse.json(
      { message: "Eligibility retrieved successfully", eligibility },
      { status: 200 },
    );
  } catch (error) {
    const error_response = handleErrorEdgeCases(error);
    createErrorRollbarReport(
      "updates: artist profile is edit eligible",
      error,
      error_response.status,
    );
    return NextResponse.json(
      { message: error_response?.message },
      { status: error_response?.status },
    );
  }
});
