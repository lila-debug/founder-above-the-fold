import Link from "next/link";
import type { ReactNode } from "react";

export function BrandFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="border-t-2 border-[#03256c] bg-white text-[#1768ac]">
      <div className="mx-auto grid w-full max-w-[1500px] gap-3 px-5 py-6 text-sm lg:px-8">
        <p className="font-bold text-[#03256c]">Based on true events. Sadly.</p>
        <p>Canadian Kind, Scottish Strong, Nigerian Proud.</p>
        <p>© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™</p>
        <p className="font-bold text-[#03256c]">
          Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
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
