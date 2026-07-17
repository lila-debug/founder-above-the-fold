import { writeAuditEvent, type AuditActor } from "./audit";
import { dbQuery } from "./db";

export type TemplateType = "outreach" | "post";

type TemplateRow = {
  id: string;
  type: TemplateType;
  scenario_tag: string;
  body: string;
  notes: string | null;
  version: number;
  created_at: Date | string;
  updated_at: Date | string;
};

export type TemplateRecord = {
  id: string;
  type: TemplateType;
  scenarioTag: string;
  body: string;
  notes: string | null;
  version: number;
  variables: string[];
  createdAt: string;
  updatedAt: string;
};

export type TemplateWriteInput = {
  type?: unknown;
  scenarioTag?: unknown;
  body?: unknown;
  notes?: unknown;
};

export class TemplateError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
  ) {
    super(message);
  }
}

export async function listTemplates({
  type,
  scenarioTag,
}: {
  type?: TemplateType | null;
  scenarioTag?: string | null;
} = {}) {
  const result = await dbQuery<TemplateRow>(
    `
      select *
      from templates
      where ($1::text is null or type = $1)
        and ($2::text is null or scenario_tag = $2)
      order by type, scenario_tag, updated_at desc
    `,
    [type ?? null, scenarioTag?.trim() || null],
  );

  return { items: result.rows.map(toTemplateRecord) };
}

export async function createTemplate({
  actor,
  input,
}: {
  actor: AuditActor;
  input: TemplateWriteInput;
}) {
  const value = normalizeTemplateInput(input, { requireAll: true });
  const result = await dbQuery<TemplateRow>(
    `
      insert into templates (type, scenario_tag, body, notes)
      values ($1, $2, $3, $4)
      returning *
    `,
    [value.type, value.scenarioTag, value.body, value.notes],
  );
  const item = toTemplateRecord(result.rows[0]);

  await writeAuditEvent({
    actor,
    action: "template.created",
    entityType: "template",
    entityId: item.id,
    metadata: { type: item.type, scenarioTag: item.scenarioTag, version: item.version },
  });

  return item;
}

export async function updateTemplate({
  actor,
  id,
  input,
}: {
  actor: AuditActor;
  id: string;
  input: TemplateWriteInput;
}) {
  const currentResult = await dbQuery<TemplateRow>(
    "select * from templates where id = $1 limit 1",
    [id],
  );
  const current = currentResult.rows[0];

  if (!current) return null;

  const value = normalizeTemplateInput(input, { current, requireAll: false });
  const changed =
    value.type !== current.type ||
    value.scenarioTag !== current.scenario_tag ||
    value.body !== current.body ||
    value.notes !== current.notes;
  const result = await dbQuery<TemplateRow>(
    `
      update templates
      set type = $2,
          scenario_tag = $3,
          body = $4,
          notes = $5,
          version = version + case when $6 then 1 else 0 end
      where id = $1
      returning *
    `,
    [id, value.type, value.scenarioTag, value.body, value.notes, changed],
  );
  const item = toTemplateRecord(result.rows[0]);

  await writeAuditEvent({
    actor,
    action: "template.updated",
    entityType: "template",
    entityId: item.id,
    metadata: {
      type: item.type,
      scenarioTag: item.scenarioTag,
      version: item.version,
      changed,
    },
  });

  return item;
}

export async function renderTemplate({
  id,
  variables,
}: {
  id: string;
  variables: unknown;
}) {
  const result = await dbQuery<TemplateRow>(
    "select * from templates where id = $1 limit 1",
    [id],
  );
  const row = result.rows[0];

  if (!row) return null;

  const supplied = normalizeVariables(variables);
  const required = extractVariables(row.body);
  const missing = required.filter((name) => !supplied[name]?.trim());
  const rendered = row.body.replace(/{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g, (_, name: string) =>
    supplied[name]?.trim() || `{{${name}}}`,
  );

  return {
    template: toTemplateRecord(row),
    rendered,
    missingVariables: missing,
    manualOnly: true,
    reminder: "Copy this text for manual use. Founder Above the Fold never sends outreach.",
  };
}

export function parseTemplateType(value: string | null): TemplateType | null {
  return value === "outreach" || value === "post" ? value : null;
}

function normalizeTemplateInput(
  input: TemplateWriteInput,
  options: { current?: TemplateRow; requireAll: boolean },
) {
  const type =
    input.type === undefined ? options.current?.type : input.type;
  const scenarioTag =
    input.scenarioTag === undefined
      ? options.current?.scenario_tag
      : normalizeRequiredText(input.scenarioTag, "Scenario tag", 80);
  const body =
    input.body === undefined
      ? options.current?.body
      : normalizeRequiredText(input.body, "Template body", 5_000);
  const notes =
    input.notes === undefined
      ? options.current?.notes ?? null
      : normalizeOptionalText(input.notes, "Notes", 1_000);

  if (type !== "outreach" && type !== "post") {
    throw new TemplateError("Template type must be outreach or post.", 400);
  }

  if (options.requireAll && (!scenarioTag || !body)) {
    throw new TemplateError("Template type, scenario tag, and body are required.", 400);
  }

  return { type, scenarioTag: scenarioTag!, body: body!, notes };
}

function normalizeVariables(value: unknown) {
  if (value === undefined || value === null) return {} as Record<string, string>;

  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TemplateError("Template variables must be a labelled object.", 400);
  }

  const entries = Object.entries(value);
  if (entries.length > 50) {
    throw new TemplateError("A template can receive at most 50 variables.", 400);
  }

  return Object.fromEntries(
    entries.map(([key, child]) => {
      if (!/^[A-Za-z][A-Za-z0-9_]{0,49}$/.test(key) || typeof child !== "string") {
        throw new TemplateError("Template variables must use safe text labels and values.", 400);
      }
      return [key, child.slice(0, 500)];
    }),
  );
}

function normalizeRequiredText(value: unknown, label: string, maxLength: number) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TemplateError(`${label} cannot be empty.`, 400);
  }
  if (value.trim().length > maxLength) {
    throw new TemplateError(`${label} is too long.`, 400);
  }
  return value.trim();
}

function normalizeOptionalText(value: unknown, label: string, maxLength: number) {
  if (value === null || value === "") return null;
  if (typeof value !== "string") {
    throw new TemplateError(`${label} must be text.`, 400);
  }
  if (value.trim().length > maxLength) {
    throw new TemplateError(`${label} is too long.`, 400);
  }
  return value.trim() || null;
}

function extractVariables(body: string) {
  return Array.from(
    new Set(
      Array.from(body.matchAll(/{{\s*([A-Za-z][A-Za-z0-9_]*)\s*}}/g), (match) => match[1]),
    ),
  );
}

function toTemplateRecord(row: TemplateRow): TemplateRecord {
  return {
    id: row.id,
    type: row.type,
    scenarioTag: row.scenario_tag,
    body: row.body,
    notes: row.notes,
    version: row.version,
    variables: extractVariables(row.body),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
