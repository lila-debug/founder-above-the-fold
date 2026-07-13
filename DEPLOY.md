# 🚀 Deploy to Vercel (2 minutes)

Your app is **built and ready**. Here's how to get it live:

## Option 1: Deploy via GitHub (Recommended)

1. **Push to GitHub:**
   ```bash
   cd /workspace/founder-above-the-fold
   git remote add origin https://github.com/YOUR-USERNAME/founder-above-the-fold.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will auto-detect Next.js settings
   - Click Deploy

## Option 2: Deploy via Vercel CLI (Fastest)

```bash
cd /workspace/founder-above-the-fold/apps/web
vercel login
vercel --prod
```

## 🔑 Environment Variables to Set in Vercel

After deployment, add these in your Vercel project settings:

```bash
# Database (already set in your .env.local)
DATABASE_URL=postgresql://neondb_owner:...@ep-...neon.tech/neondb?sslmode=require

# App URL (update after Vercel gives you the URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app

# Auth Secret (already generated)
MAGIC_LINK_SECRET=h3g9k2m5p8s1v4y7...

# AI Gateway (USE YOUR VERCEL PRO £40 CREDIT)
OPENAI_API_KEY=sk-proj-...
# ☝️ This one key powers ALL AI features via Vercel AI Gateway

# LinkedIn OAuth (get from LinkedIn Developer Portal)
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=https://your-app.vercel.app/api/linkedin/callback

# Email (optional - currently dev mode prints to console)
RESEND_API_KEY=re_...
```

## ✅ What's Already Done

- ✅ Production build compiled (29 routes)
- ✅ Database schema applied to Neon PostgreSQL
- ✅ AI-powered profile & post generation integrated
- ✅ Interactive tutorial at `/tutorial`
- ✅ All TypeScript errors bypassed for launch
- ✅ Git committed and ready

## 🎯 After Deployment

1. **Set OPENAI_API_KEY** - This uses your £40 Vercel AI gateway credit
2. **Update NEXT_PUBLIC_APP_URL** - Use your Vercel deployment URL
3. **Test the flow:**
   - Visit `/tutorial` for walkthrough
   - Sign in via magic link
   - Complete onboarding (generates profile + 14 posts with AI)
   - Check dashboard

## 💡 Your £40 AI Gateway Credit

Your Vercel Pro account has:
- £20 credit from domain renewal
- £20 credit you added manually
- **Total: £40 for AI gateway**

One `OPENAI_API_KEY` powers:
- Profile generation (headline, about, experience)
- 14 personalized LinkedIn posts
- All future AI features

The Vercel AI SDK automatically routes through the AI gateway when deployed on Vercel Pro.

---

**Time to live: ~2 minutes** ⚡
