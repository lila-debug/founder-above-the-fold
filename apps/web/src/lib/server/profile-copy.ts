import {
  PROFILE_COPY_FIELD_LABELS,
  PROFILE_COPY_FIELD_ORDER,
  type ProfileCopyField,
  type ProfileCopyRecord,
  type ProfileCopyTracker,
  toProfileCopyStatusLabel,
} from "@/lib/profile-copy";
import { writeAuditEvent, type AuditActor } from "./audit";
import { dbQuery, hasDatabaseUrl } from "./db";

type ProfileCopyRow = {
  id: string;
  field: ProfileCopyField;
  content: string;
  version: number;
  synced: boolean;
  change_note: string | null;
  last_edited_at: Date | string;
  marked_synced_at: Date | string | null;
};

type ProfileCopySeed = {
  field: ProfileCopyField;
  content: string;
  version: number;
  synced: boolean;
  changeNote: string;
};

const CANONICAL_PROFILE_COPY_SEEDS: ProfileCopySeed[] = [
  {
    field: "headline",
    version: 3,
    synced: false,
    changeNote: "Seeded from the landing page fractional CPO headline.",
    content:
      "Fractional CPO for AI-native founders | Product strategy, sharper roadmaps, and operating systems that help teams ship what matters",
  },
  {
    field: "about",
    version: 5,
    synced: true,
    changeNote: "Seeded from the landing page About copy and voice-system notes.",
    content:
      "I help founders turn messy product signals into clear product decisions. Through Prototype Cafe, I work as a fractional CPO for teams that need senior product judgement before they are ready for a full-time product executive.",
  },
  {
    field: "experience",
    version: 2,
    synced: true,
    changeNote: "Seeded from the landing page experience summary.",
    content:
      "Fractional product leadership across strategy, discovery, roadmap design, AI-native workflows, launch planning, and product operating systems.",
  },
];

export async function getProfileCopyTracker(): Promise<ProfileCopyTracker> {
  if (!hasDatabaseUrl()) {
    return buildSeedFallbackTracker({
      configured: false,
      status: "not_configured",
    });
  }

  try {
    await seedProfileCopyIfEmpty();

    const result = await dbQuery<ProfileCopyRow>(
      `
        select distinct on (field)
          id,
          field,
          content,
          version,
          synced,
          change_note,
          last_edited_at,
          marked_synced_at
        from profile_copy_versions
        where field = any($1::text[])
        order by field, version desc
      `,
      [PROFILE_COPY_FIELD_ORDER],
    );

    return buildTracker(result.rows, {
      configured: true,
      status: "ok",
    });
  } catch {
    return buildSeedFallbackTracker({
      configured: true,
      status: "error",
      error: "Profile copy storage could not be inspected.",
    });
  }
}

export async function createProfileCopyVersion({
  actor,
  field,
  content,
  changeNote,
}: {
  actor: AuditActor;
  field: ProfileCopyField;
  content: string;
  changeNote?: string | null;
}) {
  const trimmedContent = content.trim();

  if (!trimmedContent) {
    throw new Error("Profile copy content cannot be empty.");
  }

  await seedProfileCopyIfEmpty();

  const result = await dbQuery<ProfileCopyRow>(
    `
      with next_version as (
        select coalesce(max(version), 0) + 1 as version
        from profile_copy_versions
        where field = $1
      )
      insert into profile_copy_versions (
        field,
        content,
        version,
        synced,
        change_note,
        last_edited_at,
        marked_synced_at
      )
      select
        $1,
        $2,
        version,
        false,
        $3,
        now(),
        null
      from next_version
      returning
        id,
        field,
        content,
        version,
        synced,
        change_note,
        last_edited_at,
        marked_synced_at
    `,
    [field, trimmedContent, normalizeChangeNote(changeNote)],
  );

  const row = result.rows[0];

  await writeAuditEvent({
    actor,
    action: "profile_copy.version_created",
    entityType: "profile_copy",
    entityId: row.id,
    metadata: {
      field,
      version: row.version,
      synced: row.synced,
    },
  });

  return toProfileCopyRecord(row);
}

export async function markLatestProfileCopySynced({
  actor,
  field,
}: {
  actor: AuditActor;
  field: ProfileCopyField;
}) {
  await seedProfileCopyIfEmpty();

  const result = await dbQuery<ProfileCopyRow>(
    `
      update profile_copy_versions
      set synced = true,
          marked_synced_at = now()
      where id = (
        select id
        from profile_copy_versions
        where field = $1
        order by version desc
        limit 1
      )
      returning
        id,
        field,
        content,
        version,
        synced,
        change_note,
        last_edited_at,
        marked_synced_at
    `,
    [field],
  );

  const row = result.rows[0];

  if (!row) {
    return null;
  }

  await writeAuditEvent({
    actor,
    action: "profile_copy.marked_synced",
    entityType: "profile_copy",
    entityId: row.id,
    metadata: {
      field,
      version: row.version,
    },
  });

  return toProfileCopyRecord(row);
}

async function seedProfileCopyIfEmpty() {
  for (const seed of CANONICAL_PROFILE_COPY_SEEDS) {
    await dbQuery(
      `
        insert into profile_copy_versions (
          field,
          content,
          version,
          synced,
          change_note,
          marked_synced_at
        )
        select $1, $2, $3, $4, $5, case when $4 then now() else null end
        where not exists (
          select 1 from profile_copy_versions where field = $1
        )
        on conflict (field, version) do nothing
      `,
      [seed.field, seed.content, seed.version, seed.synced, seed.changeNote],
    );
  }
}

function buildTracker(
  rows: ProfileCopyRow[],
  database: ProfileCopyTracker["database"],
): ProfileCopyTracker {
  const byField = new Map(rows.map((row) => [row.field, row]));
  const items = PROFILE_COPY_FIELD_ORDER.map((field) => {
    const row = byField.get(field);

    return row
      ? toProfileCopyRecord(row)
      : toProfileCopyRecord(seedToRow(CANONICAL_PROFILE_COPY_SEEDS.find((seed) => seed.field === field)!));
  });

  return {
    items,
    manualPasteCount: items.filter((item) => !item.synced).length,
    source: "database",
    database,
  };
}

function buildSeedFallbackTracker(
  database: ProfileCopyTracker["database"],
): ProfileCopyTracker {
  const items = CANONICAL_PROFILE_COPY_SEEDS.map((seed) =>
    toProfileCopyRecord(seedToRow(seed)),
  );

  return {
    items,
    manualPasteCount: items.filter((item) => !item.synced).length,
    source: "seed_fallback",
    database,
  };
}

function toProfileCopyRecord(row: ProfileCopyRow): ProfileCopyRecord {
  return {
    id: row.id,
    field: row.field,
    label: PROFILE_COPY_FIELD_LABELS[row.field],
    content: row.content,
    version: row.version,
    synced: row.synced,
    statusLabel: toProfileCopyStatusLabel(row.synced),
    changeNote: row.change_note,
    lastEditedAt: toIsoString(row.last_edited_at),
    markedSyncedAt: toIsoString(row.marked_synced_at),
  };
}

function seedToRow(seed: ProfileCopySeed): ProfileCopyRow {
  return {
    id: `seed-${seed.field}`,
    field: seed.field,
    content: seed.content,
    version: seed.version,
    synced: seed.synced,
    change_note: seed.changeNote,
    last_edited_at: "",
    marked_synced_at: seed.synced ? "" : null,
  };
}

function toIsoString(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

function normalizeChangeNote(value?: string | null) {
  const trimmed = value?.trim();

  return trimmed ? trimmed : null;
}
