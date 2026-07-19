import Link from "next/link";
import type { ReactNode } from "react";
import { BRAND_FOOTER_LINES } from "@/lib/brand";

export function BrandFooter({ children }: { children?: ReactNode }) {
  return (
    <footer className="border-t-2 border-black bg-[#fffef8] text-black">
      <div className="mx-auto grid w-full max-w-[1500px] gap-3 px-5 py-6 text-sm lg:px-8">
        {BRAND_FOOTER_LINES.map((line, index) => (
          <p
            className={`${index === 0 || index === BRAND_FOOTER_LINES.length - 1 ? "font-black" : "font-semibold"} rail-label`}
            key={line}
          >
            {line}
          </p>
        ))}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link className="font-black uppercase underline" href="/waitlist">Private beta</Link>
          <Link className="font-black uppercase underline" href="/no-circles">Free No Circle of Hell skill</Link>
          <Link className="font-black uppercase underline" href="/try">Try the mechanism</Link>
          <Link className="font-black uppercase underline" href="/product">Product screens</Link>
          <Link className="font-black uppercase underline" href="/pricing">One-time licence</Link>
          <Link className="font-black uppercase underline" href="/perks">Perks Hub</Link>
          <Link className="font-black uppercase underline" href="/privacy">Privacy</Link>
          <Link className="font-black uppercase underline" href="/cookies">Cookies</Link>
          <Link className="font-black uppercase underline" href="/terms">Terms</Link>
          <Link className="font-black uppercase underline" href="/api/mcp/health">Health</Link>
          {children}
        </div>
      </div>
    </footer>
  );
}
