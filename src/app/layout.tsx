import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./portfolio.css";

export const metadata: Metadata = {
  title: {
    default: "Lera Aumila | Model Portfolio",
    template: "%s | Lera Aumila",
  },
  description:
    "Lera Aumila fashion, beauty and editorial model available for selected projects and bookings.",
  applicationName: "Lera Aumila Portfolio",
  keywords: ["Lera Aumila", "model", "fashion model", "editorial model", "beauty model", "model portfolio"],
  authors: [{ name: "Lera Aumila" }],
  creator: "Lera Aumila",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    title: "Lera Aumila | Model Portfolio",
    description:
      "Fashion, beauty and editorial model portfolio and booking site.",
    siteName: "Lera Aumila",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lera Aumila | Model Portfolio",
    description: "Fashion, beauty and editorial model portfolio and booking site.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3ee",
  colorScheme: "light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
