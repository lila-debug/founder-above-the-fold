#!/bin/bash

# 🚀 ONE-COMMAND DEPLOY for Founder Above the Fold
# Run from: /workspace/founder-above-the-fold/apps/web

echo "════════════════════════════════════════════════════════════════"
echo "   🚀 Founder Above the Fold - Deploy to Vercel"
echo "════════════════════════════════════════════════════════════════"
echo ""

# Step 1: Login to Vercel
echo "📝 Step 1: Authenticating with Vercel..."
if ! vercel whoami &> /dev/null; then
    vercel login
else
    echo "✅ Already logged in as: $(vercel whoami)"
fi

echo ""
echo "════════════════════════════════════════════════════════════════"
echo ""

# Step 2: Deploy
echo "🚀 Step 2: Deploying to production..."
echo ""
vercel --prod

# Capture the URL
URL=$(vercel ls --prod 2>/dev/null | grep "founder-above-the-fold" | head -1 | awk '{print $2}')

echo ""
echo "════════════════════════════════════════════════════════════════"
echo "   ✅ DEPLOYMENT COMPLETE!"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "🌐 Your app is live at: $URL"
echo ""
echo "⚠️  IMPORTANT: Add environment variables in Vercel dashboard"
echo ""
echo "🔑 Required Environment Variables:"
echo "   1. OPENAI_API_KEY      - Use your £40 Vercel AI gateway credit"
echo "   2. DATABASE_URL        - Already in .env.local"
echo "   3. MAGIC_LINK_SECRET   - Already in .env.local"
echo "   4. NEXT_PUBLIC_APP_URL - Use: $URL"
echo ""
echo "📖 Full list in: .env.production.example"
echo ""
echo "🎯 After adding env vars, redeploy with: vercel --prod"
echo ""
echo "════════════════════════════════════════════════════════════════"
