import { redirect } from "next/navigation";
import { getOwnerSession } from "@/lib/auth/session";
import { OwnerAccessPanel } from "../components/landing-client";

export const metadata = { title: "Owner Sign In · Founder Above the Fold" };

export default async function LoginPage() {
  const session = await getOwnerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#fffdf4] px-5 py-10 text-[#03256c] sm:py-16">
      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="panel bg-[#ffd84d] p-6 sm:p-8">
          <p className="rail-label text-xs font-black uppercase tracking-[0.14em]">
            Part A · One owner key
          </p>
          <h1 className="mt-4 text-4xl font-black uppercase leading-none sm:text-6xl">
            Open the one real app.
          </h1>
          <p className="mt-5 max-w-xl text-base font-bold leading-7">
            Founder Above the Fold has one private workbench. Enter the owner email,
            open the private link, and the workbench will unlock. LinkedIn remains a
            separate connection inside the app.
          </p>
          <div className="mt-8 border-2 border-[#03256c] bg-white p-4">
            <p className="text-xs font-black uppercase">Assembly route</p>
            <pre className="mt-3 overflow-x-auto text-sm font-black leading-7">
              Email → Private link → Workbench
            </pre>
          </div>
        </section>
        <OwnerAccessPanel />
      </div>
    </main>
  );
}
