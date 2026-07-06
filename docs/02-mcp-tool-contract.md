# MCP Tool Contract

## Design Principle

The MCP server should make Dispatch easy for AI assistants to operate, while making unsafe LinkedIn automation impossible.

The server exposes Dispatch workflows, not raw LinkedIn primitives. There is no generic `linkedin_request` tool.

## Tools

### `dispatch.health`

Purpose: confirm the MCP server can reach the Dispatch backend.

Input:

- none

Output:

- backend status
- database status
- LinkedIn connection status
- current server version

### `dispatch.create_draft`

Purpose: create a draft post.

Input:

- `body`: post text
- `pillar`: optional content pillar
- `archetype`: optional post archetype
- `notes`: optional private notes
- `source`: optional origin such as `weekly_plan`, `manual`, `profile_refresh`

Output:

- `post_id`
- `status = draft`
- `voice_status = unchecked`

### `dispatch.update_draft`

Purpose: update an unpublished draft.

Input:

- `post_id`
- `body`
- optional `pillar`, `archetype`, `notes`

Output:

- updated post
- `voice_status = unchecked` for the new revision

### `dispatch.run_voice_check`

Purpose: run the British English and voice gate for a draft.

Input:

- `post_id`

Output:

- `voice_status`: `passed` or `failed`
- command output
- checked revision hash

### `dispatch.queue_post`

Purpose: schedule a voice-approved post.

Input:

- `post_id`
- `scheduled_at`

Rules:

- The post must be a draft.
- The latest revision must have `voice_status = passed`.
- `scheduled_at` must be in the future.

Output:

- `status = queued`
- scheduled time
- audit ID

### `dispatch.publish_post_now`

Purpose: publish a voice-approved post immediately.

Input:

- `post_id`
- `confirm_publication`: must be true

Rules:

- Intended for launch tests and intentional immediate posts.
- The latest revision must have `voice_status = passed`.
- Creates an audit event before the LinkedIn API call.

Output:

- `status = published` or `failed`
- LinkedIn post ID if published
- audit ID

### `dispatch.list_posts`

Purpose: inspect drafts, queue, published posts, or failures.

Input:

- optional `status`
- optional `from`
- optional `to`
- optional `limit`

Output:

- list of post summaries

### `dispatch.get_post`

Purpose: retrieve one post with voice checks, assets, stats, and audit history.

Input:

- `post_id`

Output:

- full post record

### `dispatch.cancel_post`

Purpose: cancel a queued post before publishing.

Input:

- `post_id`
- `reason`

Rules:

- Only queued posts can be cancelled.

Output:

- `status = cancelled`
- audit ID

### `dispatch.refresh_analytics`

Purpose: pull analytics for Dispatch-published posts.

Input:

- optional `post_id`
- optional `since`

Output:

- stats rows updated
- failures, if any

### `dispatch.get_post_stats`

Purpose: read stored analytics.

Input:

- optional `post_id`
- optional date range

Output:

- impressions
- likes
- comments
- engagement rate if computable from available fields

### `dispatch.upsert_profile_copy`

Purpose: update canonical profile copy in Dispatch.

Input:

- `field`: `headline`, `about`, `experience`, or `featured`
- `content`
- optional `change_note`

Rules:

- Marks the field as not synced.
- Does not attempt to edit LinkedIn.

Output:

- profile copy version
- `synced = false`
- manual paste reminder

### `dispatch.get_profile_sync_status`

Purpose: show which profile fields need manual update on LinkedIn.

Input:

- none

Output:

- current canonical versions
- synced flags
- last edited time
- last marked synced time

### `dispatch.mark_profile_copy_synced`

Purpose: mark a canonical profile field as manually pasted into LinkedIn.

Input:

- `field`
- `linkedin_updated_at`: optional timestamp supplied by owner

Output:

- `synced = true`
- version
- audit ID

### `dispatch.list_templates`

Purpose: list outreach and post templates.

Input:

- optional `scenario_tag`
- optional `type`: `outreach` or `post`

Output:

- template summaries

### `dispatch.upsert_template`

Purpose: create or update a reusable template.

Input:

- `type`: `outreach` or `post`
- `scenario_tag`
- `body`
- optional `notes`

Output:

- template ID
- version

### `dispatch.render_template`

Purpose: render a template with provided variables for manual use.

Input:

- `template_id`
- `variables`

Output:

- rendered text
- missing variables
- reminder that LinkedIn outreach is manual

## Resources

### `dispatch://voice-guide`

Read-only voice system, British English rules, hard bans, preferred phrasing, and examples.

### `dispatch://profile-copy/current`

Current canonical headline, About, Experience, and featured/profile positioning copy.

### `dispatch://content-pillars`

Approved positioning pillars and examples.

### `dispatch://queue`

Current scheduled queue.

### `dispatch://templates/{scenario_tag}`

Templates for specific scenarios.

## Prompts

### `dispatch.weekly_content_plan`

Creates a week of post briefs from the content pillars, recent published posts, and profile positioning.

### `dispatch.write_fractional_cpo_post`

Turns one brief into a draft post in the approved voice.

### `dispatch.rewrite_in_voice`

Rewrites a draft to satisfy the voice guide and British English rules.

### `dispatch.profile_refresh`

Reviews canonical profile copy and proposes updated headline/About/Experience text for manual paste.

### `dispatch.outreach_reply`

Renders a manual outreach reply from a scenario template and the current positioning.

## Explicitly Not Exposed

Never add these tools:

- `linkedin.search_profiles`
- `linkedin.get_profile`
- `linkedin.search_jobs`
- `linkedin.send_message`
- `linkedin.connect`
- `linkedin.follow`
- `linkedin.like`
- `linkedin.comment`
- `linkedin.scrape`
- `browser.open_linkedin`
- any generic browser or HTTP tool pointed at LinkedIn

Those names are useful because they are obviously tempting. They are also where the account risk lives.

