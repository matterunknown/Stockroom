import Link from "next/link";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { appUrl, formatUSD } from "@/lib/stripe";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const { brand } = await requireBrand();

  const [productCount, orders] = await Promise.all([
    prisma.product.count({ where: { brandId: brand.id } }),
    prisma.order.findMany({
      where: { brandId: brand.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const paidRevenueCents = await prisma.order.aggregate({
    _sum: { totalCents: true },
    where: { brandId: brand.id, status: { in: ["paid", "fulfilled"] } },
  });

  const link = appUrl("/w/" + brand.slug);

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="text-xs uppercase tracking-widest text-ink/50">
          Your storefront link
        </div>
        <div className="mt-1 flex flex-col md:flex-row md:items-center gap-3 justify-between">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="font-mono text-lg text-orange-700 break-all"
          >
            {link}
          </a>
          <div className="flex gap-2">
            <Link href="/dashboard/products" className="btn-secondary">
              Manage catalog
            </Link>
            <a href={link} target="_blank" rel="noreferrer" className="btn-primary">
              Open storefront
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="text-xs uppercase tracking-widest text-ink/50">
            SKUs
          </div>
          <div className="mt-1 font-display text-3xl">{productCount}</div>
          <div className="text-xs text-ink/50">
            {brand.plan === "free" ? "Free plan: 10 max" : "Pro: unlimited"}
          </div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-widest text-ink/50">
            Orders
          </div>
          <div className="mt-1 font-display text-3xl">
            {await prisma.order.count({ where: { brandId: brand.id } })}
          </div>
        </div>
        <div className="card">
          <div className="text-xs uppercase tracking-widest text-ink/50">
            Paid revenue
          </div>
          <div className="mt-1 font-display text-3xl">
            {formatUSD(paidRevenueCents._sum.totalCents || 0)}
          </div>
          <div className="text-xs text-ink/50">
            Stripe fees (~2.9% + $0.30) apply. Stockroom takes 0%.
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl">Recent orders</h2>
          <Link className="text-sm text-orange-700 hover:underline" href="/dashboard/orders">
            View all →
          </Link>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-ink/60">
            No orders yet. Share your link with a buyer to receive your first
            order.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-ink/50">
              <tr>
                <th className="py-2">Buyer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-ink/10">
                  <td className="py-2">
                    {o.buyerCompany || o.buyerName || o.buyerEmail}
                  </td>
                  <td>{formatUSD(o.totalCents)}</td>
                  <td>
                    <span className="text-xs uppercase tracking-widest text-ink/60">
                      {o.status}
                    </span>
                  </td>
                  <td className="text-ink/60">
                    {o.createdAt.toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
