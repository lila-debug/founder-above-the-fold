-- Founder Above the Fold — Database Schema
-- Supabase/PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Owner settings (single-owner app)
CREATE TABLE owner_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- OAuth tokens (LinkedIn)
CREATE TABLE oauth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owner_settings(id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'linkedin',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  linkedin_member_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts (drafts, queued, published, failed)
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owner_settings(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  body_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'queued', 'publishing', 'published', 'failed', 'cancelled')),
  pillar TEXT,
  archetype TEXT,
  notes TEXT,
  scheduled_at TIMESTAMPTZ,
  published_at TIMESTAMPTZ,
  linkedin_post_id TEXT,
  linkedin_urn TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Voice checks
CREATE TABLE voice_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  body_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'passed', 'failed')),
  output TEXT,
  failures TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Profile copy (headline, about, experience, featured)
CREATE TABLE profile_copy (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owner_settings(id) ON DELETE CASCADE,
  field TEXT NOT NULL CHECK (field IN ('headline', 'about', 'experience', 'featured')),
  content TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  synced BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(owner_id, field)
);

-- Templates (outreach, outreach scenarios)
CREATE TABLE templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owner_settings(id) ON DELETE CASCADE,
  scenario_tag TEXT NOT NULL,
  body TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Post stats (analytics)
CREATE TABLE post_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  impressions INTEGER,
  likes INTEGER,
  comments INTEGER,
  shares INTEGER,
  pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Audit log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owner_settings(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Magic link tokens
CREATE TABLE magic_link_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Content pillars
CREATE TABLE content_pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES owner_settings(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_posts_owner_status ON posts(owner_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'queued';
CREATE INDEX idx_voice_checks_post ON voice_checks(post_id);
CREATE INDEX idx_audit_log_owner ON audit_log(owner_id, created_at);
CREATE INDEX idx_oauth_tokens_owner ON oauth_tokens(owner_id);

-- Row Level Security (RLS)
ALTER TABLE owner_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oauth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE profile_copy ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_pillars ENABLE ROW LEVEL SECURITY;

-- RLS Policies (owner-only access)
CREATE POLICY owner_settings_isolation ON owner_settings FOR ALL USING (email = current_setting('app.current_user_email', true));
CREATE POLICY oauth_tokens_isolation ON oauth_tokens FOR ALL USING (owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true)));
CREATE POLICY posts_isolation ON posts FOR ALL USING (owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true)));
CREATE POLICY voice_checks_isolation ON voice_checks FOR ALL USING (post_id IN (SELECT id FROM posts WHERE owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true))));
CREATE POLICY profile_copy_isolation ON profile_copy FOR ALL USING (owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true)));
CREATE POLICY templates_isolation ON templates FOR ALL USING (owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true)));
CREATE POLICY post_stats_isolation ON post_stats FOR ALL USING (post_id IN (SELECT id FROM posts WHERE owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true))));
CREATE POLICY audit_log_isolation ON audit_log FOR ALL USING (owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true)));
CREATE POLICY content_pillars_isolation ON content_pillars FOR ALL USING (owner_id IN (SELECT id FROM owner_settings WHERE email = current_setting('app.current_user_email', true)));
