import Link from "next/link";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatUSD } from "@/lib/stripe";
import { FREE_SKU_LIMIT } from "@/lib/limits";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const { brand } = await requireBrand();
  const products = await prisma.product.findMany({
    where: { brandId: brand.id },
    orderBy: { createdAt: "desc" },
  });
  const isFree = brand.plan === "free";
  const atLimit = isFree && products.length >= FREE_SKU_LIMIT;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl">Catalog</h1>
          <p className="text-sm text-ink/60">
            {products.length} SKU{products.length === 1 ? "" : "s"}
            {isFree && ` · Free plan limit ${FREE_SKU_LIMIT}`}
          </p>
        </div>
        {atLimit ? (
          <Link href="/dashboard/plan" className="btn-primary">
            Upgrade to Pro to add more
          </Link>
        ) : (
          <Link href="/dashboard/products/new" className="btn-primary">
            + New product
          </Link>
        )}
      </div>

      {atLimit && (
        <div className="rounded-md border border-orange-700/30 bg-orange-50 px-4 py-3 text-sm">
          You&apos;ve hit the free-plan cap of {FREE_SKU_LIMIT} SKUs.{" "}
          <Link href="/dashboard/plan" className="underline">
            Upgrade to Pro
          </Link>{" "}
          for unlimited SKUs and links.
        </div>
      )}

      <div className="card p-0 overflow-hidden">
        {products.length === 0 ? (
          <div className="p-8 text-center text-ink/60">
            No products yet. Add your first SKU to build your line sheet.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase tracking-widest text-ink/50 bg-cream">
              <tr>
                <th className="p-4">Name</th>
                <th>Wholesale</th>
                <th>MOQ</th>
                <th>Unit</th>
                <th>Stock</th>
                <th className="text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t border-ink/10">
                  <td className="p-4 font-medium">
                    {p.name}
                    {!p.active && (
                      <span className="ml-2 text-[10px] uppercase tracking-widest text-ink/40">
                        hidden
                      </span>
                    )}
                  </td>
                  <td>{formatUSD(p.wholesalePriceCents)}</td>
                  <td>{p.moq}</td>
                  <td>{p.unit}</td>
                  <td>{p.stock ?? "—"}</td>
                  <td className="text-right pr-4">
                    <Link
                      href={`/dashboard/products/${p.id}`}
                      className="text-orange-700 hover:underline text-sm"
                    >
                      Edit
                    </Link>
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
