export const stripe = require("stripe")(process.env.STRIPE_SK!, {
  apiVersion: "2025-11-17.clover",
});
