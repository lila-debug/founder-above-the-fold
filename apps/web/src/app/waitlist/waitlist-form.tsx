"use client";

import { ArrowRight, MailCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

type FormState = "idle" | "submitting" | "created" | "existing" | "error";

export function WaitlistForm({ referral }: { referral: string }) {
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("submitting");
    setMessage("");
    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get("email"),
      firstName: form.get("first_name"),
      role: form.get("role"),
      primaryProblem: form.get("primary_problem"),
      betaOptIn: form.get("beta_opt_in") === "yes",
      marketingOptIn: form.get("marketing_opt_in") === "yes",
      website: form.get("website"),
      source: "founderaccount-waitlist",
      referredBy: referral,
    };

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json() as { state?: "created" | "existing"; emailSent?: boolean; message?: string };
      if (!response.ok) throw new Error(result.message || "Signup did not complete.");
      setState(result.state === "existing" ? "existing" : "created");
      setMessage(result.emailSent
        ? "Your place is recorded. Open the confirmation link in your inbox."
        : "Your place is recorded. Email confirmation is not available yet; you do not need to submit again.");
      event.currentTarget.reset();
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Signup did not complete.");
    }
  }

  if (state === "created" || state === "existing") {
    return (
      <div className="mt-6 border-2 border-black bg-[#f4d13d] p-5" role="status">
        <h3 className="text-xl font-black uppercase">
          {state === "existing" ? "You are already on the list" : "Your place is recorded"}
        </h3>
        <p className="mt-3 font-semibold leading-6">{message}</p>
        <Link className="mt-4 inline-flex font-black underline" href="/no-circles">
          Get the free No Circle of Hell skill
        </Link>
      </div>
    );
  }

  return (
    <form className="mt-6 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-email">
        Work email
        <input autoComplete="email" className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]" id="waitlist-email" name="email" placeholder="founder@company.com" required type="email" />
      </label>
      <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-first-name">
        First name <span className="normal-case font-semibold">(optional)</span>
        <input autoComplete="given-name" className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]" id="waitlist-first-name" maxLength={80} name="first_name" />
      </label>
      <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-role">
        Your working position
        <select className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]" defaultValue="" id="waitlist-role" name="role" required>
          <option disabled value="">Choose one</option>
          <option value="founder">Founder</option>
          <option value="fractional-product-leader">Fractional product leader</option>
          <option value="independent-consultant">Independent consultant</option>
          <option value="other">Something else</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-black uppercase" htmlFor="waitlist-problem">
        What keeps slipping?
        <select className="h-12 border-2 border-black bg-white px-3 text-base font-medium normal-case outline-none focus:ring-4 focus:ring-[#f4d13d]" defaultValue="" id="waitlist-problem" name="primary_problem" required>
          <option disabled value="">Choose the closest answer</option>
          <option value="profile-positioning">Profile positioning</option>
          <option value="consistent-drafting">Consistent drafting</option>
          <option value="keeping-my-voice">Keeping my voice</option>
          <option value="safe-scheduling">Safe scheduling</option>
        </select>
      </label>
      <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
        <label htmlFor="waitlist-website">Website</label>
        <input autoComplete="off" id="waitlist-website" name="website" tabIndex={-1} />
      </div>
      <label className="flex items-start gap-3 border-2 border-black bg-[#f7f1df] p-3 text-sm leading-6">
        <input className="mt-1 size-4 shrink-0 accent-black" name="beta_opt_in" required type="checkbox" value="yes" />
        <span>I want a place in the private beta. See the <Link className="font-black underline" href="/privacy">privacy panel</Link>.</span>
      </label>
      <label className="flex items-start gap-3 border-2 border-black bg-white p-3 text-sm leading-6">
        <input className="mt-1 size-4 shrink-0 accent-black" name="marketing_opt_in" type="checkbox" value="yes" />
        <span>Also send me occasional launch and product updates. This is optional and not pre-ticked.</span>
      </label>
      {state === "error" ? <p className="border-2 border-black bg-[#ffd8d5] p-3 font-bold" role="alert">{message}</p> : null}
      <button className="hard-button bg-[#f4d13d]" disabled={state === "submitting"} type="submit">
        {state === "submitting" ? "Recording your place…" : "Request my place"} <ArrowRight size={16} />
      </button>
      <p className="flex items-start gap-2 text-xs font-semibold leading-5">
        <MailCheck className="mt-0.5 shrink-0" size={16} />
        One confirmation email is sent when email delivery is configured. Duplicate requests are kept as one record.
      </p>
    </form>
  );
}
