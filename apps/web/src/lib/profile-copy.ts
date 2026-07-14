export const PROFILE_COPY_FIELD_ORDER = ["headline", "about", "experience"] as const;

export type ProfileCopyField = (typeof PROFILE_COPY_FIELD_ORDER)[number];

export type ProfileCopyRecord = {
  id: string;
  field: ProfileCopyField;
  label: string;
  content: string;
  version: number;
  synced: boolean;
  statusLabel: string;
  changeNote: string | null;
  lastEditedAt: string | null;
  markedSyncedAt: string | null;
};

export type ProfileCopyTracker = {
  items: ProfileCopyRecord[];
  manualPasteCount: number;
  source: "database" | "seed_fallback";
  database: {
    configured: boolean;
    status: "ok" | "not_configured" | "error";
    error?: string;
  };
};

export const PROFILE_COPY_FIELD_LABELS: Record<ProfileCopyField, string> = {
  headline: "Headline",
  about: "About",
  experience: "Experience summary",
};

export function parseProfileCopyField(value: unknown): ProfileCopyField | null {
  if (typeof value !== "string") {
    return null;
  }

  return PROFILE_COPY_FIELD_ORDER.includes(value as ProfileCopyField)
    ? (value as ProfileCopyField)
    : null;
}

export function toProfileCopyStatusLabel(synced: boolean) {
  return synced ? "Synced" : "Manual paste required";
}
