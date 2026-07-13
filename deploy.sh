#!/bin/bash

# Quick deploy script for Founder Above the Fold
# Run this from /workspace/founder-above-the-fold/apps/web

echo "🚀 Deploying Founder Above the Fold..."
echo ""

# Check if logged in to Vercel
if ! vercel whoami &> /dev/null; then
    echo "📝 Not logged in to Vercel. Running login..."
    vercel login
fi

echo ""
echo "✅ Authenticated with Vercel"
echo ""
echo "🔨 Deploying to production..."
echo ""

# Deploy to production
vercel --prod

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🔑 Next steps:"
echo "1. Go to your Vercel dashboard"
echo "2. Add environment variables from .env.production.example"
echo "3. Set OPENAI_API_KEY to use your £40 AI gateway credit"
echo "4. Update NEXT_PUBLIC_APP_URL with your deployment URL"
echo "5. Redeploy to apply env vars"
echo ""
echo "📖 See DEPLOY.md for full instructions"
