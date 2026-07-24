# Founder Above the Fold Web + MCP Conveyor
## IKEA / Meccano Assembly Manual Edition

### Box Contents
| Label | Part | Plain-English job | Where it lives | Owner |
|---|---|---|---|---|
| A | Owner lock | Opens the private cabinet with a signed, time-limited link | `apps/web/src/lib/auth` and `/api/auth/*` | Owner + operator |
| B | LinkedIn socket | Connects the one verified owner through official OAuth | `/api/auth/linkedin/*` | Owner |
| C | Draft conveyor | Creates, edits, voice-checks, queues, cancels and publishes posts | `/api/posts/*` and `apps/web/src/lib/server/posts.ts` | Owner |
| D | Publishing motor | Sends confirmed or due posts through LinkedIn's official Posts API | `apps/web/src/lib/server/publishing.ts` and `/api/cron/publish-due` | Conveyor timer |
| E | Analytics gauge | Pulls only official metrics returned for posts made by this app | `apps/web/src/lib/server/analytics.ts` | Owner + LinkedIn |
| F | Template drawer | Stores, versions and renders manual-only copy jigs | `/api/templates/*` and `database/migrations/0003_seed_templates.sql` | Owner |
| G | Owner escape hinges | Disconnects LinkedIn, exports data and performs verified deletion | `/api/auth/linkedin/disconnect` and `/api/owner/*` | Owner |
| H | MCP adapter rail | Exposes the same guarded cabinet as 17 tools and 4 resources | `apps/mcp-server` | MCP client |
| I | Domain route plate | Routes `.app` and `.dev` paths to the primary `.com` cabinet | `apps/web/next.config.ts` | Deployment operator |

### Mission Control Board
```text
[Signed owner / MCP key]
          |
          v
[Draft] -> [exact-revision voice lock] -> [Queue] -> [official LinkedIn Posts API]
    |                                          |
    +-> [profile copy]                         +-> [official own-post analytics]
    +-> [manual templates]
    +-> [export / disconnect / verified deletion]
```

### Assembly Steps
#### Step 1 - Open the owner lock
Diagram:
```text
[Owner email] ---> [15-minute link] ---> [30-day signed session]
```
Do:
1. Fit `AUTH_PROVIDER=resend`, `AUTH_CALLBACK_URL`, `RESEND_API_KEY`, `MAGIC_LINK_FROM`, `MAGIC_LINK_SECRET`, and `DISPATCH_OWNER_EMAIL` in production.
2. Request the link from the public access panel.
3. Inspect `/api/auth/session` before opening the private workbench.

Check:
- A different email is refused.
- Production refuses to emit a development link when the mail fasteners are missing.

Avoid:
- Copying a magic-link token or provider secret into a manual, issue, MCP prompt or screenshot.

#### Step 2 - Insert the LinkedIn socket
Diagram:
```text
[Owner session] ---> [OAuth state clamp] ---> [exact callback] ---> [encrypted server token]
```
Do:
1. Register `https://www.founderaccount.com/api/auth/linkedin/callback` character-for-character.
2. Fit the OpenID, profile, email and `w_member_social` grants.
3. Start the connection from the signed owner cabinet.
4. Accept the identity only when its email is verified and matches the owner slot.

Check:
- The callback returns to `/#command-centre` with a visible state.
- Disconnect removes the stored OAuth fastener and locks publishing.

Avoid:
- LinkedIn passwords, scraping, browser automation, DMs, follows, likes, comments, reposts or profile edits.

#### Step 3 - Turn the content conveyor
Diagram:
```text
[Save draft] ---> [hash revision] ---> [voice pass] ---> [future slot]
                                                        |
                                    [cancel] <-----------+---> [publish]
```
Do:
1. Save the post body.
2. Run the built-in British-English gate or the labelled external gate.
3. Queue only the exact body hash that passed.
4. Cancel before the due time, or explicitly confirm Publish now.

Check:
- Failed and stale voice checks cannot enter the queue.
- `429` and `5xx` receive one retry; ambiguous network failures receive none, preventing a blind duplicate.
- A successful official request records the LinkedIn post ID and audit trail.

Avoid:
- Calling the public publish tool during a test without the owner's specific approval.

#### Step 4 - Read the gauges and use the drawers
Diagram:
```text
[App-published URN] ---> [LinkedIn analytics grant] ---> [returned metrics only]
[Template] -----------> [fit variables] -------------> [manual copy]
```
Do:
1. Grant `r_member_postAnalytics` separately before turning the analytics gauge.
2. Refresh only posts carrying a LinkedIn ID created by this cabinet.
3. Render outreach and post jigs, inspect missing variables, then copy manually.

Check:
- Missing metrics show unavailable, never fabricated zero.
- Outreach templates never expose a send control.

Avoid:
- Treating a missing analytics permission as zero engagement.

#### Step 5 - Test the MCP adapter rail
Diagram:
```text
[MCP client] ---> [stdio adapter] ---> [Founder API key] ---> [same server locks]
```
Do:
1. Set `MCP_API_BASE_URL` and `MCP_API_KEY` outside the prompt.
2. Run `npm run test:smoke -w apps/mcp-server` against the local cabinet.
3. Inspect the tool list, resources and safe workflow report.

Check:
- The smoke test reports 17 tools, 4 resources and `draft -> voice-passed -> queued -> cancelled`.
- It reports `publicSideEffect: false`.

Avoid:
- Giving an MCP client raw LinkedIn credentials or a generic social browser tool.

#### Step 6 - Route the domain plate
Diagram:
```text
[.app/path] --308--\
                    +--> [www.founderaccount.com/path]
[.dev/path] --308--/
```
Do:
1. Deploy the host-based redirect rules only after the owner approves a production change.
2. Test both bare and `www` hosts with a non-root path.
3. Keep the exact `.com` OAuth callback and auth callback aligned after routing.

Check:
- Local host-header tests preserve `/privacy` while redirecting all four secondary hosts.

Avoid:
- Assuming domain attachment alone makes `.app` and `.dev` redirect to `.com`.

### Safety Stickers
- [Security] OAuth tokens are encrypted server-side and excluded from owner export and MCP output.
- [Privacy] The owner can disconnect, export or type the exact verified-deletion phrase; deletion clears the session and personal bins.
- [Cost] Cron frequency is 15 minutes for publishing and daily for analytics; inspect provider limits before increasing it.
- [IP] Only owner-supplied or approved copy enters the conveyor.
- [Evidence] Local database, browser and MCP tests passed. Production Resend delivery and the real owner dashboard sign-in passed on 2026-07-19. A live first publish, analytics grant and Cookiebot scan remain external evidence gates.

### Finished-Build Test
- [x] Local Postgres migrations `0001`–`0003` apply.
- [x] Eleven core integration checks pass against real local database state.
- [x] Desktop and mobile owner browser workflows pass without console errors.
- [x] MCP protocol smoke lists and calls the real tools and resources.
- [x] `.app` and `.dev` redirect rules pass local host-header checks.
- [ ] Owner completes one approved live OAuth connection and text-only publish.
- [ ] LinkedIn grants analytics scope and returns a live snapshot.
- [x] Production Resend slots are fitted and one real owner magic-link sign-in is proved.
- [x] Founder-confirmed owner email was re-fitted on 2026-07-23; the repaired live panel accepted it and confirmed a fresh magic link was sent.
- [ ] Cookiebot slots are fitted and tested.
- [x] Owner approved and verified production deployment `dpl_HoS5VE6JMaocZApSfvAhGc3aNWAp`.
- [x] Public `/try` panel keeps the mechanism visible without a wall of introductory text.

---

Based on true events. Sadly.

Canadian Kind, Scottish Strong, Nigerian Proud.

© 2024–2026 Lila Olufemi Abegunrin · REVOLUTIONISING LIFE SINCE 1982™

Founder Above the Fold™ · Trademarks and Patents Pending (CIPO)
