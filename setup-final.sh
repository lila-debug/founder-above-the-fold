#!/bin/bash
# Founder Above the Fold — One-Click Setup
# Paste this into your terminal and run it

TOKEN="vcp_1a4Dhx8ksBBMie6lYVd8jCRRWcooNIrQNcQkM098hPDlb5x5ij3wRUIB"

echo "🔍 Finding your Vercel project..."
PROJECTS=$(curl -s "https://api.vercel.com/v9/projects?limit=20" \
  -H "Authorization: Bearer $TOKEN")

PROJECT_ID=$(echo "$PROJECTS" | grep -o '"id":"[^"]*"' | head -1 | sed 's/"id":"//' | sed 's/"//')
PROJECT_NAME=$(echo "$PROJECTS" | grep -o '"name":"[^"]*"' | head -1 | sed 's/"name":"//' | sed 's/"//')

if [ -z "$PROJECT_ID" ]; then
  echo "❌ No project found. Check your Vercel token."
  exit 1
fi

echo "✅ Found project: $PROJECT_NAME ($PROJECT_ID)"

echo ""
echo "📋 Checking environment variables..."
ENVS=$(curl -s "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $TOKEN")

# Check if DATABASE_URL exists
if echo "$ENVS" | grep -q "DATABASE_URL"; then
  echo "✅ DATABASE_URL is set"
else
  echo "⚠️  DATABASE_URL is missing. Please paste your Neon connection string."
  echo "   Get it from: Vercel Dashboard → Storage → Neon → Connection String"
  echo "   It looks like: postgresql://user:pass@host:port/db"
  read -p "   Paste connection string: " NEON_URL
  
  curl -s -X POST "https://api.vercel.com/v10/projects/$PROJECT_ID/env" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"key\":\"DATABASE_URL\",\"value\":\"$NEON_URL\",\"target\":[\"production\",\"preview\"],\"type\":\"encrypted\"}"
  echo "✅ DATABASE_URL added"
fi

echo ""
echo "🚀 Triggering deployment..."
curl -s -X POST "https://api.vercel.com/v13/deployments" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"projectId\":\"$PROJECT_ID\",\"target\":\"production\"}"

echo ""
echo "🎉 Done! Your app will be live at https://founderaccount.app in 2-3 minutes."
