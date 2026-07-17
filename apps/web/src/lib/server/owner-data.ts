import { getDbPool } from "./db";

export const OWNER_DELETE_CONFIRMATION = "DELETE MY FOUNDER WORKSPACE";

export async function exportOwnerWorkspace() {
  const client = await getDbPool().connect();
  try {
    const owner = await client.query("select * from owner_settings order by created_at");
    const posts = await client.query("select * from posts order by created_at");
    const profileCopy = await client.query("select * from profile_copy_versions order by field, version");
    const templates = await client.query("select * from templates order by type, scenario_tag, version");
    const postStats = await client.query("select * from post_stats order by pulled_at");
    const voiceChecks = await client.query("select * from voice_checks order by checked_at");
    const auditLog = await client.query("select * from audit_log order by created_at");

    return {
      format: "founder-above-the-fold-owner-export-v1",
      generatedAt: new Date().toISOString(),
      excludes: ["OAuth access tokens", "OAuth refresh tokens", "server secrets"],
      owner: owner.rows,
      posts: posts.rows,
      profileCopy: profileCopy.rows,
      templates: templates.rows,
      postStats: postStats.rows,
      voiceChecks: voiceChecks.rows,
      auditLog: auditLog.rows,
    };
  } finally {
    client.release();
  }
}

export async function deleteOwnerWorkspace() {
  const client = await getDbPool().connect();
  try {
    await client.query("begin");
    const counts = await client.query<{
      posts: number;
      profile_copy: number;
      templates: number;
      analytics: number;
    }>(
      `
        select
          (select count(*)::int from posts) as posts,
          (select count(*)::int from profile_copy_versions) as profile_copy,
          (select count(*)::int from templates) as templates,
          (select count(*)::int from post_stats) as analytics
      `,
    );
    await client.query("delete from automation_runs");
    await client.query("delete from posts");
    await client.query("delete from profile_copy_versions");
    await client.query("delete from templates");
    await client.query("delete from oauth_tokens");
    await client.query("delete from owner_settings");
    await client.query("delete from audit_log");
    await client.query(
      `
        insert into audit_log (actor, action, entity_type, metadata)
        values ('owner', 'owner.workspace_deleted', 'workspace', $1)
      `,
      [{ deletedCounts: counts.rows[0], retainedPersonalData: false }],
    );
    await client.query("commit");

    return {
      deleted: true,
      deletedCounts: counts.rows[0],
      retained: "anonymous deletion receipt only",
    };
  } catch (error) {
    try {
      await client.query("rollback");
    } catch {
      // Preserve the original deletion failure.
    }
    throw error;
  } finally {
    client.release();
  }
}
