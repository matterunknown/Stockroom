"use server";

import { redirect } from "next/navigation";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FREE_SKU_LIMIT } from "@/lib/limits";

export async function createProductAction(formData: FormData) {
  const { brand } = await requireBrand();

  const count = await prisma.product.count({ where: { brandId: brand.id } });
  if (brand.plan === "free" && count >= FREE_SKU_LIMIT) {
    redirect("/dashboard/plan?locked=sku_limit");
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") || "").trim() || null;
  const priceRaw = Number(formData.get("wholesalePrice") || 0);
  const moq = Math.max(1, Number(formData.get("moq") || 1));
  const unit = String(formData.get("unit") || "unit").trim() || "unit";
  const stockRaw = formData.get("stock");
  const stock =
    stockRaw === null || stockRaw === "" ? null : Number(stockRaw);

  if (!name || priceRaw <= 0) {
    redirect(
      "/dashboard/products/new?error=" +
        encodeURIComponent("Name and price are required.")
    );
  }

  await prisma.product.create({
    data: {
      brandId: brand.id,
      name,
      description,
      imageUrl,
      wholesalePriceCents: Math.round(priceRaw * 100),
      moq,
      unit,
      stock,
    },
  });

  redirect("/dashboard/products");
}
