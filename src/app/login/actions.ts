"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { verifyPassword, createSession } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  const password = String(formData.get("password") || "");

  if (!email || !password) {
    redirect("/login?error=" + encodeURIComponent("Enter email and password."));
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    redirect("/login?error=" + encodeURIComponent("Invalid email or password."));
  }

  await createSession(user!.id);
  redirect("/dashboard");
}
