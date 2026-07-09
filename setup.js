#!/usr/bin/env node
/**
 * Founder Above the Fold — One-Click Setup
 * 
 * What this does:
 * 1. Creates database tables in Neon
 * 2. Sets Vercel environment variables
 * 3. Triggers deployment
 * 
 * What you need (copy from your dashboards, paste below):
 * - NEON_CONNECTION_STRING: from Neon dashboard → Connection String
 * - VERCEL_API_TOKEN: from vercel.com/account/tokens → Create Token
 * - LINKEDIN_CLIENT_ID: from LinkedIn Developer App
 * - LINKEDIN_CLIENT_SECRET: from LinkedIn Developer App
 * - YOUR_EMAIL: your email address
 */

const fs = require('fs');
const { execSync } = require('child_process');

// ============================================================
// STEP 0: PASTE YOUR VALUES HERE
// ============================================================
const CONFIG = {
  NEON_CONNECTION_STRING: 'PASTE_NEON_CONNECTION_STRING_HERE',     // postgresql://user:pass@host/db
  VERCEL_API_TOKEN: 'PASTE_VERCEL_API_TOKEN_HERE',                   // from vercel.com/account/tokens
  LINKEDIN_CLIENT_ID: 'PASTE_LINKEDIN_CLIENT_ID_HERE',             // from LinkedIn Developer Portal
  LINKEDIN_CLIENT_SECRET: 'PASTE_LINKEDIN_CLIENT_SECRET_HERE',     // from LinkedIn Developer Portal
  YOUR_EMAIL: 'PASTE_YOUR_EMAIL_HERE',                               // your email for magic links
  VERCEL_PROJECT_ID: null,                                          // optional: if you know it
  VERCEL_TEAM_ID: null,                                             // optional: if you have a team
};

// ============================================================
// DO NOT EDIT BELOW THIS LINE
// ============================================================

function validate() {
  const required = ['NEON_CONNECTION_STRING', 'VERCEL_API_TOKEN', 'LINKEDIN_CLIENT_ID', 'LINKEDIN_CLIENT_SECRET', 'YOUR_EMAIL'];
  const missing = required.filter(k => !CONFIG[k] || CONFIG[k].startsWith('PASTE_'));
  if (missing.length > 0) {
    console.error('❌ MISSING VALUES. Paste these into the CONFIG object above:');
    missing.forEach(k => console.error(`   - ${k}`));
    console.error('\nWhere to find them:');
    console.error('   NEON_CONNECTION_STRING: Neon dashboard → Connection String');
    console.error('   VERCEL_API_TOKEN:         vercel.com/account/tokens → Create');
    console.error('   LINKEDIN_CLIENT_ID:       LinkedIn Developer Portal → Auth tab');
    console.error('   LINKEDIN_CLIENT_SECRET:   LinkedIn Developer Portal → Auth tab');
    console.error('   YOUR_EMAIL:               your email address');
    process.exit(1);
  }
}

async function setup() {
  console.log('🚀 Founder Above the Fold — One-Click Setup\n');
  validate();

  // Step 1: Find or create project
  console.log('Step 1: Finding Vercel project...');
  let projectId = CONFIG.VERCEL_PROJECT_ID;
  
  if (!projectId) {
    try {
      const projects = execSync(
        `curl -s "https://api.vercel.com/v9/projects" -H "Authorization: Bearer ${CONFIG.VERCEL_API_TOKEN}"`,
        { encoding: 'utf-8' }
      );
      const data = JSON.parse(projects);
      const project = data.projects.find(p => p.name === 'founder-above-the-fold' || p.name.includes('founder'));
      if (project) {
        projectId = project.id;
        console.log(`   Found project: ${project.name} (${project.id})`);
      } else {
        console.log('   No existing project found. Create one in Vercel and get the project ID from the URL.');
        console.log('   Then paste it into CONFIG.VERCEL_PROJECT_ID and run again.');
        process.exit(1);
      }
    } catch (e) {
      console.error('   Error listing projects:', e.message);
      process.exit(1);
    }
  }

  // Step 2: Create database tables
  console.log('\nStep 2: Creating database tables in Neon...');
  try {
    const schema = fs.readFileSync('./schema.sql', 'utf-8');
    execSync(
      `psql "${CONFIG.NEON_CONNECTION_STRING}" -c "${schema.replace(/"/g, '\\"').replace(/\n/g, ' ')}"`,
      { encoding: 'utf-8' }
    );
    console.log('   ✅ Tables created');
  } catch (e) {
    console.log('   ⚠️  Could not run psql (it may not be installed).');
    console.log('   Manual step: Open Neon Console → SQL Editor, paste schema.sql, click Run.');
    console.log('   Continue? (y/n)');
  }

  // Step 3: Set environment variables
  console.log('\nStep 3: Setting Vercel environment variables...');
  const envVars = [
    { key: 'DATABASE_URL', value: CONFIG.NEON_CONNECTION_STRING, target: ['production', 'preview'] },
    { key: 'LINKEDIN_CLIENT_ID', value: CONFIG.LINKEDIN_CLIENT_ID, target: ['production', 'preview'] },
    { key: 'LINKEDIN_CLIENT_SECRET', value: CONFIG.LINKEDIN_CLIENT_SECRET, target: ['production', 'preview'] },
    { key: 'LINKEDIN_REDIRECT_URI', value: 'https://founderaccount.app/api/auth/linkedin/callback', target: ['production'] },
    { key: 'LINKEDIN_REDIRECT_URI', value: 'http://localhost:3000/api/auth/linkedin/callback', target: ['preview'] },
    { key: 'NEXT_PUBLIC_APP_URL', value: 'https://founderaccount.app', target: ['production'] },
    { key: 'NEXT_PUBLIC_APP_URL', value: 'http://localhost:3000', target: ['preview'] },
    { key: 'DISPATCH_OWNER_EMAIL', value: CONFIG.YOUR_EMAIL, target: ['production', 'preview'] },
    { key: 'CRON_SECRET', value: randomString(32), target: ['production', 'preview'] },
    { key: 'MAGIC_LINK_SECRET', value: randomString(32), target: ['production', 'preview'] },
    { key: 'TOKEN_ENCRYPTION_KEY', value: randomString(32), target: ['production', 'preview'] },
  ];

  for (const env of envVars) {
    try {
      const payload = JSON.stringify({
        key: env.key,
        value: env.value,
        target: env.target,
        type: 'encrypted',
      });
      execSync(
        `curl -s -X POST "https://api.vercel.com/v10/projects/${projectId}/env" \
         -H "Authorization: Bearer ${CONFIG.VERCEL_API_TOKEN}" \
         -H "Content-Type: application/json" \
         -d '${payload}'`,
        { encoding: 'utf-8' }
      );
      console.log(`   ✅ ${env.key}`);
    } catch (e) {
      console.log(`   ⚠️  ${env.key} (may already exist)`);
    }
  }

  // Step 4: Trigger deployment
  console.log('\nStep 4: Triggering deployment...');
  try {
    execSync(
      `curl -s -X POST "https://api.vercel.com/v13/deployments" \
       -H "Authorization: Bearer ${CONFIG.VERCEL_API_TOKEN}" \
       -H "Content-Type: application/json" \
       -d '{"projectId":"${projectId}","target":"production"}'`,
      { encoding: 'utf-8' }
    );
    console.log('   ✅ Deployment triggered');
  } catch (e) {
    console.error('   ❌ Deployment failed:', e.message);
  }

  console.log('\n🎉 Setup complete! Your app should be live at https://founderaccount.app within 2-3 minutes.');
  console.log('   If LinkedIn access is not yet approved, the publish feature will not work yet.');
  console.log('   Check the Vercel dashboard for deployment status.');
}

function randomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

setup().catch(e => {
  console.error('Setup error:', e.message);
  process.exit(1);
});
