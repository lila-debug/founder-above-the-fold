import Link from "next/link";
import { BrandFooter } from "../components/brand-footer";

const sections = [
  ["Licence", "A completed purchase grants one owner a personal, non-transferable licence to use the purchased major version. Twelve months of updates are included in the proposed offer; later major upgrades may be priced separately."],
  ["Owner responsibility", "You decide what to draft, retain, export, and manually place on LinkedIn. You are responsible for checking factual claims, permissions, intellectual property, and the destination platform’s rules."],
  ["Safety boundary", "The product does not promise automated LinkedIn profile changes, scraping, direct messages, follows, likes, comments, reposts, or browser automation. Publishing remains intentionally locked until a separately approved, official integration is proven."],
  ["Local AI and voice", "Voice transcripts and optional local AI are drafting tools, not sources of truth. Availability varies by device and operating system. Review output before using it publicly."],
  ["Payments and refunds", "Final storefront payment, tax, refund, and consumer-rights wording must match the actual Apple App Store or web checkout configuration before launch. This preview does not take payment."],
  ["Changes and contact", "Material changes will be dated and shown before they apply. A verified support and privacy contact must be inserted before public launch."],
] as const;

export default function TermsPage() {
  return <main className="min-h-screen bg-[#f7f1df] text-[#111]"><section className="mx-auto w-full max-w-[1000px] px-5 py-10 lg:px-8"><Link className="text-sm font-black uppercase underline" href="/product">Back to product screens</Link><span className="cut-label mt-7 bg-[#f4d13d]">Draft for launch fitting · 14 July 2026</span><h1 className="mt-6 text-5xl font-black uppercase leading-none md:text-7xl">Terms of use</h1><p className="mt-5 max-w-3xl text-lg font-semibold leading-8">These terms describe the proposed one-time founder licence. They are a product draft, not a substitute for Canadian legal review or the final storefront terms.</p><div className="mt-9 grid gap-4">{sections.map(([title,body],i)=><article className="paper-card p-5" key={title}><span className="section-kicker">Part {String(i+1).padStart(2,"0")}</span><h2 className="mt-2 text-2xl font-black uppercase">{title}</h2><p className="mt-3 leading-7">{body}</p></article>)}</div><div className="warning-strip mt-7"><strong>Launch clamp:</strong><span>Insert the legal entity name, support address, governing law, checkout/refund terms, and verified effective date before selling.</span></div></section><BrandFooter /></main>;
}
