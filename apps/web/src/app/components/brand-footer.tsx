import Link from "next/link";
import type { ReactNode } from "react";

export function BrandFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="border-t border-[#1768ac]/20 bg-white text-[#1768ac]">
      <div className="mx-auto grid w-full max-w-[1500px] gap-3 px-5 py-6 text-sm lg:px-8">
        <p className="font-semibold text-[#03256c]">Based on true events. Sadly.</p>
        <p>Canadian Kind, Scottish Strong, Nigerian Proud.</p>
        <p>© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™</p>
        <p className="font-semibold text-[#03256c]">
          Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link className="font-semibold hover:text-[#2541b2]" href="/privacy">Privacy</Link>
          <Link className="font-semibold hover:text-[#2541b2]" href="/cookies">Cookies</Link>
          <Link className="font-semibold hover:text-[#2541b2]" href="/api/mcp/health">Health</Link>
          {children}
        </div>
      </div>
    </footer>
  );
}
