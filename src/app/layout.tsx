import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Lera Aumila | Model Portfolio",
  description: "Las Vegas fashion model portfolio and booking site.",
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
