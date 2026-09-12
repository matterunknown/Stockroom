"use server";

import { revalidatePath } from "next/cache";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function markPaidAction(formData: FormData) {
  const { brand } = await requireBrand();
  const id = String(formData.get("id") || "");
  await prisma.order.updateMany({
    where: { id, brandId: brand.id },
    data: { status: "paid", paidAt: new Date() },
  });
  revalidatePath("/dashboard/orders");
}

export async function markFulfilledAction(formData: FormData) {
  const { brand } = await requireBrand();
  const id = String(formData.get("id") || "");
  await prisma.order.updateMany({
    where: { id, brandId: brand.id },
    data: { status: "fulfilled", fulfilledAt: new Date() },
  });
  revalidatePath("/dashboard/orders");
}
