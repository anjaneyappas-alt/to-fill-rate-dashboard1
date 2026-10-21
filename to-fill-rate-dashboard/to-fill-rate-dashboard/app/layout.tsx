import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TO Fill Rate Dashboard",
  description:
    "Transfer order fill-rate tracking for Zoho Inventory exports: qty raised vs sent, per-DS performance, and RCA for unfulfilled SKUs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
