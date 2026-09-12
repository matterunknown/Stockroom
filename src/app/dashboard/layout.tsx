import Link from "next/link";
import { requireBrand } from "@/lib/auth";
import { appUrl } from "@/lib/stripe";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, brand } = await requireBrand();
  const isPro = brand.plan === "pro";
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-display text-lg font-semibold">
              Stockroom
            </Link>
            <span className="text-ink/30">/</span>
            <span className="text-sm text-ink/70">{brand.name}</span>
            <span
              className={
                "text-[10px] uppercase tracking-widest rounded-full px-2 py-0.5 " +
                (isPro
                  ? "bg-orange-700/10 text-orange-800"
                  : "bg-ink/10 text-ink/60")
              }
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm">
            <a
              className="text-ink/70 hover:text-ink"
              href={appUrl("/w/" + brand.slug)}
              target="_blank"
              rel="noreferrer"
            >
              View storefront ↗
            </a>
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost text-sm">Log out ({user.email})</button>
            </form>
          </div>
        </div>
        <nav className="mx-auto max-w-6xl px-6 pb-3 flex flex-wrap gap-4 text-sm">
          <Link className="hover:text-orange-700" href="/dashboard">
            Overview
          </Link>
          <Link className="hover:text-orange-700" href="/dashboard/products">
            Catalog
          </Link>
          <Link className="hover:text-orange-700" href="/dashboard/orders">
            Orders
          </Link>
          <Link className="hover:text-orange-700" href="/dashboard/branding">
            Branding
          </Link>
          <Link className="hover:text-orange-700" href="/dashboard/buyers">
            Buyer pricing
          </Link>
          <Link className="hover:text-orange-700" href="/dashboard/plan">
            Plan
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-10">{children}</main>
    </div>
  );
}
