import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/providers";
import { Toaster } from "@/components/ui/toaster";

import { cn } from "@/lib/utils";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "SIGNETS",
  description: "Share cyptographically verified content",
  icons: {
    apple: "https://www.signets.cloud/favicon.png",
    shortcut: "https://www.signets.cloud/favicon.png",
    icon: "https://www.signets.cloud/favicon.png",
  },
  openGraph: {
    title: "SIGNETS",
    description: "Share cyptographically verified content",
    url: "https://signets.cloud",
    siteName: "SIGNETS",
    images: [`https://www.signets.cloud/og.png`],
  },
  twitter: {
    card: "summary_large_image",
    title: "SIGNETS",
    description: "Share cyptographically verified content",
    images: [`https://www.signets.cloud/og.png`],
  },
  other: {
    "fc:frame": "vNext",
    "fc:frame:image": "https://www.signets.cloud/og.png",
    "fc:frame:button:1": "To go App",
    "fc:frame:button:1:action": "link",
    "fc:frame:button:1:target": "https://www.signets.cloud",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
