export default function SiteFooter() {
  return (
    <footer className="border-t border-ink/10 bg-cream mt-24">
      <div className="mx-auto max-w-6xl px-6 py-10 text-sm text-ink/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          &copy; {new Date().getFullYear()} Stockroom &middot; Commission-free
          wholesale for makers.
        </div>
        <div>
          Card payments processed by Stockroom via Stripe Checkout. Stripe
          fees (~2.9% + $0.30 per order) apply. Stockroom takes 0% commission.
        </div>
      </div>
    </footer>
  );
}
