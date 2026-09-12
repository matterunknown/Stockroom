"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function saveOverrideAction(formData: FormData) {
  const { brand } = await requireBrand();
  if (brand.plan !== "pro") redirect("/dashboard/plan?locked=buyer_pricing");

  const buyerEmail = String(formData.get("buyerEmail") || "").toLowerCase().trim();
  const productId = String(formData.get("productId") || "");
  const priceRaw = Number(formData.get("unitPrice") || 0);
  if (!buyerEmail || !productId || priceRaw <= 0) return;

  const product = await prisma.product.findFirst({
    where: { id: productId, brandId: brand.id },
  });
  if (!product) return;

  await prisma.buyerPriceOverride.upsert({
    where: {
      brandId_productId_buyerEmail: {
        brandId: brand.id,
        productId,
        buyerEmail,
      },
    },
    update: { unitPriceCents: Math.round(priceRaw * 100) },
    create: {
      brandId: brand.id,
      productId,
      buyerEmail,
      unitPriceCents: Math.round(priceRaw * 100),
    },
  });
  revalidatePath("/dashboard/buyers");
}

export async function deleteOverrideAction(formData: FormData) {
  const { brand } = await requireBrand();
  const id = String(formData.get("id") || "");
  await prisma.buyerPriceOverride.deleteMany({
    where: { id, brandId: brand.id },
  });
  revalidatePath("/dashboard/buyers");
}
