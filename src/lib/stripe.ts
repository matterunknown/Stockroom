import Stripe from "stripe";

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error(
      "STRIPE_SECRET_KEY is not set. Copy .env.example to .env and fill in your Stripe keys."
    );
  }
  cached = new Stripe(key);
  return cached;
}

export function appUrl(path = "") {
  const base = process.env.APP_URL || "http://localhost:3000";
  return base.replace(/\/$/, "") + path;
}

export function formatUSD(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}
