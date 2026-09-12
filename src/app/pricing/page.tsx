import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export const metadata = { title: "Pricing — Stockroom" };

export default function PricingPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-6 py-20">
        <h1 className="font-display text-4xl md:text-5xl mb-4">
          Simple pricing. Zero commission.
        </h1>
        <p className="text-ink/70 max-w-2xl">
          Stockroom never takes a cut of your sales. Only Stripe processing
          fees (~2.9% + $0.30 per order) apply — that&apos;s it.
        </p>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card flex flex-col">
            <div className="text-xs uppercase tracking-widest text-ink/50">
              Free
            </div>
            <div className="mt-2 font-display text-4xl">
              $0<span className="text-base text-ink/50">/mo</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-ink/80 flex-1">
              <li>1 storefront link</li>
              <li>Up to 10 SKUs</li>
              <li>Stripe Checkout for wholesale orders</li>
              <li>Manual fulfillment tracking</li>
              <li>0% platform commission</li>
            </ul>
            <Link href="/signup" className="btn-secondary mt-8">
              Start free
            </Link>
          </div>

          <div className="card flex flex-col border-orange-700/40 ring-1 ring-orange-700/20">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-widest text-orange-700">
                Pro
              </div>
              <span className="text-xs rounded-full bg-orange-700/10 px-2 py-1 text-orange-800">
                Most popular
              </span>
            </div>
            <div className="mt-2 font-display text-4xl">
              $29<span className="text-base text-ink/50">/mo</span>
            </div>
            <ul className="mt-6 space-y-2 text-sm text-ink/80 flex-1">
              <li>Unlimited storefront links</li>
              <li>Unlimited SKUs</li>
              <li>Per-buyer pricing (net terms tiers, VIP accounts)</li>
              <li>Custom branding: logo + colors</li>
              <li>Everything in Free</li>
              <li>0% platform commission</li>
            </ul>
            <Link href="/signup" className="btn-primary mt-8">
              Start with Pro
            </Link>
          </div>
        </div>

        <p className="mt-10 text-sm text-ink/60 max-w-3xl">
          <strong>How this compares:</strong> Faire, Abound and Bulletin
          typically take 15%+ of every wholesale order, plus a 15% commission
          on every reorder from that buyer, forever. Stockroom takes 0%.
        </p>
        <p className="mt-4 text-sm text-ink/60 max-w-3xl">
          <strong>Merchant of record:</strong> Stockroom is the merchant of
          record for the soft launch. Buyer payments are charged through
          Stockroom&apos;s platform Stripe account, and Stockroom settles net
          proceeds to you out-of-band. Direct maker payouts via Stripe Connect
          will ship post-launch.
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
