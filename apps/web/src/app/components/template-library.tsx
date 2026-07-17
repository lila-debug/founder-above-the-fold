"use client";

import { Check, ClipboardCopy, FilePenLine, ShieldCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TemplateType = "outreach" | "post";

type TemplateRecord = {
  id: string;
  type: TemplateType;
  scenarioTag: string;
  body: string;
  notes: string | null;
  version: number;
  variables: string[];
};

export function TemplateLibrary() {
  const [type, setType] = useState<TemplateType>("outreach");
  const [items, setItems] = useState<TemplateRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [rendered, setRendered] = useState("");
  const [notice, setNotice] = useState("Loading template drawer…");
  const [busy, setBusy] = useState(false);
  const selected = useMemo(
    () => items.find((item) => item.id === selectedId) ?? items[0] ?? null,
    [items, selectedId],
  );

  useEffect(() => {
    let active = true;
    fetch(`/api/templates?type=${type}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as {
          items?: TemplateRecord[];
          error?: string;
        };
        if (!response.ok) throw new Error(payload.error ?? "Template drawer could not open.");
        if (!active) return;
        setItems(payload.items ?? []);
        setSelectedId(payload.items?.[0]?.id ?? null);
        setVariables({});
        setRendered("");
        setNotice(payload.items?.length ? "Select a panel, fit its labels, then copy it." : "No panels fitted yet.");
      })
      .catch((error: unknown) => {
        if (active) setNotice(error instanceof Error ? error.message : "Template drawer could not open.");
      });
    return () => {
      active = false;
    };
  }, [type]);

  async function renderSelected() {
    if (!selected) return;
    setBusy(true);
    const response = await fetch(`/api/templates/${selected.id}/render`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variables }),
    });
    const payload = (await response.json()) as {
      rendered?: string;
      missingVariables?: string[];
      error?: string;
    };
    if (!response.ok || payload.rendered === undefined) {
      setNotice(payload.error ?? "Template could not be assembled.");
    } else {
      setRendered(payload.rendered);
      setNotice(
        payload.missingVariables?.length
          ? `Fit the missing labels: ${payload.missingVariables.join(", ")}.`
          : "Panel assembled. Inspect it before copying.",
      );
    }
    setBusy(false);
  }

  async function copyRendered() {
    if (!rendered) return;
    await navigator.clipboard.writeText(rendered);
    setNotice("Copied. Paste and send manually after checking the recipient and context.");
  }

  return (
    <section className="paper-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-black pb-4">
        <div className="section-kicker"><FilePenLine size={18} /> Template drawer</div>
        <div className="flex gap-2" role="group" aria-label="Template type">
          {(["outreach", "post"] as const).map((option) => (
            <button
              className={`hard-button py-2 ${type === option ? "bg-[#f4d13d]" : "bg-white"}`}
              key={option}
              onClick={() => {
                setNotice("Loading template drawer…");
                setType(option);
              }}
              type="button"
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.72fr_1.28fr]">
        <div className="grid max-h-[34rem] content-start gap-2 overflow-auto pr-1">
          {items.map((item) => (
            <button
              className={`field-slat text-left ${selected?.id === item.id ? "bg-[#d8eee8]" : ""}`}
              key={item.id}
              onClick={() => {
                setSelectedId(item.id);
                setVariables({});
                setRendered("");
              }}
              type="button"
            >
              <span>{item.scenarioTag}</span><span>v{item.version} →</span>
            </button>
          ))}
        </div>

        {selected ? (
          <div className="grid gap-4">
            <div>
              <p className="cut-label inline-block">{selected.scenarioTag} · v{selected.version}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-6">{selected.body}</p>
              {selected.notes ? <p className="mt-3 text-xs font-bold text-black/60">{selected.notes}</p> : null}
            </div>
            {selected.variables.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {selected.variables.map((name) => (
                  <label className="grid gap-1 text-xs font-black uppercase" key={name}>
                    {name.replaceAll("_", " ")}
                    <input
                      className="border-2 border-black bg-white p-3 font-sans text-sm normal-case"
                      onChange={(event) => setVariables((current) => ({ ...current, [name]: event.target.value }))}
                      value={variables[name] ?? ""}
                    />
                  </label>
                ))}
              </div>
            ) : null}
            <button className="hard-button bg-[#49a894] text-white" disabled={busy} onClick={renderSelected} type="button">
              <Check size={17} /> Assemble preview
            </button>
            {rendered ? (
              <div className="border-2 border-black bg-white p-4">
                <p className="whitespace-pre-wrap text-sm font-semibold leading-6">{rendered}</p>
                <button className="hard-button mt-4 bg-[#f4d13d]" onClick={copyRendered} type="button">
                  <ClipboardCopy size={17} /> Copy panel
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="warning-strip mt-5"><ShieldCheck size={18} /> {notice} Founder Above the Fold never sends outreach.</div>
    </section>
  );
}
