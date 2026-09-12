import Link from "next/link";
import { notFound } from "next/navigation";
import { requireBrand } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateProductAction, deleteProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function EditProduct({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { error?: string };
}) {
  const { brand } = await requireBrand();
  const product = await prisma.product.findFirst({
    where: { id: params.id, brandId: brand.id },
  });
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/dashboard/products" className="text-sm text-ink/60 hover:text-ink">
        ← Back to catalog
      </Link>
      <h1 className="font-display text-3xl mt-2 mb-6">Edit product</h1>
      {searchParams.error && (
        <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {searchParams.error}
        </div>
      )}
      <form action={updateProductAction} className="card space-y-4">
        <input type="hidden" name="id" value={product.id} />
        <div>
          <label className="label">Name</label>
          <input required name="name" defaultValue={product.name} className="input" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea name="description" rows={3} defaultValue={product.description ?? ""} className="input" />
        </div>
        <div>
          <label className="label">Image URL</label>
          <input name="imageUrl" defaultValue={product.imageUrl ?? ""} className="input" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Wholesale price (USD)</label>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              name="wholesalePrice"
              defaultValue={(product.wholesalePriceCents / 100).toFixed(2)}
              className="input"
            />
          </div>
          <div>
            <label className="label">MOQ</label>
            <input required type="number" min="1" name="moq" defaultValue={product.moq} className="input" />
          </div>
          <div>
            <label className="label">Unit label</label>
            <input required name="unit" defaultValue={product.unit} className="input" />
          </div>
          <div>
            <label className="label">Stock</label>
            <input type="number" min="0" name="stock" defaultValue={product.stock ?? ""} className="input" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={product.active} />
          Visible on storefront
        </label>
        <div className="flex items-center justify-between">
          <button type="submit" className="btn-primary">
            Save changes
          </button>
        </div>
      </form>

      <form action={deleteProductAction} className="mt-6">
        <input type="hidden" name="id" value={product.id} />
        <button type="submit" className="btn-danger">
          Delete product
        </button>
      </form>
    </div>
  );
}
