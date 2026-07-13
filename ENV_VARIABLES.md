# Environment Variables for Vercel

Copy these to Vercel Dashboard → Settings → Environment Variables

## Production Environment Variables

```bash
# Database (Already configured - DO NOT CHANGE)
DATABASE_URL=postgresql://neondb_owner:npg_vABc16UWMVif@ep-delicate-field-atbc3rct-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# App URL (UPDATE after Vercel assigns URL)
NEXT_PUBLIC_APP_URL=https://founder-above-the-fold.vercel.app

# Auth Settings
MAGIC_LINK_SECRET=founder-above-the-fold-2026-secret-key-$(date +%s)-$(openssl rand -hex 16)
AUTH_PROVIDER=dev
MAGIC_LINK_FROM=Founder Above the Fold <login@founderaccount.app>

# LinkedIn OAuth (UPDATE with real credentials from LinkedIn Developer Portal)
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=https://founder-above-the-fold.vercel.app/api/linkedin/oauth/callback

# Email (Optional - Add when ready for production email)
RESEND_API_KEY=

# Cron Security
CRON_SECRET=cron-$(date +%s)-$(openssl rand -hex 16)

# Node Environment
NODE_ENV=production
```

## How to Add to Vercel

1. Go to https://vercel.com/dashboard
2. Select project "founder-above-the-fold"
3. Click Settings → Environment Variables
4. For each variable above:
   - Click "Add New"
   - Enter Name (e.g., DATABASE_URL)
   - Enter Value (copy from above)
   - Select "Production" environment
   - Click "Save"

## After Adding Variables

1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Wait for deployment to complete
4. Test your app!

## Quick Copy Format (for pasting)

```
DATABASE_URL=postgresql://neondb_owner:npg_vABc16UWMVif@ep-delicate-field-atbc3rct-pooler.c-9.us-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
NEXT_PUBLIC_APP_URL=https://founder-above-the-fold.vercel.app
MAGIC_LINK_SECRET=founder-above-the-fold-2026-super-secret-change-me
AUTH_PROVIDER=dev
MAGIC_LINK_FROM=Founder Above the Fold <login@founderaccount.app>
LINKEDIN_CLIENT_ID=your_linkedin_client_id_here
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret_here
LINKEDIN_REDIRECT_URI=https://founder-above-the-fold.vercel.app/api/linkedin/oauth/callback
RESEND_API_KEY=
CRON_SECRET=cron-secret-change-me
NODE_ENV=production
```

## Variable Descriptions

| Variable | Purpose | When to Change |
|----------|---------|----------------|
| DATABASE_URL | Neon PostgreSQL connection | Never (already configured) |
| NEXT_PUBLIC_APP_URL | Your app's public URL | After first Vercel deploy |
| MAGIC_LINK_SECRET | JWT signing secret | Use strong random string |
| AUTH_PROVIDER | Email provider | Change to "resend" when ready |
| LINKEDIN_CLIENT_ID | LinkedIn OAuth | When you create LinkedIn app |
| LINKEDIN_CLIENT_SECRET | LinkedIn OAuth | When you create LinkedIn app |
| LINKEDIN_REDIRECT_URI | OAuth callback | Update with your Vercel URL |
| RESEND_API_KEY | Email sending | When you sign up for Resend |
| CRON_SECRET | Protects cron endpoint | Use strong random string |
| NODE_ENV | Runtime environment | Keep as "production" |

## Testing After Deployment

1. Visit your Vercel URL
2. Click "Get Early Access"
3. Enter email: test@example.com
4. Check Vercel Runtime Logs (Functions tab) for magic link
5. Copy magic link URL and visit it
6. Complete onboarding questionnaire
7. Verify profile copy and posts are generated

## Common Issues

**Magic link not appearing?**
- Check Vercel → Deployments → Click deployment → Functions → Runtime Logs
- Magic link URL is printed to console in dev mode

**Database connection failed?**
- Verify DATABASE_URL is exactly as shown above
- Check Neon dashboard that database is active

**LinkedIn OAuth fails?**
- Expected until you add real credentials
- Get them from https://www.linkedin.com/developers/

## Upgrading to Production Email

When ready to send real emails:

1. Sign up at https://resend.com
2. Verify your domain
3. Create API key
4. Add to Vercel: `RESEND_API_KEY=re_xxxxxxxxxxxxx`
5. Change: `AUTH_PROVIDER=resend`
6. Redeploy

Users will then receive magic links via email instead of console logs.

---

**Need help?** Check [DEPLOYMENT.md](file://DEPLOYMENT.md) for full guide.
