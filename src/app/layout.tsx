import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gathotkaca X-Shield",
  description: "Advanced AI Defense — cybersecurity operations platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
