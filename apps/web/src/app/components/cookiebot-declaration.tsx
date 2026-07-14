"use client";

import Script from "next/script";

export function CookiebotDeclaration({ cookiebotId }: { cookiebotId?: string }) {
  if (!cookiebotId) {
    return (
      <div className="rounded-lg border border-[#1768ac]/25 bg-[#f4fbff] p-4 text-sm leading-6 text-[#1768ac]">
        Cookiebot is not configured. Add `NEXT_PUBLIC_COOKIEBOT_ID` only after the
        live domains are registered and the Cookiebot scan is complete.
      </div>
    );
  }

  return (
    <>
      <Script
        id="cookie-declaration"
        src={`https://consent.cookiebot.com/${cookiebotId}/cd.js`}
        strategy="afterInteractive"
      />
      <div id="CookieDeclaration" />
    </>
  );
}
