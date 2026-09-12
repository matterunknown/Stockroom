import { redirect } from "next/navigation";
import Link from "next/link";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { FREE_SKU_LIMIT } from "@/lib/limits";
import { createProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const { brand } = await requireBrand();
  const count = await prisma.product.count({ where: { brandId: brand.id } });
  if (brand.plan === "free" && count >= FREE_SKU_LIMIT) {
    redirect("/dashboard/plan?locked=sku_limit");
  }
  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/products" className="text-sm text-ink/60 hover:text-ink">
        ← Back to catalog
      </Link>
      <h1 className="font-display text-3xl mt-2 mb-6">New product</h1>
      {searchParams.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}
      <form action={createProductAction} className="card space-y-4">
        <div>
          <label className="label">Name</label>
          <input required name="name" className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={3} className="input" />
        </div>
        <div>
          <label className="label">Image URL (optional)</label>
          <input name="imageUrl" className="input" placeholder="https://..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Wholesale price (USD)</label>
            <input required type="number" min="0" step="0.01" name="wholesalePrice" className="input" />
          </div>
          <div>
            <label className="label">Minimum order qty</label>
            <input required type="number" min="1" defaultValue={1} name="moq" className="input" />
          </div>
          <div>
            <label className="label">Unit label</label>
            <input required name="unit" defaultValue="unit" className="input" />
          </div>
          <div>
            <label className="label">Stock (optional)</label>
            <input type="number" min="0" name="stock" className="input" />
          </div>
        </div>
        <button type="submit" className="btn-primary">
          Create product
        </button>
      </form>
    </div>
  );
}
