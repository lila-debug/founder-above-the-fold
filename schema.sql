-- Founder Above the Fold — PostgreSQL Schema (Raw, no Supabase)
-- Run this in your Neon SQL Editor (Storage > Open in Neon Console)

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

-- Posts (drafts, queued, published, failed, cancelled)
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

-- Templates (outreach, post scenarios)
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

-- Indexes for performance
CREATE INDEX idx_posts_owner_status ON posts(owner_id, status);
CREATE INDEX idx_posts_scheduled ON posts(scheduled_at) WHERE status = 'queued';
CREATE INDEX idx_voice_checks_post ON voice_checks(post_id);
CREATE INDEX idx_audit_log_owner ON audit_log(owner_id, created_at);
CREATE INDEX idx_oauth_tokens_owner ON oauth_tokens(owner_id);
CREATE INDEX idx_magic_link_tokens_email ON magic_link_tokens(email);

-- Insert default owner placeholder (replace with your email)
-- INSERT INTO owner_settings (email) VALUES ('your-email@example.com');
