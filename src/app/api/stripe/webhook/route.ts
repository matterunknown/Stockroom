import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/db";
import { getStripe } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = req.headers.get("stripe-signature");
  if (!secret || !signature) {
    return NextResponse.json(
      { error: "Missing STRIPE_WEBHOOK_SECRET or signature." },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    console.error("Stripe webhook signature verification failed:", err);
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const kind = session.metadata?.kind;

        if (kind === "pro_upgrade") {
          const brandId = session.metadata?.brandId;
          const subscriptionId =
            typeof session.subscription === "string"
              ? session.subscription
              : session.subscription?.id;
          if (brandId) {
            await prisma.brand.update({
              where: { id: brandId },
              data: {
                plan: "pro",
                stripeSubscriptionId: subscriptionId ?? null,
                stripeCustomerId:
                  typeof session.customer === "string"
                    ? session.customer
                    : session.customer?.id ?? null,
              },
            });
          }
        } else {
          const orderId = session.metadata?.orderId;
          if (orderId) {
            await prisma.order.updateMany({
              where: { id: orderId, status: "new" },
              data: {
                status: "paid",
                paidAt: new Date(),
                stripePaymentIntentId:
                  typeof session.payment_intent === "string"
                    ? session.payment_intent
                    : session.payment_intent?.id ?? null,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const brandId = (sub.metadata?.brandId as string | undefined) || null;
        const active = ["active", "trialing", "past_due"].includes(sub.status);
        if (brandId) {
          await prisma.brand.update({
            where: { id: brandId },
            data: {
              plan: active ? "pro" : "free",
              stripeSubscriptionId: sub.id,
            },
          });
        } else if (typeof sub.customer === "string") {
          const brand = await prisma.brand.findFirst({
            where: { stripeCustomerId: sub.customer },
          });
          if (brand) {
            await prisma.brand.update({
              where: { id: brand.id },
              data: {
                plan: active ? "pro" : "free",
                stripeSubscriptionId: sub.id,
              },
            });
          }
        }
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        const brandId = (sub.metadata?.brandId as string | undefined) || null;
        if (brandId) {
          await prisma.brand.update({
            where: { id: brandId },
            data: { plan: "free", stripeSubscriptionId: null },
          });
        } else if (typeof sub.customer === "string") {
          const brand = await prisma.brand.findFirst({
            where: { stripeCustomerId: sub.customer },
          });
          if (brand) {
            await prisma.brand.update({
              where: { id: brand.id },
              data: { plan: "free", stripeSubscriptionId: null },
            });
          }
        }
        break;
      }

      default:
        break;
    }
  } catch (err) {
    console.error("Webhook handler error", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
