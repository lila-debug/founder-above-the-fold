"use client";

import Script from "next/script";

export function CookiebotDeclaration({ cookiebotId }: { cookiebotId?: string }) {
  if (!cookiebotId) {
    return (
      <div className="warning-strip text-sm leading-6">
        <strong>Setup required</strong>
        <span>Cookiebot is not configured. Add `NEXT_PUBLIC_COOKIEBOT_ID` only after the
        live domains are registered and the Cookiebot scan is complete.</span>
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
