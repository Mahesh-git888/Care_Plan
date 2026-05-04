import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Portea Care Landing Pages",
  description: "Landing pages for elder care, dementia care, and post-discharge support.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
