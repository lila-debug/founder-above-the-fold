import { dbQuery } from "./db";

export type AuditActor = "owner" | "mcp" | "cron" | "system";

export type AuditEventInput = {
  actor: AuditActor;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
};

export type AuditEvent = {
  id: string;
  actor: AuditActor;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export async function writeAuditEvent({
  actor,
  action,
  entityType,
  entityId,
  metadata = {},
}: AuditEventInput) {
  const result = await dbQuery<AuditEvent>(
    `
      insert into audit_log (actor, action, entity_type, entity_id, metadata)
      values ($1, $2, $3, $4, $5)
      returning id, actor, action, entity_type, entity_id, metadata, created_at
    `,
    [actor, action, entityType, entityId ?? null, metadata],
  );

  return result.rows[0];
}
