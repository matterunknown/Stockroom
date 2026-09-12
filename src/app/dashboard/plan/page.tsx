import { requireBrand } from "@/lib/auth";
import { upgradeAction } from "./actions";

export const dynamic = "force-dynamic";

const REASONS: Record<string, string> = {
  sku_limit: "You hit the free plan's 10-SKU limit. Upgrade to Pro for unlimited SKUs.",
  buyer_pricing: "Per-buyer pricing is Pro-only.",
  branding: "Custom branding is Pro-only.",
  extra_link: "Additional storefront links are Pro-only.",
};

export default async function PlanPage({
  searchParams,
}: {
  searchParams: { locked?: string; upgraded?: string };
}) {
  const { brand } = await requireBrand();
  const isPro = brand.plan === "pro";
  const reason = searchParams.locked ? REASONS[searchParams.locked] : null;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="font-display text-3xl">Your plan</h1>
      {searchParams.upgraded && (
        <div className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          Welcome to Pro. All Pro features are unlocked.
        </div>
      )}
      {reason && (
        <div className="rounded-md border border-orange-700/30 bg-orange-50 px-4 py-3 text-sm">
          {reason}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          className={
            "card " + (isPro ? "opacity-60" : "ring-1 ring-ink/20")
          }
        >
          <div className="text-xs uppercase tracking-widest text-ink/50">
            Free
          </div>
          <div className="font-display text-3xl mt-1">$0</div>
          <ul className="mt-4 text-sm text-ink/70 space-y-1">
            <li>1 storefront link</li>
            <li>Up to 10 SKUs</li>
            <li>0% commission</li>
          </ul>
          {!isPro && (
            <div className="text-xs uppercase tracking-widest text-emerald-700 mt-6">
              Current plan
            </div>
          )}
        </div>
        <div
          className={
            "card " +
            (isPro
              ? "ring-1 ring-orange-700/40 bg-orange-50/40"
              : "border-orange-700/40")
          }
        >
          <div className="text-xs uppercase tracking-widest text-orange-700">
            Pro
          </div>
          <div className="font-display text-3xl mt-1">
            $29<span className="text-base text-ink/50">/mo</span>
          </div>
          <ul className="mt-4 text-sm text-ink/70 space-y-1">
            <li>Unlimited storefront links + SKUs</li>
            <li>Per-buyer pricing</li>
            <li>Custom logo + colors</li>
            <li>0% commission</li>
          </ul>
          {isPro ? (
            <div className="text-xs uppercase tracking-widest text-orange-700 mt-6">
              Current plan
            </div>
          ) : (
            <form action={upgradeAction} className="mt-6">
              <button className="btn-primary w-full">
                Upgrade to Pro — $29/mo
              </button>
              <p className="text-xs text-ink/50 mt-2">
                Billing via Stripe. Cancel any time.
              </p>
            </form>
          )}
        </div>
      </div>
      <p className="text-xs text-ink/50">
        Stockroom charges <strong>zero commission</strong> on your orders on
        both plans. You pay Stripe processing fees (~2.9% + $0.30) directly to
        Stripe.
      </p>
    </div>
  );
}
