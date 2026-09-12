import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import Link from "next/link";
import { signupAction } from "./actions";

export const metadata = { title: "Sign up — Stockroom" };

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <h1 className="font-display text-3xl mb-2">Create your storefront</h1>
        <p className="text-sm text-ink/60 mb-8">
          Free forever. No card required.
        </p>
        {searchParams.error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
            {searchParams.error}
          </div>
        )}
        <form action={signupAction} className="space-y-4 card">
          <div>
            <label className="label">Brand name</label>
            <input required name="brandName" className="input" placeholder="Cedar & Sage" />
          </div>
          <div>
            <label className="label">Email</label>
            <input required type="email" name="email" className="input" placeholder="you@brand.com" />
          </div>
          <div>
            <label className="label">Password</label>
            <input required minLength={8} type="password" name="password" className="input" placeholder="At least 8 characters" />
          </div>
          <button type="submit" className="btn-primary w-full">
            Create account
          </button>
          <p className="text-xs text-ink/60 text-center">
            Already have an account?{" "}
            <Link className="underline" href="/login">
              Log in
            </Link>
          </p>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
