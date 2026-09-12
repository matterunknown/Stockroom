"use client";

import { useMemo, useState } from "react";

type Product = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  wholesalePriceCents: number;
  moq: number;
  unit: string;
  stock: number | null;
  displayPrice: string;
};

function usd(cents: number) {
  return (cents / 100).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
}

export default function StorefrontCart({
  slug,
  products,
  accent,
}: {
  slug: string;
  products: Product[];
  accent: string;
}) {
  const [qty, setQty] = useState<Record<string, number>>({});
  const [buyerEmail, setBuyerEmail] = useState("");
  const [buyerName, setBuyerName] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const items = useMemo(
    () =>
      products
        .map((p) => ({ ...p, quantity: qty[p.id] || 0 }))
        .filter((p) => p.quantity > 0),
    [products, qty]
  );
  const subtotal = items.reduce(
    (s, i) => s + i.quantity * i.wholesalePriceCents,
    0
  );

  const belowMOQ = items.filter((i) => i.quantity > 0 && i.quantity < i.moq);
  const canSubmit =
    items.length > 0 && belowMOQ.length === 0 && buyerEmail.length > 3;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/w/${slug}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyerEmail,
          buyerName,
          buyerCompany,
          notes,
          items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout failed");
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError("Checkout could not be started.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Checkout failed";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr,340px] gap-8">
      <div className="space-y-4">
        {products.map((p) => {
          const q = qty[p.id] || 0;
          const under = q > 0 && q < p.moq;
          return (
            <div key={p.id} className="card flex gap-4 items-start">
              {p.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="h-24 w-24 rounded object-cover bg-ink/5 flex-shrink-0"
                />
              ) : (
                <div className="h-24 w-24 rounded bg-ink/5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-semibold">{p.name}</h3>
                  <div className="text-sm font-medium">{p.displayPrice}/{p.unit}</div>
                </div>
                {p.description && (
                  <p className="text-sm text-ink/60 mt-1">{p.description}</p>
                )}
                <div className="mt-2 text-xs text-ink/60">
                  MOQ {p.moq} {p.unit}
                  {p.stock !== null ? ` · ${p.stock} in stock` : ""}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <label className="text-xs uppercase tracking-widest text-ink/50">
                    Qty
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={q || ""}
                    onChange={(e) =>
                      setQty((s) => ({
                        ...s,
                        [p.id]: Math.max(0, Number(e.target.value) || 0),
                      }))
                    }
                    className="input w-24"
                    placeholder="0"
                  />
                  {under && (
                    <span className="text-xs text-red-700">
                      Below MOQ of {p.moq}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <aside className="card lg:sticky lg:top-6 self-start">
        <h4 className="font-display text-lg mb-4">Your order</h4>
        {items.length === 0 ? (
          <p className="text-sm text-ink/60">
            Add products to build your order.
          </p>
        ) : (
          <table className="w-full text-sm mb-4">
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className="border-t border-ink/10">
                  <td className="py-2">
                    {i.name}{" "}
                    <span className="text-ink/50 text-xs">
                      × {i.quantity}
                    </span>
                  </td>
                  <td className="text-right">
                    {usd(i.quantity * i.wholesalePriceCents)}
                  </td>
                </tr>
              ))}
              <tr className="border-t border-ink/20">
                <td className="py-2 font-semibold">Subtotal</td>
                <td className="text-right font-semibold">{usd(subtotal)}</td>
              </tr>
            </tbody>
          </table>
        )}
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="label">Email</label>
            <input
              required
              type="email"
              value={buyerEmail}
              onChange={(e) => setBuyerEmail(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Your name</label>
            <input
              value={buyerName}
              onChange={(e) => setBuyerName(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Company / store</label>
            <input
              value={buyerCompany}
              onChange={(e) => setBuyerCompany(e.target.value)}
              className="input"
            />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="input"
            />
          </div>
          {belowMOQ.length > 0 && (
            <div className="text-xs text-red-700">
              Some items are below their MOQ.
            </div>
          )}
          {error && (
            <div className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={!canSubmit || submitting}
            style={{ background: accent }}
            className="btn text-white w-full disabled:opacity-50"
          >
            {submitting ? "Redirecting to Stripe…" : "Place order & pay"}
          </button>
          <p className="text-[11px] text-ink/50 text-center">
            Payment is processed securely by Stripe via Stockroom (the merchant
            of record). No buyer account needed.
          </p>
        </form>
      </aside>
    </div>
  );
}
