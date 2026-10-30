import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "TokeEase — Own more. Start smaller. | Tokenised Micro-Investing",
  description:
    "Discover fractional access to tokenised real estate, land plots, gold and bonds—all from a simple digital wallet. Built for learning on testnet, not real money.",
  keywords: [
    "fractional investing",
    "tokenised assets",
    "digital assets wallet",
    "real world assets",
    "RWA testnet",
    "crypto testnet prototype",
    "TokeEase",
  ],
  authors: [{ name: "TokeEase Protocol" }],
};

import { WalletProvider } from "../context/WalletContext";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} dark antialiased`} suppressHydrationWarning>
      <body className="min-h-screen bg-[#080706] text-[#f6f5f0] selection:bg-amber-500/30 selection:text-amber-200" suppressHydrationWarning>
        <div className="fixed inset-0 pointer-events-none bg-noise z-50"></div>
        <WalletProvider>
          {children}
          <Toaster
            position="bottom-right"
            theme="dark"
            toastOptions={{
              className: "bg-[#17120e] border border-amber-500/40 text-[#f6f5f0] font-mono text-xs",
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
