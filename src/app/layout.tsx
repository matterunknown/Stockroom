import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stockroom — Wholesale order links for makers",
  description:
    "Commission-free wholesale order links for artisan makers. Not a marketplace. Your buyers. Your link. Zero commission.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
