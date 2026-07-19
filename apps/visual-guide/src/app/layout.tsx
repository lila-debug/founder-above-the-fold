import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Untitled Visual Guide Prototype",
  description: "A picture for every step, with no guessing required.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
