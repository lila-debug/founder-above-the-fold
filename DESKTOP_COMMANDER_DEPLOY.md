# Desktop Commander Prompt — Deploy Founder Above the Fold

Copy and paste this into Desktop Commander:

---

"Open my terminal. I need to deploy the Founder Above the Fold app from ~/Desktop/LinkedIn app/founder-above-the-fold.

**Step 1 — Link to the correct project**
1. Type: `cd ~/Desktop/LinkedIn\ app/founder-above-the-fold`
2. Type: `vercel link`
3. When it asks "Which project?", press the UP arrow key to see all projects
4. Select the project named exactly `founder-above-the-fold` (NOT `founder-above-the-fold-2u9u` or any other variant)
5. Confirm linking

**Step 2 — Fix the cron job for Hobby plan**
1. Open the file `apps/web/src/app/api/cron/publish-due/route.ts`
2. Find the cron expression `*/15 * * * *` (runs every 15 minutes)
3. Replace it with `0 0 * * *` (runs once daily at midnight)
4. Save the file

**Step 3 — Commit and push**
1. Type: `git add -A && git commit -m "fix: daily cron for Hobby plan" && git push`

**Step 4 — Deploy**
1. Type: `vercel --prod`
2. Wait for the build to complete
3. Report the deployment URL when finished

**Step 5 — Verify**
1. Open the deployment URL in a browser
2. Confirm the page loads without errors
3. Report the URL back to me

Do not proceed to the next step until the current one succeeds. If any step fails, stop and report the exact error message."

---
