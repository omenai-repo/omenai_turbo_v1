export const stripe = require("stripe")(process.env.STRIPE_SK!, {
  apiVersion: "2025-08-27.basil",
});
