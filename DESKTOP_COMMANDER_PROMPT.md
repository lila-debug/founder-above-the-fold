# Desktop Commander Prompt — Founder Above the Fold Setup

Copy and paste this into Desktop Commander, or read it aloud:

---

"Open my browser. I need to set up my Founder Above the Fold app on Vercel and Neon. Do this step by step.

**Step 1: Database Setup**
1. Go to vercel.com and log in if needed.
2. Find my project called 'founder-above-the-fold' or 'Founder Above the Fold'.
3. Click the 'Storage' tab.
4. Click the Neon database connected to this project.
5. Click 'Open in Neon Console'.
6. Click 'SQL Editor' or 'Query' tab.
7. Open a new tab in the browser and go to github.com/lila-debug/founder-above-the-fold.
8. Find the file called 'schema.sql' in the repo root.
9. Copy the entire contents of that file.
10. Go back to the Neon SQL Editor tab.
11. Paste the copied SQL into the editor.
12. Click 'Run' or the play button.
13. Wait for it to say 'Success' or show green checkmarks. Do not proceed if there are errors.

**Step 2: Environment Variables**
1. Go back to the Vercel tab for the Founder Above the Fold project.
2. Click 'Settings' tab.
3. Click 'Environment Variables' in the left sidebar.
4. Add these variables one by one. Click 'Add' after each:

   - Name: `DATABASE_URL`
     Value: Go to the Neon tab, find 'Connection String', copy the PostgreSQL URL (starts with postgresql://), paste it here.

   - Name: `LINKEDIN_CLIENT_ID`
     Value: [Your LinkedIn Developer App Client ID — paste it]

   - Name: `LINKEDIN_CLIENT_SECRET`
     Value: [Your LinkedIn Developer App Client Secret — paste it]

   - Name: `LINKEDIN_REDIRECT_URI`
     Value: `https://founderaccount.app/api/auth/linkedin/callback`

   - Name: `NEXT_PUBLIC_APP_URL`
     Value: `https://founderaccount.app`

   - Name: `CRON_SECRET`
     Value: [Type a random string of 32 letters and numbers, no spaces]

   - Name: `MAGIC_LINK_SECRET`
     Value: [Type a different random string of 32+ letters and numbers, no spaces]

5. Click 'Save' after all variables are added.

**Step 3: Deploy**
1. In the Vercel project, click the 'Deployments' tab.
2. Find the latest deployment and click 'Redeploy' or click the big 'Deploy' button.
3. Wait for the build to complete (green checkmark).
4. Click the preview URL to test the app.

**Step 4: Verification**
1. Open `https://founderaccount.app` in a new tab.
2. Check that the page loads without errors.
3. If you see a 500 error or 'Internal Server Error', check the Vercel logs (Settings > Runtime Logs) and report any errors.

Do not skip steps. Confirm each step is completed before moving to the next. If any step fails, stop and tell me what happened."

---

## Alternative: Copy-paste checklist

If Desktop Commander cannot do this automatically, print this checklist and do it manually, checking each box:

- [ ] Database: Open Neon Console from Vercel Storage tab
- [ ] Database: Open SQL Editor
- [ ] Database: Copy schema.sql from GitHub repo
- [ ] Database: Paste and run SQL in Neon
- [ ] Vercel: Add `DATABASE_URL` environment variable (from Neon connection string)
- [ ] Vercel: Add `LINKEDIN_CLIENT_ID`
- [ ] Vercel: Add `LINKEDIN_CLIENT_SECRET`
- [ ] Vercel: Add `LINKEDIN_REDIRECT_URI` = `https://founderaccount.app/api/auth/linkedin/callback`
- [ ] Vercel: Add `NEXT_PUBLIC_APP_URL` = `https://founderaccount.app`
- [ ] Vercel: Add `CRON_SECRET` (random string)
- [ ] Vercel: Add `MAGIC_LINK_SECRET` (random string)
- [ ] Vercel: Click Deploy and wait for build
- [ ] Test: Open `https://founderaccount.app` and verify it loads
