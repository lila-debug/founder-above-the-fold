"use client";

import { Download, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";

const CONFIRMATION = "DELETE MY FOUNDER WORKSPACE";

export function OwnerDataControls() {
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("Export first. Deletion removes the owner cabinet, tokens, drafts, templates, profile copy and analytics.");

  async function removeWorkspace() {
    if (confirmation !== CONFIRMATION) {
      setNotice(`Type ${CONFIRMATION} exactly.`);
      return;
    }
    if (!window.confirm("Permanently remove the Founder Above the Fold owner workspace? This cannot be undone.")) return;

    setBusy(true);
    const response = await fetch("/api/owner/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirmation }),
    });
    const result = (await response.json()) as { error?: string; deleted?: boolean };
    if (!response.ok || !result.deleted) {
      setNotice(result.error ?? "Owner workspace deletion failed.");
      setBusy(false);
      return;
    }
    window.location.assign("/?owner=workspace-deleted");
  }

  return (
    <section className="paper-card p-5">
      <div className="section-kicker"><ShieldCheck size={18} /> Owner data controls</div>
      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <div className="border-2 border-black bg-[#d8eee8] p-4">
          <h3 className="text-xl font-black uppercase">Carry out a copy</h3>
          <p className="mt-2 text-sm font-semibold leading-6">Downloads owner content, version history, official metric snapshots and the audit ledger. OAuth tokens and server keys are excluded.</p>
          <a className="hard-button mt-4 inline-flex bg-white" href="/api/owner/export">
            <Download size={17} /> Download JSON export
          </a>
        </div>
        <div className="border-2 border-black bg-[#fff0e9] p-4">
          <h3 className="text-xl font-black uppercase">Remove the cabinet</h3>
          <p className="mt-2 text-sm font-semibold leading-6">Type the safety phrase, then pass one final browser confirmation. Only an anonymous deletion receipt remains.</p>
          <label className="mt-4 grid gap-1 text-xs font-black uppercase">
            {CONFIRMATION}
            <input
              className="border-2 border-black bg-white p-3 font-sans text-sm normal-case"
              onChange={(event) => setConfirmation(event.target.value)}
              value={confirmation}
            />
          </label>
          <button className="hard-button mt-3 bg-[#d94841] text-white disabled:opacity-45" disabled={busy || confirmation !== CONFIRMATION} onClick={removeWorkspace} type="button">
            <Trash2 size={17} /> {busy ? "Removing" : "Delete workspace"}
          </button>
        </div>
      </div>
      <div className="warning-strip mt-5"><ShieldCheck size={18} /> {notice}</div>
    </section>
  );
}
