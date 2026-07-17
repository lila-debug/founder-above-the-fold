import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND_FOOTER_LINES } from "@/lib/brand";

export function BrandFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="border-t-2 border-[#03256c] bg-white text-[#1768ac]">
      <div className="mx-auto grid w-full max-w-[1500px] gap-3 px-5 py-6 text-sm lg:px-8">
        {BRAND_FOOTER_LINES.map((line, index) => (
          <p
            className={index === 0 || index === BRAND_FOOTER_LINES.length - 1 ? "font-bold text-[#03256c]" : undefined}
            key={line}
          >
            {line}
          </p>
        ))}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link className="font-bold hover:text-[#2541b2]" href="/waitlist">Private beta</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/try">Try the mechanism</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/product">Product screens</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/pricing">One-time licence</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/perks">Perks Hub</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/privacy">Privacy</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/cookies">Cookies</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/terms">Terms</Link>
          <Link className="font-bold hover:text-[#2541b2]" href="/api/mcp/health">Health</Link>
          {children}
        </div>
      </div>
    </footer>
  );
}
