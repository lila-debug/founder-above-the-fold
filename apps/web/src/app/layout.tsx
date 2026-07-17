import type { Metadata } from "next";
import Script from "next/script";
import { BrandFooter } from "./components/brand-footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founder Above the Fold - LinkedIn Profile MCP App",
  description:
    "A private LinkedIn profile and publishing command centre for founders building an above-the-fold presence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID?.trim();

  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {cookiebotId ? (
          <Script
            id="cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={cookiebotId}
            data-blockingmode="auto"
            strategy="beforeInteractive"
          />
        ) : null}
        {children}
        <BrandFooter />
      </body>
    </html>
  );
}
