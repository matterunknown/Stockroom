import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "demo@stockroom.local";
  const password = "demo1234";
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
    },
  });

  const brand = await prisma.brand.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      slug: "cedar-and-sage",
      name: "Cedar & Sage",
      plan: "free",
      tagline: "Small-batch soy candles, hand-poured in Vermont.",
      primaryColor: "#2f4f3a",
      accentColor: "#c98a5b",
    },
  });

  const existing = await prisma.product.count({ where: { brandId: brand.id } });
  if (existing === 0) {
    await prisma.product.createMany({
      data: [
        {
          brandId: brand.id,
          name: "Cedarwood Candle 8oz",
          description: "Woody, warm, small-batch. Case of 6.",
          wholesalePriceCents: 1400,
          moq: 6,
          unit: "candle",
          stock: 240,
        },
        {
          brandId: brand.id,
          name: "Sage & Sea Salt Candle 8oz",
          description: "Herbal, coastal. Case of 6.",
          wholesalePriceCents: 1400,
          moq: 6,
          unit: "candle",
          stock: 180,
        },
        {
          brandId: brand.id,
          name: "Travel Tin 4oz",
          description: "Assorted scents. Case of 12.",
          wholesalePriceCents: 700,
          moq: 12,
          unit: "tin",
          stock: 500,
        },
      ],
    });
  }

  console.log("Seeded:");
  console.log("  Login:", email, "/", password);
  console.log("  Storefront: /w/" + brand.slug);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
