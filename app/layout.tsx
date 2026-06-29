import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Brokerage Operating System",
  description: "Multi-tenant operating platform for independent real estate brokerages.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
