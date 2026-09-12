import Link from "next/link";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

export default function LandingPage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-6xl px-6 pt-20 pb-24">
          <p className="text-xs uppercase tracking-[0.2em] text-ink/50 mb-6">
            Wholesale, on your terms
          </p>
          <h1 className="font-display text-5xl md:text-6xl leading-tight tracking-tight max-w-4xl">
            Not a marketplace. <br className="hidden md:block" />
            Your buyers. Your link. <span className="text-orange-700">Zero commission.</span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-ink/70">
            Stockroom gives artisan makers a shareable wholesale order link.
            Your buyers order at your prices, above your minimums, and pay by
            card. You keep 100% of the sale — no platform commission, ever.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/signup" className="btn-primary">
              Create your storefront — free
            </Link>
            <Link href="/w/cedar-and-sage" className="btn-secondary">
              See a live example
            </Link>
          </div>
          <p className="mt-4 text-xs text-ink/50">
            Payments settled via Stripe. Stripe fees (~2.9% + $0.30) apply.
            Stockroom takes 0%.
          </p>
        </section>

        <section className="border-y border-ink/10 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-1 md:grid-cols-3 gap-10 px-6 py-16">
            {[
              {
                title: "Built for wholesale",
                body: "Case packs, minimum order quantities, per-buyer pricing, and clean invoices. No consumer-y checkout fluff.",
              },
              {
                title: "You own the relationship",
                body: "You bring the buyers, you keep the emails, you set the terms. Stockroom is a tool — not a channel between you and your customers.",
              },
              {
                title: "Zero platform fees",
                body: "$0 platform commission on every order. You pay Stripe processing (~2.9% + $0.30) and that's it. Compare that to Faire's 15%+.",
              },
            ].map((f) => (
              <div key={f.title}>
                <h3 className="font-display text-xl mb-2">{f.title}</h3>
                <p className="text-ink/70 text-sm leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-3xl mb-4">How it works</h2>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 text-sm">
            {[
              ["1", "Add your line sheet", "Products, wholesale prices, MOQs, case packs."],
              ["2", "Share your link", "stockroom.app/w/your-brand. Email it, DM it, put it on your line sheet PDF."],
              ["3", "Buyers order & pay", "Card payment via Stripe Checkout. You get an order notification."],
              ["4", "Fulfill & ship", "Mark orders paid → fulfilled from your dashboard. You keep 100%."],
            ].map(([n, t, b]) => (
              <li key={n} className="card">
                <div className="text-orange-700 font-mono text-xs mb-2">
                  STEP {n}
                </div>
                <div className="font-semibold mb-1">{t}</div>
                <div className="text-ink/60">{b}</div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl mb-1">
                Ready to stop paying commission?
              </h3>
              <p className="text-ink/70 text-sm">
                Free plan is genuinely free: 1 storefront, up to 10 SKUs, zero
                commission.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/pricing" className="btn-secondary">
                See pricing
              </Link>
              <Link href="/signup" className="btn-primary">
                Start free
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
