import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { formatUSD } from "@/lib/stripe";
import StorefrontCart from "./StorefrontCart";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const brand = await prisma.brand.findUnique({ where: { slug: params.slug } });
  if (!brand) return { title: "Not found" };
  return {
    title: `${brand.name} — wholesale line sheet`,
    description: brand.tagline || `Wholesale order form for ${brand.name}.`,
  };
}

export default async function StorefrontPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { paid?: string; canceled?: string };
}) {
  const brand = await prisma.brand.findUnique({
    where: { slug: params.slug },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  if (!brand) notFound();
  const isPro = brand.plan === "pro";

  const primary = isPro ? brand.primaryColor : "#0f172a";
  const accent = isPro ? brand.accentColor : "#c2410c";

  return (
    <div style={{ background: "#faf7f2", minHeight: "100vh" }}>
      <header
        className="border-b border-black/10"
        style={{ background: primary, color: "#faf7f2" }}
      >
        <div className="mx-auto max-w-5xl px-6 py-8 flex items-center gap-4">
          {isPro && brand.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-10 w-10 rounded object-cover bg-white/10"
            />
          ) : null}
          <div>
            <h1 className="font-display text-3xl">{brand.name}</h1>
            {brand.tagline && (
              <p className="text-sm opacity-80 mt-1">{brand.tagline}</p>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        {searchParams.paid && (
          <div
            className="mb-6 rounded-md border px-4 py-3 text-sm"
            style={{
              borderColor: accent,
              background: "rgba(255,255,255,0.6)",
              color: primary,
            }}
          >
            Order received. Check your email for a receipt — {brand.name} will
            be in touch about shipping.
          </div>
        )}
        {searchParams.canceled && (
          <div className="mb-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
            Checkout canceled. Your cart is still here when you&apos;re ready.
          </div>
        )}
        <div className="mb-6">
          <span
            className="text-[10px] uppercase tracking-widest rounded-full px-2 py-1"
            style={{ background: accent, color: "#faf7f2" }}
          >
            Wholesale · Trade only
          </span>
          <p className="text-sm text-ink/70 mt-3 max-w-xl">
            Prices below are wholesale unit prices. Minimum order quantities
            (MOQ) apply per product. Pay by card at checkout.
          </p>
        </div>

        {brand.products.length === 0 ? (
          <div className="card text-sm text-ink/60">
            This brand hasn&apos;t published any products yet.
          </div>
        ) : (
          <StorefrontCart
            slug={brand.slug}
            accent={accent}
            products={brand.products.map((p) => ({
              id: p.id,
              name: p.name,
              description: p.description,
              imageUrl: p.imageUrl,
              wholesalePriceCents: p.wholesalePriceCents,
              moq: p.moq,
              unit: p.unit,
              stock: p.stock ?? null,
              displayPrice: formatUSD(p.wholesalePriceCents),
            }))}
          />
        )}
        <p className="mt-10 text-xs text-ink/50">
          Powered by Stockroom · Commission-free wholesale for makers. Card
          payments processed by Stripe (~2.9% + $0.30 fee, paid to Stripe).
        </p>
      </main>
    </div>
  );
}
