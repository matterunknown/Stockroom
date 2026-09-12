"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, createSession } from "@/lib/auth";
import { slugify } from "@/lib/slug";

export async function signupAction(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");
  const brandName = String(formData.get("brandName") || "").trim();

  if (!email || !password || !brandName) {
    redirect("/signup?error=" + encodeURIComponent("All fields are required."));
  }
  if (password.length < 8) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("Password must be at least 8 characters.")
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect(
      "/signup?error=" +
        encodeURIComponent("An account with that email already exists.")
    );
  }

  let slug = slugify(brandName);
  let attempt = 0;
  while (await prisma.brand.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${slugify(brandName)}-${attempt}`;
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      brand: {
        create: {
          slug,
          name: brandName,
          plan: "free",
        },
      },
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}
