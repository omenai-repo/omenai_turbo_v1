export const stripe = require("stripe")(process.env.STRIPE_SK!, {
  apiVersion: "2026-04-22.dahlia",
});
