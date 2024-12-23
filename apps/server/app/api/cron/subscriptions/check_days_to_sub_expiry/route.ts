import { connectMongoDB } from "@omenai/shared-lib/mongo_connect/mongoConnect";
import { Subscriptions } from "@omenai/shared-models/models/subscriptions/SubscriptionSchema";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    await connectMongoDB();

    const today = new Date();

    const results = await Subscriptions.aggregate([
      {
        $match: {
          $expr: {
            $in: [
              {
                $dateDiff: {
                  startDate: today,
                  endDate: "$expiry_date",
                  unit: "day",
                },
              },
              [3, 2, 1],
            ],
          },
        },
      },
      {
        $project: {
          "customer.email": 1, // Include userId
        },
      },
    ]);

    // todo: Send reminder mail to users

    return NextResponse.json({ data: results, mesage: "Success" });
  } catch (error) {}
}
