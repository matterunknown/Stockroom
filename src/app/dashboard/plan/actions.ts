"use server";

import { redirect } from "next/navigation";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appUrl, getStripe } from "@/lib/stripe";

export async function upgradeAction() {
  const { user, brand } = await requireBrand();

  const priceId = process.env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    redirect(
      "/dashboard/plan?locked=" +
        encodeURIComponent(
          "extra_link"
        )
    );
  }

  const stripe = getStripe();

  let customerId = brand.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { brandId: brand.id, userId: user.id },
    });
    customerId = customer.id;
    await prisma.brand.update({
      where: { id: brand.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId!,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: appUrl("/dashboard/plan?upgraded=1"),
    cancel_url: appUrl("/dashboard/plan"),
    metadata: { brandId: brand.id, kind: "pro_upgrade" },
    subscription_data: {
      metadata: { brandId: brand.id },
    },
  });

  if (session.url) redirect(session.url);
  redirect("/dashboard/plan");
}
