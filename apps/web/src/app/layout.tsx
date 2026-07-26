import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import { BrandFooter } from "./components/brand-footer";
import "./globals.css";

const claireMono = localFont({
  src: "./fonts/CSClaireMono-Regular.otf",
  variable: "--font-claire-mono",
  display: "swap",
});

const siteUrl = "https://founderabovethefold.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Founder Above the Fold - B2B LinkedIn Publishing Command Centre",
    template: "%s · Founder Above the Fold",
  },
  description:
    "Founder Above the Fold is a business-to-business LinkedIn publishing workbench for one licensed company owner - founders, executives, and comms teams. Not a consumer app.",
  applicationName: "Founder Above the Fold",
  category: "Business Software",
  keywords: [
    "B2B SaaS",
    "LinkedIn publishing software",
    "founder content workbench",
    "company LinkedIn command centre",
    "MCP server for LinkedIn",
  ],
  other: {
    audience: "business",
    "target-audience": "B2B",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Founder Above the Fold",
    title: "Founder Above the Fold - B2B LinkedIn Publishing Command Centre",
    description:
      "A business-to-business, single-workspace LinkedIn publishing workbench for founders, executives, and comms teams. Official API rail, owner-controlled, no scraping.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Founder Above the Fold - B2B LinkedIn Publishing Command Centre",
    description:
      "A business-to-business, single-workspace LinkedIn publishing workbench for founders, executives, and comms teams.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const businessSoftwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Founder Above the Fold",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web, macOS, iOS",
  audience: {
    "@type": "BusinessAudience",
    audienceType: "B2B",
  },
  offers: {
    "@type": "Offer",
    category: "One-time licence",
  },
  publisher: {
    "@type": "Organization",
    name: "Founder Above the Fold",
  },
  url: siteUrl,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookiebotId = process.env.NEXT_PUBLIC_COOKIEBOT_ID?.trim();

  return (
    <html lang="en" className={`${claireMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Script
          id="business-software-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(businessSoftwareJsonLd) }}
        />
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
