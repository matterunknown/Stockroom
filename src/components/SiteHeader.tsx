import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export default async function SiteHeader() {
  const user = await getSessionUser();
  return (
    <header className="border-b border-ink/10 bg-cream/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-xl font-semibold">
          Stockroom
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href="/pricing" className="text-ink/70 hover:text-ink">
            Pricing
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-ink/70 hover:text-ink">
                Dashboard
              </Link>
              <form action="/api/auth/logout" method="post">
                <button className="btn-ghost" type="submit">
                  Log out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="btn-primary">
                Start free
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
