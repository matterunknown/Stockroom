"use server";

import { redirect } from "next/navigation";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function updateProductAction(formData: FormData) {
  const { brand } = await requireBrand();
  const id = String(formData.get("id") || "");
  const product = await prisma.product.findFirst({
    where: { id, brandId: brand.id },
  });
  if (!product) redirect("/dashboard/products");

  const name = String(formData.get("name") || "").trim();
  const priceRaw = Number(formData.get("wholesalePrice") || 0);
  if (!name || priceRaw <= 0) {
    redirect(
      `/dashboard/products/${id}?error=` +
        encodeURIComponent("Name and price required.")
    );
  }
  const stockRaw = formData.get("stock");
  await prisma.product.update({
    where: { id },
    data: {
      name,
      description: String(formData.get("description") || "").trim() || null,
      imageUrl: String(formData.get("imageUrl") || "").trim() || null,
      wholesalePriceCents: Math.round(priceRaw * 100),
      moq: Math.max(1, Number(formData.get("moq") || 1)),
      unit: String(formData.get("unit") || "unit").trim() || "unit",
      stock:
        stockRaw === null || stockRaw === "" ? null : Number(stockRaw),
      active: formData.get("active") === "on",
    },
  });
  redirect("/dashboard/products");
}

export async function deleteProductAction(formData: FormData) {
  const { brand } = await requireBrand();
  const id = String(formData.get("id") || "");
  await prisma.product.deleteMany({ where: { id, brandId: brand.id } });
  redirect("/dashboard/products");
}
