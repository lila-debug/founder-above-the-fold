"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  Loader2,
  Plus,
  RefreshCcw,
  Save,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import type { PostRecord, PostTracker, VoiceCheckRecord } from "@/lib/posts";

type DraftWriteResponse = {
  error?: string;
  item?: PostRecord;
  voiceCheck?: VoiceCheckRecord;
};

type DraftForm = {
  body: string;
  pillar: string;
  archetype: string;
  notes: string;
};

type Notice = {
  tone: "ok" | "error";
  text: string;
};

const EMPTY_FORM: DraftForm = {
  body: "",
  pillar: "",
  archetype: "",
  notes: "",
};

export function DraftBoard({ initialTracker }: { initialTracker: PostTracker }) {
  const [tracker, setTracker] = useState(initialTracker);
  const [selectedId, setSelectedId] = useState(initialTracker.items[0]?.id ?? "new");
  const [form, setForm] = useState<DraftForm>(() =>
    initialTracker.items[0] ? postToForm(initialTracker.items[0]) : EMPTY_FORM,
  );
  const [notice, setNotice] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [voiceChecking, setVoiceChecking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const selectedPost = useMemo(
    () => tracker.items.find((item) => item.id === selectedId) ?? null,
    [selectedId, tracker.items],
  );
  const databaseReady = tracker.database.status === "ok";
  const isNew = selectedId === "new";
  const hasBody = Boolean(form.body.trim());
  const hasChanged =
    isNew || !selectedPost
      ? hasBody
      : JSON.stringify(form) !== JSON.stringify(postToForm(selectedPost));

  function selectPost(post: PostRecord) {
    setSelectedId(post.id);
    setForm(postToForm(post));
    setNotice(null);
  }

  function startNewDraft() {
    setSelectedId("new");
    setForm(EMPTY_FORM);
    setNotice(null);
  }

  async function saveDraft(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasBody) {
      setNotice({ tone: "error", text: "Draft body cannot be empty." });
      return;
    }

    setSaving(true);
    setNotice(null);

    const endpoint = isNew ? "/api/posts" : `/api/posts/${selectedId}`;
    const response = await fetch(endpoint, {
      method: isNew ? "POST" : "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = (await response.json()) as DraftWriteResponse;

    if (!response.ok || !result.item) {
      setSaving(false);
      setNotice({
        tone: "error",
        text: result.error ?? "Draft could not be saved.",
      });
      return;
    }

    await refreshDrafts(result.item.id, isNew ? "Draft inserted." : "Draft fastened.");
    setSaving(false);
  }

  async function deleteDraft() {
    if (isNew || !selectedPost) {
      return;
    }

    setDeleting(true);
    setNotice(null);

    const response = await fetch(`/api/posts/${selectedPost.id}`, {
      method: "DELETE",
    });
    const result = (await response.json()) as DraftWriteResponse;

    if (!response.ok) {
      setDeleting(false);
      setNotice({
        tone: "error",
        text: result.error ?? "Draft could not be deleted.",
      });
      return;
    }

    await refreshDrafts("new", "Draft removed from the workbench.");
    setForm(EMPTY_FORM);
    setDeleting(false);
  }

  async function runVoiceCheck() {
    if (isNew || !selectedPost) {
      return;
    }

    setVoiceChecking(true);
    setNotice(null);

    const response = await fetch(`/api/posts/${selectedPost.id}/voice-check`, {
      method: "POST",
    });
    const result = (await response.json()) as DraftWriteResponse;

    if (!response.ok || !result.item || !result.voiceCheck) {
      setVoiceChecking(false);
      setNotice({
        tone: "error",
        text: result.error ?? "Voice check could not be run.",
      });
      return;
    }

    await refreshDrafts(
      result.item.id,
      result.voiceCheck.status === "passed"
        ? "Voice check passed for this body hash."
        : "Voice check failed. Inspect the saved output before queueing.",
    );
    setVoiceChecking(false);
  }

  async function refreshDrafts(nextSelectedId = selectedId, successMessage?: string) {
    setRefreshing(true);
    const response = await fetch("/api/posts?status=draft", { cache: "no-store" });
    const nextTracker = (await response.json()) as PostTracker;
    const nextPost =
      nextTracker.items.find((item) => item.id === nextSelectedId) ??
      nextTracker.items[0] ??
      null;

    setTracker(nextTracker);
    setSelectedId(nextPost?.id ?? "new");
    setForm(nextPost ? postToForm(nextPost) : EMPTY_FORM);
    setNotice(
      successMessage
        ? { tone: "ok", text: successMessage }
        : nextTracker.database.status === "ok"
          ? null
          : {
              tone: "error",
              text:
                nextTracker.database.status === "not_configured"
                  ? "Database slot empty: set DATABASE_URL before saving drafts."
                  : `Database needs inspection: ${
                      nextTracker.database.error ?? "drafts could not be loaded."
                    }`,
            },
    );
    setRefreshing(false);
  }

  return (
    <section className="panel bg-white">
      <div className="flex flex-col gap-4 border-b-2 border-[#03256c]/15 px-4 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <FileText size={19} strokeWidth={2.2} />
          <h2 className="text-base font-black uppercase">Draft workbench</h2>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 border-2 border-[#03256c]/35 px-3 text-sm font-black uppercase hover:border-[#06bee1] hover:bg-[#06bee1]/10"
            onClick={() => refreshDrafts()}
            type="button"
          >
            <RefreshCcw size={16} strokeWidth={2.2} />
            {refreshing ? "Refreshing" : "Refresh"}
          </button>
          <button
            className="panel panel-tap inline-flex h-10 items-center justify-center gap-2 bg-[#03256c] px-3 text-sm font-black uppercase text-white"
            onClick={startNewDraft}
            type="button"
          >
            <Plus size={16} strokeWidth={2.2} />
            New draft
          </button>
        </div>
      </div>

      {tracker.database.status !== "ok" ? (
        <div className="mx-4 mt-4 flex items-start gap-3 border-2 border-[#d94841] bg-[#fff3ef] p-3 text-sm leading-6 text-[#d94841]">
          <AlertTriangle className="mt-0.5 shrink-0" size={17} strokeWidth={2.2} />
          <p>
            {tracker.database.status === "not_configured"
              ? "Database slot empty: seed drafts are shown, but create/edit/delete needs DATABASE_URL and migrations."
              : `Database needs inspection: ${
                  tracker.database.error ?? "drafts could not be loaded."
                }`}
          </p>
        </div>
      ) : null}

      {notice ? (
        <div
          className={`mx-4 mt-4 border-2 px-4 py-3 text-sm font-bold ${
            notice.tone === "ok"
              ? "border-[#03256c]/25 bg-[#eafaff] text-[#1768ac]"
              : "border-[#d94841] bg-[#fff3ef] text-[#d94841]"
          }`}
        >
          {notice.text}
        </div>
      ) : null}

      <div className="grid gap-4 p-4 xl:grid-cols-[minmax(300px,0.8fr)_minmax(0,1.2fr)]">
        <div className="grid content-start gap-3">
          {tracker.items.length ? (
            tracker.items.map((post) => (
              <button
                className={`w-full border-2 p-3 text-left ${
                  selectedId === post.id
                    ? "border-[#03256c] bg-[#ffd84d]/25"
                    : "border-[#03256c]/20 bg-white hover:border-[#06bee1]"
                }`}
                key={post.id}
                onClick={() => selectPost(post)}
                type="button"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-bold text-[#03256c]">
                      {post.body}
                    </p>
                    <p className="rail-label mt-2 text-xs font-black uppercase text-[#1768ac]">
                      {post.pillar ?? "Unlabelled"} / {post.voiceStatus}
                    </p>
                  </div>
                  <span className="rail-label shrink-0 border-2 border-[#03256c] px-2 py-1 text-xs font-black text-[#03256c]">
                    {post.wordCount}w
                  </span>
                </div>
              </button>
            ))
          ) : (
            <div className="border-2 border-[#03256c]/20 bg-[#eafaff] p-4 text-sm leading-6 text-[#1768ac]">
              No drafts in the parts bin yet. Insert one from the editor.
            </div>
          )}
        </div>

        <form className="grid gap-3 border-2 border-[#03256c]/20 bg-[#eafaff] p-4" onSubmit={saveDraft}>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase text-[#03256c]">
                {isNew ? "Insert new draft" : "Edit selected draft"}
              </p>
              <p className="rail-label mt-1 text-xs font-black uppercase text-[#1768ac]">
                Body hash resets voice status when text changes
              </p>
            </div>
            <span className="rail-label border-2 border-[#03256c]/25 bg-white px-2.5 py-1 text-xs font-black text-[#1768ac]">
              {form.body.trim().length} chars
            </span>
          </div>

          <label className="rail-label text-xs font-black uppercase text-[#1768ac]" htmlFor="draft-body">
            Draft body
          </label>
          <textarea
            className="min-h-44 w-full resize-y border-2 border-[#03256c]/25 bg-white p-3 text-sm leading-6 text-[#03256c] outline-none focus:border-[#06bee1] focus:ring-2 focus:ring-[#06bee1]/25"
            id="draft-body"
            value={form.body}
            onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))}
            placeholder="Write the LinkedIn draft here."
          />

          <div className="grid gap-3 md:grid-cols-2">
            <DraftInput
              label="Pillar"
              value={form.pillar}
              onChange={(value) => setForm((current) => ({ ...current, pillar: value }))}
              placeholder="Founder Clarity"
            />
            <DraftInput
              label="Archetype"
              value={form.archetype}
              onChange={(value) => setForm((current) => ({ ...current, archetype: value }))}
              placeholder="Diagnostic"
            />
          </div>

          <DraftInput
            label="Private notes"
            value={form.notes}
            onChange={(value) => setForm((current) => ({ ...current, notes: value }))}
            placeholder="Why this post exists, what to verify, or what to avoid."
          />

          <div className="grid gap-2 md:grid-cols-3">
            <button
              className="panel panel-tap inline-flex h-11 items-center justify-center gap-2 bg-[#03256c] px-4 text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-[#1768ac]/55"
              disabled={!databaseReady || !hasChanged || saving}
              type="submit"
            >
              {saving ? (
                <Loader2 size={16} strokeWidth={2.2} />
              ) : (
                <Save size={16} strokeWidth={2.2} />
              )}
              {saving ? "Saving" : isNew ? "Save draft" : "Save changes"}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#03256c]/35 px-4 text-sm font-black uppercase text-[#03256c] hover:border-[#06bee1] hover:bg-white disabled:cursor-not-allowed disabled:border-[#03256c]/20 disabled:text-[#1768ac]/50"
              disabled={!databaseReady || isNew || !selectedPost || voiceChecking}
              onClick={runVoiceCheck}
              type="button"
            >
              {voiceChecking ? (
                <Loader2 size={16} strokeWidth={2.2} />
              ) : (
                <ShieldCheck size={16} strokeWidth={2.2} />
              )}
              {voiceChecking ? "Checking" : "Voice check"}
            </button>
            <button
              className="inline-flex h-11 items-center justify-center gap-2 border-2 border-[#03256c]/35 px-4 text-sm font-black uppercase text-[#03256c] hover:border-[#06bee1] hover:bg-white disabled:cursor-not-allowed disabled:border-[#03256c]/20 disabled:text-[#1768ac]/50"
              disabled={!databaseReady || isNew || !selectedPost?.canDelete || deleting}
              onClick={deleteDraft}
              type="button"
            >
              {deleting ? (
                <Loader2 size={16} strokeWidth={2.2} />
              ) : (
                <Trash2 size={16} strokeWidth={2.2} />
              )}
              {deleting ? "Removing" : "Delete draft"}
            </button>
          </div>

          {!databaseReady ? (
            <div className="flex items-start gap-3 border-2 border-[#03256c]/15 bg-white p-3 text-sm leading-6 text-[#1768ac]">
              <CheckCircle2 className="mt-0.5 shrink-0" size={17} strokeWidth={2.2} />
              <p>
                Controls are visible now; save, delete, and voice-check unlock when
                the database parts bin is connected.
              </p>
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}

function DraftInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const id = `draft-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="rail-label grid gap-2 text-xs font-black uppercase text-[#1768ac]" htmlFor={id}>
      {label}
      <input
        className="h-10 w-full border-2 border-[#03256c]/25 bg-white px-3 text-sm font-normal normal-case text-[#03256c] outline-none focus:border-[#06bee1] focus:ring-2 focus:ring-[#06bee1]/25"
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}

function postToForm(post: PostRecord): DraftForm {
  return {
    body: post.body,
    pillar: post.pillar ?? "",
    archetype: post.archetype ?? "",
    notes: post.notes ?? "",
  };
}
