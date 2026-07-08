import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Founder Above the Fold — The passwordless LinkedIn operating system for founders who hate doing LinkedIn",
  description: "Magic link login. Profile setup assistant. Voice-locked post queue. Safe official LinkedIn publishing. MCP/AI command centre.",
  openGraph: {
    title: "Founder Above the Fold",
    description: "The passwordless LinkedIn operating system for founders who hate doing LinkedIn",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB">
      <body className="antialiased bg-white text-imperial-500">
        {children}
      </body>
    </html>
  );
}
