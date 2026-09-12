import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { appUrl, getStripe } from "@/lib/stripe";

const bodySchema = z.object({
  buyerEmail: z.string().email(),
  buyerName: z.string().optional().default(""),
  buyerCompany: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  items: z
    .array(
      z.object({
        productId: z.string(),
        quantity: z.number().int().positive(),
      })
    )
    .min(1),
});

export async function POST(
  req: Request,
  { params }: { params: { slug: string } }
) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
  });
  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  let body;
  try {
    body = bodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const buyerEmail = body.buyerEmail.toLowerCase().trim();

  const productIds = body.items.map((i) => i.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, brandId: brand.id, active: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p]));

  const overrides = await prisma.buyerPriceOverride.findMany({
    where: {
      brandId: brand.id,
      buyerEmail,
      productId: { in: productIds },
    },
  });
  const overrideMap = new Map(overrides.map((o) => [o.productId, o]));
  const applyOverrides = brand.plan === "pro";

  const lineItems: {
    productId: string;
    name: string;
    unitPriceCents: number;
    quantity: number;
    totalCents: number;
  }[] = [];

  for (const item of body.items) {
    const product = productMap.get(item.productId);
    if (!product) {
      return NextResponse.json(
        { error: `Product ${item.productId} unavailable.` },
        { status: 400 }
      );
    }
    if (item.quantity < product.moq) {
      return NextResponse.json(
        {
          error: `${product.name} requires a minimum of ${product.moq} ${product.unit}.`,
        },
        { status: 400 }
      );
    }
    const override = applyOverrides ? overrideMap.get(product.id) : undefined;
    const unitPriceCents = override
      ? override.unitPriceCents
      : product.wholesalePriceCents;
    lineItems.push({
      productId: product.id,
      name: product.name,
      unitPriceCents,
      quantity: item.quantity,
      totalCents: unitPriceCents * item.quantity,
    });
  }

  const subtotal = lineItems.reduce((s, i) => s + i.totalCents, 0);

  const order = await prisma.order.create({
    data: {
      brandId: brand.id,
      buyerEmail,
      buyerName: body.buyerName || null,
      buyerCompany: body.buyerCompany || null,
      notes: body.notes || null,
      status: "new",
      subtotalCents: subtotal,
      totalCents: subtotal,
      items: {
        create: lineItems.map((li) => ({
          productId: li.productId,
          productName: li.name,
          unitPriceCents: li.unitPriceCents,
          quantity: li.quantity,
          totalCents: li.totalCents,
        })),
      },
    },
  });

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      {
        error:
          "Stripe is not configured. Add STRIPE_SECRET_KEY to enable checkout.",
      },
      { status: 500 }
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: buyerEmail,
    line_items: lineItems.map((li) => ({
      quantity: li.quantity,
      price_data: {
        currency: "usd",
        unit_amount: li.unitPriceCents,
        product_data: {
          name: li.name,
          metadata: { productId: li.productId },
        },
      },
    })),
    metadata: {
      orderId: order.id,
      brandId: brand.id,
      brandSlug: brand.slug,
    },
    payment_intent_data: {
      metadata: { orderId: order.id, brandId: brand.id },
    },
    success_url: appUrl(`/w/${brand.slug}?paid=1`),
    cancel_url: appUrl(`/w/${brand.slug}?canceled=1`),
  });

  await prisma.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
