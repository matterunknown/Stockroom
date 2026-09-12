import Link from "next/link";
import { requireBrand } from "@/lib/auth";
import { saveBrandingAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function BrandingPage({
  searchParams,
}: {
  searchParams: { saved?: string };
}) {
  const { brand } = await requireBrand();
  const isPro = brand.plan === "pro";

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-3xl mb-2">Storefront branding</h1>
      <p className="text-sm text-ink/60 mb-6">
        Give your line sheet a look that feels like yours. Logo + brand colors
        are a Pro feature.
      </p>
      {searchParams.saved && (
        <div className="mb-4 rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Branding saved.
        </div>
      )}
      {!isPro && (
        <div className="mb-6 rounded-md border border-orange-700/30 bg-orange-50 px-4 py-3 text-sm">
          Storefront branding is a Pro feature.{" "}
          <Link href="/dashboard/plan" className="underline">
            Upgrade to Pro
          </Link>{" "}
          to unlock logo + custom colors.
        </div>
      )}
      <form action={saveBrandingAction} className="card space-y-4">
        <div>
          <label className="label">Brand name</label>
          <input required name="name" defaultValue={brand.name} className="input" />
        </div>
        <div>
          <label className="label">Tagline (shown on storefront)</label>
          <input name="tagline" defaultValue={brand.tagline ?? ""} className="input" />
        </div>
        <fieldset disabled={!isPro} className={isPro ? "" : "opacity-60"}>
          <div>
            <label className="label">Logo URL</label>
            <input
              name="logoUrl"
              defaultValue={brand.logoUrl ?? ""}
              className="input"
              placeholder="https://your-cdn.com/logo.png"
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div>
              <label className="label">Primary color</label>
              <input
                name="primaryColor"
                defaultValue={brand.primaryColor}
                className="input"
                placeholder="#0f172a"
              />
            </div>
            <div>
              <label className="label">Accent color</label>
              <input
                name="accentColor"
                defaultValue={brand.accentColor}
                className="input"
                placeholder="#c2410c"
              />
            </div>
          </div>
        </fieldset>
        <button type="submit" className="btn-primary">
          Save branding
        </button>
      </form>
    </div>
  );
}
