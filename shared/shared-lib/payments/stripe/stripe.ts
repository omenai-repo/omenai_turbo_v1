export const stripe = require("stripe")(process.env.STRIPE_SK!, {
  apiVersion: "2024-06-20",
});
