"use client";

import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardCopy,
  Copy,
  ExternalLink,
  KeyRound,
  Link2,
  Loader2,
  Mail,
  RefreshCcw,
  Save,
} from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import type {
  ProfileCopyField,
  ProfileCopyRecord,
  ProfileCopyTracker,
} from "@/lib/profile-copy";

type MagicState = "idle" | "sending" | "sent" | "missing" | "error";
type LinkedInState =
  | "loading"
  | "setup_required"
  | "not_connected"
  | "connected"
  | "attention_required"
  | "error";

type MagicLinkResponse = {
  error?: string;
  magicLink?: string;
  message?: string;
  mode?: "dev" | "resend";
  sent?: boolean;
};

type LinkedInStatusResponse = {
  state: Exclude<LinkedInState, "loading" | "error">;
  configured: boolean;
  ownerAuthenticated: boolean;
  canConnect: boolean;
  missingEnv: string[];
  connectedAt: string | null;
  expiresAt: string | null;
  message: string;
  scope: {
    required: string[];
    granted: string[];
    missing: string[];
  };
  attentionReasons: string[];
};

type NoticeState = {
  tone: "ok" | "error";
  text: string;
};

type ProfileCopyWriteResponse = {
  error?: string;
  item?: ProfileCopyRecord;
};

export function OwnerAccessPanel() {
  const [email, setEmail] = useState("");
  const [magicState, setMagicState] = useState<MagicState>("idle");
  const [message, setMessage] = useState("");
  const [magicLink, setMagicLink] = useState("");
  const [sessionMessage, setSessionMessage] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const authState = url.searchParams.get("auth");

    if (!authState) {
      return;
    }

    const messageByState: Record<string, string> = {
      "signed-in": "Signed in with magic link. The private workbench is ready.",
      "sign-in-required": "Sign in to open the private workbench.",
      "missing-token": "That magic link is missing its token. Request a fresh one.",
      "wrong-owner": "That magic link is not for this owner workspace.",
      "invalid-token": "That magic link could not be used. Request a fresh one.",
    };

    const nextSessionMessage =
      messageByState[authState] ?? "Request a fresh magic link to continue.";

    url.searchParams.delete("auth");
    url.searchParams.delete("next");
    window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    queueMicrotask(() => setSessionMessage(nextSessionMessage));
  }, []);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMagicState("sending");
    setMessage("");
    setMagicLink("");

    const response = await fetch("/api/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = (await response.json()) as MagicLinkResponse;

    if (response.status === 501) {
      setMagicState("missing");
      setMessage(result.message ?? "Magic link provider is not configured yet.");
      return;
    }

    if (!response.ok) {
      setMagicState("error");
      setMessage(result.error ?? "Magic link request failed.");
      return;
    }

    setMagicState("sent");
    setMagicLink(result.magicLink ?? "");
    setMessage(result.message ?? "Magic link sent.");
  }

  return (
    <section className="panel w-full bg-white p-4">
      <div className="flex items-center gap-2">
        <Mail size={19} strokeWidth={2.2} />
        <h3 className="text-base font-black uppercase">Magic link access</h3>
      </div>
      <form className="mt-4 grid gap-3" onSubmit={sendMagicLink}>
        <label className="rail-label block text-xs font-black uppercase text-[#1768ac]" htmlFor="owner-email">
          Email
        </label>
        <input
          className="h-11 w-full border-2 border-[#03256c]/35 bg-white px-3 text-sm text-[#03256c] outline-none focus:border-[#06bee1] focus:ring-2 focus:ring-[#06bee1]/25"
          id="owner-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          required
        />
        <button
          className="panel panel-tap inline-flex h-11 w-full items-center justify-center gap-2 bg-[#03256c] px-4 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-[#1768ac]/55"
          disabled={magicState === "sending"}
          type="submit"
        >
          <KeyRound size={17} strokeWidth={2.2} />
          {magicState === "sending" ? "Sending" : "Send magic link"}
        </button>
        {message ? (
          <p
            className={`text-sm font-bold ${
              magicState === "error" || magicState === "missing"
                ? "text-[#d94841]"
                : "text-[#1768ac]"
            }`}
          >
            {message}
          </p>
        ) : null}
        {magicLink ? (
          <a
            className="panel panel-tap inline-flex h-10 w-full items-center justify-center gap-2 bg-white px-3 text-sm font-black uppercase text-[#03256c]"
            href={magicLink}
          >
            Open local magic link
            <ArrowRight size={16} strokeWidth={2.2} />
          </a>
        ) : null}
        {sessionMessage ? (
          <div className="grid gap-3 border-2 border-[#03256c]/20 bg-[#eafaff] p-3">
            <p className="text-sm font-bold text-[#1768ac]">{sessionMessage}</p>
            {sessionMessage.includes("ready") ? (
              <a
                className="panel panel-tap inline-flex h-10 w-full items-center justify-center gap-2 bg-[#03256c] px-3 text-sm font-black uppercase text-white"
                href="/dashboard"
              >
                Open private workbench
                <ArrowRight size={16} strokeWidth={2.2} />
              </a>
            ) : null}
          </div>
        ) : null}
      </form>
      <div className="mt-5 border-2 border-[#03256c]/20 bg-[#eafaff] p-4">
        <div className="flex items-center gap-2 text-sm font-black uppercase">
          <CheckCircle2 size={17} strokeWidth={2.2} />
          Passwordless by default
        </div>
        <p className="mt-3 text-sm leading-6 text-[#1768ac]">
          The app keeps owner access separate from LinkedIn connection. LinkedIn OAuth
          remains a separate, owner-approved connection rail.
        </p>
      </div>
    </section>
  );
}

export function LinkedInConnectionPanel() {
  const [status, setStatus] = useState<LinkedInStatusResponse | null>(null);
  const [state, setState] = useState<LinkedInState>("loading");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const url = new URL(window.location.href);
    const linkedInState = url.searchParams.get("linkedin");

    if (linkedInState) {
      const noticeByState: Record<string, string> = {
        connected: "LinkedIn connection locked into the server cabinet.",
        "attention-required": "LinkedIn connection needs inspection before publishing.",
        "owner-sign-in-required": "Sign in as the owner before connecting LinkedIn.",
        "missing-code": "LinkedIn did not return the expected callback key.",
        "invalid-state": "LinkedIn state check failed. Start the connection again.",
      };

      queueMicrotask(() =>
        setNotice(
          noticeByState[linkedInState] ??
            "LinkedIn connection needs inspection before publishing.",
        ),
      );
      url.searchParams.delete("linkedin");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }

    void refreshStatus();
  }, []);

  async function refreshStatus() {
    setState((current) => (current === "error" ? "loading" : current));

    try {
      const response = await fetch("/api/linkedin/status", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("LinkedIn status request failed.");
      }

      const result = (await response.json()) as LinkedInStatusResponse;
      setStatus(result);
      setState(result.state);
    } catch {
      setState("error");
      setNotice("LinkedIn status could not be inspected.");
    }
  }

  const panelState = status?.state ?? state;
  const connected = panelState === "connected";
  const attention = panelState === "attention_required" || panelState === "error";
  const setupRequired = panelState === "setup_required";
  const statusLabel = getLinkedInStateLabel(panelState);
  const actionLabel = getLinkedInActionLabel(status);

  return (
    <section className="panel w-full bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link2 size={19} strokeWidth={2.2} />
          <h3 className="text-base font-black uppercase">LinkedIn connection</h3>
        </div>
        <button
          className="inline-flex size-9 items-center justify-center border-2 border-[#03256c]/25 text-[#03256c] hover:border-[#06bee1] hover:bg-[#06bee1]/10"
          onClick={refreshStatus}
          type="button"
          title="Refresh LinkedIn status"
        >
          <RefreshCcw size={16} strokeWidth={2.2} />
        </button>
      </div>

      <div
        className={`mt-4 border-2 p-4 ${
          connected
            ? "border-[#03256c]/25 bg-[#eafaff]"
            : attention
              ? "border-[#d94841] bg-[#fff3ef]"
              : "border-[#03256c]/20 bg-[#eafaff]"
        }`}
      >
        <div className="flex items-start gap-3">
          <span
            className={`mt-0.5 flex size-9 shrink-0 items-center justify-center border-2 ${
              connected
                ? "border-[#03256c] bg-[#06bee1]/20 text-[#03256c]"
                : attention
                  ? "border-[#d94841] bg-[#d94841]/12 text-[#d94841]"
                  : "border-[#03256c]/25 bg-white text-[#03256c]"
            }`}
          >
            <LinkedInStateIcon state={panelState} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black uppercase text-[#03256c]">{statusLabel}</p>
            <p className="mt-2 text-sm leading-6 text-[#1768ac]">
              {status?.message ?? "Inspecting LinkedIn connection."}
            </p>
          </div>
        </div>
      </div>

      {notice ? <p className="mt-3 text-sm font-bold text-[#d94841]">{notice}</p> : null}

      <div className="mt-4 grid gap-2 text-sm">
        <ConnectionDetail
          label="Owner lock"
          value={status?.ownerAuthenticated ? "Open" : "Closed"}
        />
        <ConnectionDetail
          label="Connected"
          value={formatDateTime(status?.connectedAt)}
        />
        <ConnectionDetail
          label="Connection expires"
          value={formatDateTime(status?.expiresAt)}
        />
      </div>

      {status?.scope.missing.length ? (
        <div className="mt-4 border-2 border-[#d94841] bg-[#fff3ef] p-3">
          <p className="text-sm font-black uppercase text-[#03256c]">Missing scope</p>
          <p className="mt-2 break-words text-sm leading-6 text-[#1768ac]">
            {status.scope.missing.join(", ")}
          </p>
        </div>
      ) : null}

      {setupRequired && status?.missingEnv.length ? (
        <details className="mt-4 border-2 border-[#03256c]/20 bg-[#eafaff] p-3">
          <summary className="cursor-pointer text-sm font-black uppercase text-[#03256c]">
            {status.missingEnv.length} labelled slots needed
          </summary>
          <p className="rail-label mt-2 break-words text-xs leading-5 text-[#1768ac]">
            {status.missingEnv.join(", ")}
          </p>
        </details>
      ) : null}

      <div className="mt-4">
        {status?.canConnect ? (
          <a
            className="panel panel-tap inline-flex h-11 w-full items-center justify-center gap-2 bg-[#03256c] px-4 text-sm font-black uppercase text-white"
            href="/api/auth/linkedin/start"
          >
            <Link2 size={17} strokeWidth={2.2} />
            {actionLabel}
          </a>
        ) : (
          <span
            aria-disabled="true"
            className="inline-flex h-11 w-full items-center justify-center gap-2 border-2 border-[#03256c]/25 bg-[#eafaff] px-4 text-sm font-black uppercase text-[#1768ac]"
          >
            <Link2 size={17} strokeWidth={2.2} />
            {actionLabel}
          </span>
        )}
      </div>
    </section>
  );
}

export function ProfileCopyBoard({
  initialTracker,
  previewMode = false,
}: {
  initialTracker: ProfileCopyTracker;
  previewMode?: boolean;
}) {
  const [tracker, setTracker] = useState(initialTracker);
  const [drafts, setDrafts] = useState(() => buildDraftMap(initialTracker.items));
  const [changeNotes, setChangeNotes] = useState(() =>
    buildEmptyNoteMap(initialTracker.items),
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [savingField, setSavingField] = useState<ProfileCopyField | null>(null);
  const [syncingField, setSyncingField] = useState<ProfileCopyField | null>(null);
  const [notice, setNotice] = useState<NoticeState | null>(null);

  async function copyProfileSection(label: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedSection(label);
    window.setTimeout(() => setCopiedSection(null), 1800);
  }

  async function saveProfileSection(item: ProfileCopyRecord) {
    const content = drafts[item.field]?.trim() ?? "";

    if (!content) {
      setNotice({ tone: "error", text: `${item.label} cannot be empty.` });
      return;
    }

    if (content === item.content.trim()) {
      setNotice({
        tone: "error",
        text: `Change ${item.label.toLowerCase()} before saving a new version.`,
      });
      return;
    }

    setSavingField(item.field);
    setNotice(null);

    const response = await fetch("/api/profile-copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        field: item.field,
        content,
        changeNote: changeNotes[item.field],
      }),
    });
    const result = (await response.json()) as ProfileCopyWriteResponse;

    if (!response.ok) {
      setSavingField(null);
      setNotice({
        tone: "error",
        text: result.error ?? `${item.label} could not be saved.`,
      });
      return;
    }

    await refreshProfileCopy(`${item.label} saved as a new unsynced version.`);
    setSavingField(null);
    setChangeNotes((current) => ({ ...current, [item.field]: "" }));
  }

  async function markProfileSectionSynced(item: ProfileCopyRecord) {
    setSyncingField(item.field);
    setNotice(null);

    const response = await fetch(`/api/profile-copy/${item.field}/mark-synced`, {
      method: "POST",
    });
    const result = (await response.json()) as ProfileCopyWriteResponse;

    if (!response.ok) {
      setSyncingField(null);
      setNotice({
        tone: "error",
        text: result.error ?? `${item.label} could not be marked pasted.`,
      });
      return;
    }

    await refreshProfileCopy(`${item.label} marked pasted on LinkedIn.`);
    setSyncingField(null);
  }

  async function refreshProfileCopy(successMessage: string) {
    const response = await fetch("/api/profile-copy", { cache: "no-store" });
    const nextTracker = (await response.json()) as ProfileCopyTracker;

    setTracker(nextTracker);
    setDrafts(buildDraftMap(nextTracker.items));
    setNotice({ tone: "ok", text: successMessage });
  }

  const pendingItems = tracker.items.filter((item) => !item.synced);

  return (
    <section id="profile-copy" className="bg-[#eafaff]">
      <div className="mx-auto w-full max-w-[1500px] px-5 py-12 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="rail-label text-xs font-black uppercase tracking-[0.14em] text-[#1768ac]">
              {previewMode ? "Read-only product preview" : "Profile setup assistant"}
            </p>
            <h2 className="mt-2 text-3xl font-black uppercase leading-[1.05] text-[#03256c] md:text-5xl">
              Canonical profile copy stays tidy here.
            </h2>
          </div>
          <a
            className="panel panel-tap inline-flex h-11 w-fit items-center justify-center gap-2 bg-white px-4 text-sm font-black uppercase text-[#03256c]"
            href="https://www.linkedin.com/in/me/"
            target="_blank"
            rel="noreferrer"
          >
            Open LinkedIn profile
            <ExternalLink size={16} strokeWidth={2.2} />
          </a>
        </div>

        {previewMode ? (
          <div className="mt-5 border-2 border-[#03256c]/25 bg-white px-4 py-3 text-sm font-bold text-[#1768ac]">
            Public preview only. Editing stays behind the owner lock.
          </div>
        ) : tracker.database.status !== "ok" ? (
          <div className="mt-5 border-2 border-[#d94841] bg-white px-4 py-3 text-sm leading-6 text-[#d94841]">
            {tracker.database.status === "not_configured"
              ? "Database slot empty: set DATABASE_URL and run migrations to save profile copy versions. Seed copy is shown for now."
              : `Database needs inspection: ${
                  tracker.database.error ?? "profile copy could not be loaded."
                }`}
          </div>
        ) : null}

        {notice ? (
          <div
            className={`mt-5 border-2 px-4 py-3 text-sm font-bold ${
              notice.tone === "ok"
                ? "border-[#03256c]/25 bg-white text-[#1768ac]"
                : "border-[#d94841] bg-white text-[#d94841]"
            }`}
          >
            {notice.text}
          </div>
        ) : null}

        <div className="mt-6 grid w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid w-full grid-cols-1 gap-4 lg:grid-cols-3">
            {tracker.items.map((section) => {
              const hasChanged =
                (drafts[section.field]?.trim() ?? "") !== section.content.trim();
              const isSaving = savingField === section.field;
              const isSyncing = syncingField === section.field;

              return (
                <article
                  key={section.label}
                  className={`panel flex w-full flex-col justify-between bg-white p-4 ${previewMode ? "min-h-64" : "min-h-[420px]"}`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-black uppercase text-[#03256c]">
                          {section.label}
                        </p>
                        <p className="rail-label mt-1 text-xs font-black uppercase text-[#1768ac]">
                          v{section.version} - {section.statusLabel}
                        </p>
                      </div>
                      <ClipboardCopy size={18} strokeWidth={2.2} />
                    </div>
                    {previewMode ? (
                      <p className="mt-4 line-clamp-4 border-2 border-[#03256c]/20 bg-[#eafaff] p-3 text-sm leading-6 text-[#03256c]">
                        {section.content}
                      </p>
                    ) : (
                      <>
                        <textarea
                          className="mt-4 min-h-48 w-full resize-y border-2 border-[#03256c]/25 bg-[#eafaff] p-3 text-sm leading-6 text-[#03256c] outline-none focus:border-[#06bee1] focus:ring-2 focus:ring-[#06bee1]/25"
                          value={drafts[section.field] ?? section.content}
                          onChange={(event) =>
                            setDrafts((current) => ({
                              ...current,
                              [section.field]: event.target.value,
                            }))
                          }
                        />
                        <label className="rail-label mt-3 block text-xs font-black uppercase text-[#1768ac]">
                          Change note
                        </label>
                        <input
                          className="mt-2 h-10 w-full border-2 border-[#03256c]/25 bg-white px-3 text-sm text-[#03256c] outline-none focus:border-[#06bee1] focus:ring-2 focus:ring-[#06bee1]/25"
                          value={changeNotes[section.field] ?? ""}
                          onChange={(event) =>
                            setChangeNotes((current) => ({
                              ...current,
                              [section.field]: event.target.value,
                            }))
                          }
                          placeholder="Optional note"
                        />
                      </>
                    )}
                  </div>
                  <div className="mt-5 grid gap-2">
                    <button
                      className="panel panel-tap inline-flex h-10 w-full items-center justify-center gap-2 bg-[#03256c] px-3 text-sm font-black uppercase text-white"
                      onClick={() =>
                        copyProfileSection(
                          section.label,
                          drafts[section.field] ?? section.content,
                        )
                      }
                      type="button"
                    >
                      {copiedSection === section.label ? (
                        <CheckCircle2 size={16} strokeWidth={2.2} />
                      ) : (
                        <Copy size={16} strokeWidth={2.2} />
                      )}
                      {copiedSection === section.label ? "Copied" : "Copy"}
                    </button>
                    {!previewMode ? (
                      <>
                        <button
                          className="inline-flex h-10 w-full items-center justify-center gap-2 border-2 border-[#03256c]/35 px-3 text-sm font-black uppercase text-[#03256c] hover:border-[#06bee1] hover:bg-[#06bee1]/10 disabled:cursor-not-allowed disabled:border-[#03256c]/20 disabled:text-[#1768ac]/50"
                          disabled={!hasChanged || isSaving}
                          onClick={() => saveProfileSection(section)}
                          type="button"
                        >
                          <Save size={16} strokeWidth={2.2} />
                          {isSaving ? "Saving" : "Save new version"}
                        </button>
                        <button
                          className="inline-flex h-10 w-full items-center justify-center gap-2 border-2 border-[#03256c]/35 px-3 text-sm font-black uppercase text-[#03256c] hover:border-[#06bee1] hover:bg-[#06bee1]/10 disabled:cursor-not-allowed disabled:border-[#03256c]/20 disabled:text-[#1768ac]/50"
                          disabled={section.synced || isSyncing}
                          onClick={() => markProfileSectionSynced(section)}
                          type="button"
                        >
                          <CheckCircle2 size={16} strokeWidth={2.2} />
                          {section.synced ? "Pasted" : isSyncing ? "Marking" : "Mark pasted"}
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="panel w-full bg-white p-4">
            <p className="text-sm font-black uppercase text-[#03256c]">Paste checklist</p>
            <div className="mt-4 grid gap-3">
              {pendingItems.length ? (
                pendingItems.map((item, index) => (
                  <div key={item.field} className="flex items-start gap-3">
                    <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-[#03256c] bg-[#ffd84d] text-xs font-black text-[#03256c]">
                      {index + 1}
                    </div>
                    <p className="text-sm leading-6 text-[#1768ac]">
                      {getPasteTask(item)}
                    </p>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex size-6 shrink-0 items-center justify-center border-2 border-[#03256c] bg-[#7adf8b] text-xs font-black text-[#03256c]">
                    <CheckCircle2 size={14} strokeWidth={2.2} />
                  </div>
                  <p className="text-sm leading-6 text-[#1768ac]">
                    All visible profile copy is marked pasted.
                  </p>
                </div>
              )}
            </div>
            <div className="mt-5 border-2 border-[#03256c]/20 bg-[#eafaff] p-3 text-sm leading-6 text-[#1768ac]">
              Prepare and version here. Paste into LinkedIn manually.
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function buildDraftMap(items: ProfileCopyRecord[]) {
  return items.reduce(
    (drafts, item) => ({
      ...drafts,
      [item.field]: item.content,
    }),
    {} as Record<ProfileCopyField, string>,
  );
}

function buildEmptyNoteMap(items: ProfileCopyRecord[]) {
  return items.reduce(
    (notes, item) => ({
      ...notes,
      [item.field]: "",
    }),
    {} as Record<ProfileCopyField, string>,
  );
}

function getPasteTask(item: ProfileCopyRecord) {
  if (item.field === "headline") {
    return "Paste headline into LinkedIn intro.";
  }

  if (item.field === "about") {
    return "Paste About section.";
  }

  return "Update Experience summary.";
}

function ConnectionDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-2 border-[#03256c]/15 bg-[#eafaff] px-3 py-2">
      <span className="font-bold text-[#1768ac]">{label}</span>
      <span className="rail-label text-right text-xs font-black text-[#03256c]">{value}</span>
    </div>
  );
}

function getLinkedInStateLabel(state: LinkedInState) {
  const labels: Record<LinkedInState, string> = {
    loading: "Inspecting",
    setup_required: "Setup required",
    not_connected: "Not connected",
    connected: "Connected",
    attention_required: "Attention required",
    error: "Inspection failed",
  };

  return labels[state];
}

function getLinkedInActionLabel(status: LinkedInStatusResponse | null) {
  if (!status) {
    return "Inspecting";
  }

  if (!status.ownerAuthenticated) {
    return "Owner sign-in required";
  }

  if (!status.configured) {
    return "Setup needed";
  }

  return status.state === "connected" ? "Refresh LinkedIn" : "Connect LinkedIn";
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return "Not stored";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function LinkedInStateIcon({ state }: { state: LinkedInState }) {
  if (state === "loading") {
    return <Loader2 size={18} strokeWidth={1.9} />;
  }

  if (state === "connected") {
    return <CheckCircle2 size={18} strokeWidth={1.9} />;
  }

  if (state === "not_connected") {
    return <Link2 size={18} strokeWidth={1.9} />;
  }

  return <AlertTriangle size={18} strokeWidth={1.9} />;
}
