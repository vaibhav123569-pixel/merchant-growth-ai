import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Merchant Growth AI",
  description: "Understand your payments, inspect the evidence, and test your next business move.",
icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}


