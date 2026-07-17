"use client";

import { Activity, BarChart3, MessageCircle, RefreshCw, Repeat2, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { AnalyticsTracker } from "@/lib/server/analytics";

export function AnalyticsBoard({ initialTracker }: { initialTracker: AnalyticsTracker }) {
  const [tracker, setTracker] = useState(initialTracker);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(initialTracker.readiness.message);

  async function refresh(postId?: string) {
    setBusy(true);
    setNotice("Turning the official LinkedIn gauge…");
    const response = await fetch("/api/analytics/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postId ? { postId } : {}),
    });
    const result = (await response.json()) as { error?: string; refreshed?: number };
    if (!response.ok) {
      setNotice(result.error ?? "Analytics could not be refreshed.");
      setBusy(false);
      return;
    }
    const nextResponse = await fetch("/api/analytics/posts", { cache: "no-store" });
    const next = (await nextResponse.json()) as AnalyticsTracker & { error?: string };
    if (!nextResponse.ok) {
      setNotice(next.error ?? "Stored analytics could not be reopened.");
    } else {
      setTracker(next);
      setNotice(`Stored ${result.refreshed ?? 0} fresh official snapshot${result.refreshed === 1 ? "" : "s"}.`);
    }
    setBusy(false);
  }

  return (
    <div className="screen-pad space-y-5">
      <section className="screen-intro">
        <p className="cut-label bg-[#49a894] text-white">Part F · owner-post gauges</p>
        <h2 className="mt-4 max-w-5xl text-4xl font-black uppercase leading-[0.95] sm:text-6xl">Read the mechanism. Never invent the dial.</h2>
        <p className="mt-4 max-w-3xl text-base font-semibold leading-7 sm:text-lg">Lifetime impressions, reactions, comments and reshares come only from LinkedIn’s official member analytics socket. Missing permission stays visibly missing.</p>
      </section>
      <div className="warning-strip"><Activity size={18} /> {notice}</div>
      <div className="flex justify-end">
        <button
          className="hard-button bg-[#f4d13d] disabled:opacity-45"
          disabled={busy || tracker.readiness.state !== "available"}
          onClick={() => refresh()}
          type="button"
        >
          <RefreshCw size={17} /> Refresh all published posts
        </button>
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {tracker.items.map((item) => (
          <article className="paper-card p-5" key={item.postId}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="cut-label">Published {new Date(item.publishedAt).toLocaleDateString()}</p>
              <button className="hard-button bg-white py-2" disabled={busy || tracker.readiness.state !== "available"} onClick={() => refresh(item.postId)} type="button">
                <RefreshCw size={15} /> Pull
              </button>
            </div>
            <p className="mt-4 line-clamp-3 text-sm font-bold leading-6">{item.body}</p>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric icon={BarChart3} label="Impressions" value={item.metrics.impressions} />
              <Metric icon={ThumbsUp} label="Reactions" value={item.metrics.reactions} />
              <Metric icon={MessageCircle} label="Comments" value={item.metrics.comments} />
              <Metric icon={Repeat2} label="Reshares" value={item.metrics.reshares} />
            </div>
            <p className="mt-4 text-xs font-bold text-black/55">{item.pulledAt ? `Pulled ${new Date(item.pulledAt).toLocaleString()}` : "No official snapshot stored yet."}</p>
          </article>
        ))}
      </div>
      {!tracker.items.length ? <div className="paper-card p-6 text-sm font-bold">No published posts are fitted in this cabinet yet.</div> : null}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: typeof BarChart3; label: string; value: number | null }) {
  return (
    <div className="border-2 border-black bg-white p-3">
      <Icon size={17} />
      <strong className="mt-2 block text-2xl">{value ?? "—"}</strong>
      <span className="text-[10px] font-black uppercase">{label}</span>
    </div>
  );
}
