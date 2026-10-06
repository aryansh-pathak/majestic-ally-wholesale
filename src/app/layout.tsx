import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Majestic Ally Wholesale",
    template: "%s · Majestic Ally Wholesale",
  },
  description:
    "Wholesale equestrian tack, grooming, and western pet goods for retailers and resellers. Majestic Ally — Amay International LLC.",
  robots: {
    // The portal is private; don't index gated pages. Public pages are fine.
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Brand fonts via Google Fonts (the one allowed stylesheet host).
            Falls back to system fonts if unavailable. Swap freely. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin=""
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
