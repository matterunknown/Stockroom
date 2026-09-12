import Link from "next/link";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUSD } from "@/lib/stripe";
import { deleteOverrideAction, saveOverrideAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BuyersPage() {
  const { brand } = await requireBrand();
  const isPro = brand.plan === "pro";

  const [products, overrides] = await Promise.all([
    prisma.product.findMany({
      where: { brandId: brand.id },
      orderBy: { name: "asc" },
    }),
    prisma.buyerPriceOverride.findMany({
      where: { brandId: brand.id },
      include: { product: true },
      orderBy: { buyerEmail: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-3xl">Buyer pricing</h1>
        <p className="text-sm text-ink/60">
          Give specific buyers (VIPs, net-terms accounts) a custom unit price on
          any SKU. When they check out with the matching email, they get their
          price.
        </p>
      </div>
      {!isPro && (
        <div className="rounded-md border border-orange-700/30 bg-orange-50 px-4 py-3 text-sm">
          Per-buyer pricing is a Pro feature.{" "}
          <Link href="/dashboard/plan" className="underline">
            Upgrade to Pro
          </Link>
          .
        </div>
      )}

      <form action={saveOverrideAction} className="card space-y-4">
        <fieldset disabled={!isPro} className={isPro ? "" : "opacity-60"}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Buyer email</label>
              <input
                required
                type="email"
                name="buyerEmail"
                className="input"
                placeholder="buyer@shop.com"
              />
            </div>
            <div>
              <label className="label">Product</label>
              <select required name="productId" className="input">
                <option value="">Select…</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Unit price (USD)</label>
              <input
                required
                type="number"
                step="0.01"
                min="0"
                name="unitPrice"
                className="input"
              />
            </div>
          </div>
          <button type="submit" className="btn-primary mt-4">
            Save override
          </button>
        </fieldset>
      </form>

      <div className="card p-0 overflow-hidden">
        {overrides.length === 0 ? (
          <div className="p-6 text-sm text-ink/60">
            No custom prices yet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-ink/50 bg-cream">
              <tr>
                <th className="p-4">Buyer</th>
                <th>Product</th>
                <th>Unit price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {overrides.map((o) => (
                <tr key={o.id} className="border-t border-ink/10">
                  <td className="p-4 font-medium">{o.buyerEmail}</td>
                  <td>{o.product.name}</td>
                  <td>{formatUSD(o.unitPriceCents)}</td>
                  <td className="text-right pr-4">
                    <form action={deleteOverrideAction} className="inline">
                      <input type="hidden" name="id" value={o.id} />
                      <button className="text-red-700 hover:underline text-sm">
                        Remove
                      </button>
                    </form>
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
