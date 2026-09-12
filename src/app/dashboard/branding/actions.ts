"use server";

import { redirect } from "next/navigation";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function saveBrandingAction(formData: FormData) {
  const { brand } = await requireBrand();
  const isPro = brand.plan === "pro";

  const data: Record<string, unknown> = {
    name: String(formData.get("name") || brand.name).trim() || brand.name,
    tagline: String(formData.get("tagline") || "").trim() || null,
  };

  if (isPro) {
    data.logoUrl = String(formData.get("logoUrl") || "").trim() || null;
    data.primaryColor =
      String(formData.get("primaryColor") || "").trim() || brand.primaryColor;
    data.accentColor =
      String(formData.get("accentColor") || "").trim() || brand.accentColor;
  }

  await prisma.brand.update({ where: { id: brand.id }, data });
  redirect("/dashboard/branding?saved=1");
}
