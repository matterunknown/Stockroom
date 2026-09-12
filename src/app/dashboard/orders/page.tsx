import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUSD } from "@/lib/stripe";
import { markFulfilledAction, markPaidAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const { brand } = await requireBrand();
  const orders = await prisma.order.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl">Orders</h1>
      {orders.length === 0 ? (
        <div className="card text-sm text-ink/60">
          No orders yet. Share your storefront link to receive your first
          wholesale order.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    {o.buyerCompany || o.buyerName || o.buyerEmail}
                  </div>
                  <div className="text-xs text-ink/60">
                    {o.buyerEmail} · placed{" "}
                    {o.createdAt.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium">
                    {formatUSD(o.totalCents)}
                  </div>
                  <StatusPill status={o.status} />
                  <OrderActions status={o.status} orderId={o.id} />
                </div>
              </div>
              <table className="mt-4 w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-widest text-ink/50">
                  <tr>
                    <th>Product</th>
                    <th>Unit price</th>
                    <th>Qty</th>
                    <th className="text-right">Line total</th>
                  </tr>
                </thead>
                <tbody>
                  {o.items.map((it) => (
                    <tr key={it.id} className="border-t border-ink/10">
                      <td className="py-2">{it.productName}</td>
                      <td>{formatUSD(it.unitPriceCents)}</td>
                      <td>{it.quantity}</td>
                      <td className="text-right">{formatUSD(it.totalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {o.notes && (
                <div className="mt-3 text-sm text-ink/70">
                  <span className="text-xs uppercase tracking-widest text-ink/50">
                    Note from buyer:
                  </span>{" "}
                  {o.notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    new: "bg-ink/10 text-ink/70",
    paid: "bg-emerald-100 text-emerald-800",
    fulfilled: "bg-orange-700/10 text-orange-800",
  };
  return (
    <span
      className={
        "text-[10px] uppercase tracking-widest rounded-full px-2 py-0.5 " +
        (map[status] || "bg-ink/10 text-ink/70")
      }
    >
      {status}
    </span>
  );
}

function OrderActions({
  status,
  orderId,
}: {
  status: string;
  orderId: string;
}) {
  if (status === "new") {
    return (
      <form action={markPaidAction}>
        <input type="hidden" name="id" value={orderId} />
        <button className="btn-secondary text-xs">Mark paid</button>
      </form>
    );
  }
  if (status === "paid") {
    return (
      <form action={markFulfilledAction}>
        <input type="hidden" name="id" value={orderId} />
        <button className="btn-secondary text-xs">Mark fulfilled</button>
      </form>
    );
  }
  return null;
}
