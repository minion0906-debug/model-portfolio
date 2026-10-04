import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "MAYA — Model Portfolio",
  description: "Professional model portfolio and booking website."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}