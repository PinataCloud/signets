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
  description: "Share and verify content",
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
