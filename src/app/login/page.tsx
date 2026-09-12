import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { loginAction } from "./actions";

export const metadata = { title: "Log in — Stockroom" };

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl mb-2">Log in</h1>
        <p className="text-sm text-ink/60 mb-8">
          Demo account: <code>demo@stockroom.local</code> /{" "}
          <code>demo1234</code>
        </p>
        {searchParams.error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}
        <form action={loginAction} className="space-y-4 card">
          <div>
            <label className="label">Email</label>
            <input required type="email" name="email" className="input" />
          </div>
          <div>
            <label className="label">Password</label>
            <input required type="password" name="password" className="input" />
          </div>
          <button type="submit" className="btn-primary w-full">
            Log in
          </button>
          <p className="text-xs text-ink/60 text-center">
            No account?{" "}
            <Link className="underline" href="/signup">
              Sign up
            </Link>
          </p>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
